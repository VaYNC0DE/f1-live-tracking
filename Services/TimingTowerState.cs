using F1LiveTracker.Models;

namespace F1LiveTracker.Services;

public class TimingTowerState
{
    private readonly OpenF1Client _client;
    private CancellationTokenSource? _cts;

    public List<DriverTimingRow> Drivers { get; private set; } = new();
    public Session? CurrentSession { get; private set; }
    public List<Session> AvailableSessions { get; private set; } = new();
    public int SelectedYear { get; private set; } = 2026;
    public int? SelectedSessionKey { get; private set; }
    public bool IsLoading { get; private set; } = true;
    public bool IsLive { get; private set; }
    public string? ErrorMessage { get; private set; }
    public ActiveRaceControlStatus RaceControlStatus { get; private set; } = new("GREEN", "TRACK CLEAR", "All sectors green");
    public TrackState CurrentTrackState { get; private set; } = new("DRY", null, null, null, null, false, "ENABLED", "OFF", "GREEN", "TRACK CLEAR");
    public FastestPitStop? SessionFastestPitStop { get; private set; }
    public List<PitStopSummary> PitStops { get; private set; } = new();
    public int? SelectedCockpitDriverNumber { get; private set; }
    public DriverCockpitTelemetry? CockpitTelemetry { get; private set; }

    public event Action? OnChange;

    public TimingTowerState(OpenF1Client client)
    {
        _client = client;
    }

    public async Task InitializeAsync()
    {
        await ChangeYearAsync(SelectedYear);
        StartPollingLoop();
    }

    public async Task ChangeYearAsync(int year)
    {
        SelectedYear = year;
        IsLoading = true;
        NotifyStateChanged();

        AvailableSessions = await _client.GetSessionsByYearAsync(year);
        var initial = AvailableSessions.FirstOrDefault(s => s.SessionName.Contains("Race", StringComparison.OrdinalIgnoreCase))
                      ?? AvailableSessions.FirstOrDefault();

        if (initial != null)
        {
            await SelectSessionAsync(initial.SessionKey);
        }
        else
        {
            IsLoading = false;
            NotifyStateChanged();
        }
    }

    public async Task SelectSessionAsync(int sessionKey)
    {
        SelectedSessionKey = sessionKey;
        CurrentSession = AvailableSessions.FirstOrDefault(s => s.SessionKey == sessionKey);
        await RefreshTowerDataAsync(true);
    }

    public void SelectCockpitDriver(int driverNumber)
    {
        SelectedCockpitDriverNumber = driverNumber;
        _ = FetchCockpitTelemetryAsync();
        NotifyStateChanged();
    }

    private void StartPollingLoop()
    {
        _cts?.Cancel();
        _cts = new CancellationTokenSource();
        var token = _cts.Token;

        _ = Task.Run(async () =>
        {
            using var timer = new PeriodicTimer(TimeSpan.FromSeconds(5));
            while (!token.IsCancellationRequested && await timer.WaitForNextTickAsync(token))
            {
                await RefreshTowerDataAsync(false);
            }
        }, token);
    }

    public async Task RefreshTowerDataAsync(bool isInitial)
    {
        if (!SelectedSessionKey.HasValue) return;

        if (isInitial)
        {
            IsLoading = true;
            NotifyStateChanged();
        }

        try
        {
            var key = SelectedSessionKey.Value;

            // Sequential fetch with staggered delay
            var rawDrivers = await _client.GetDriversAsync(key);
            await Task.Delay(150);
            var rawIntervals = await _client.GetIntervalsAsync(key);
            await Task.Delay(150);
            var rawLaps = await _client.GetLapsAsync(key);
            await Task.Delay(150);
            var rawStints = await _client.GetStintsAsync(key);
            await Task.Delay(150);
            var rawRaceControl = await _client.GetRaceControlAsync(key);
            await Task.Delay(150);
            var rawPits = await _client.GetPitStopsAsync(key);
            await Task.Delay(150);
            var rawWeather = await _client.GetWeatherAsync(key);

            // Compute Race Control & Flags
            RaceControlStatus = ComputeRaceControl(rawRaceControl);
            CurrentTrackState = ComputeTrackState(rawWeather, RaceControlStatus);

            // Parse Pit Stops
            ParsePitStops(rawPits, rawDrivers);

            // Build Timing Tower Rows
            Drivers = BuildTimingTowerRows(rawDrivers, rawIntervals, rawLaps, rawStints);

            // Cockpit Telemetry
            await FetchCockpitTelemetryAsync();

            ErrorMessage = null;
        }
        catch (Exception ex)
        {
            ErrorMessage = ex.Message;
        }
        finally
        {
            IsLoading = false;
            NotifyStateChanged();
        }
    }

    private async Task FetchCockpitTelemetryAsync()
    {
        if (!SelectedSessionKey.HasValue) return;

        var targetDriverNum = SelectedCockpitDriverNumber
                              ?? Drivers.FirstOrDefault()?.DriverNumber;

        if (!targetDriverNum.HasValue) return;

        try
        {
            var points = await _client.GetCarTelemetryAsync(SelectedSessionKey.Value, targetDriverNum.Value);
            if (points.Count > 0)
            {
                var latest = points[^1];
                if (latest.Speed == 0)
                {
                    var active = points.AsEnumerable().Reverse().FirstOrDefault(p => p.Speed > 50);
                    if (active != null) latest = active;
                }

                var row = Drivers.FirstOrDefault(d => d.DriverNumber == targetDriverNum.Value) ?? Drivers.FirstOrDefault();
                if (row != null)
                {
                    CockpitTelemetry = new DriverCockpitTelemetry(
                        targetDriverNum.Value,
                        row.NameAcronym,
                        row.FullName,
                        row.TeamName,
                        row.TeamColor,
                        row.HeadshotUrl,
                        latest.Speed,
                        latest.NGear,
                        latest.Rpm,
                        latest.Throttle,
                        latest.Brake,
                        latest.IsDrsOpen,
                        latest.IsDrsArmed,
                        latest.Drs ?? 0,
                        latest.Date
                    );
                }
            }
        }
        catch
        {
            // Fallback gracefully
        }
    }

    private List<DriverTimingRow> BuildTimingTowerRows(
        List<Driver> drivers,
        List<Interval> intervals,
        List<Lap> laps,
        List<Stint> stints)
    {
        var driverDict = drivers.DistinctBy(d => d.DriverNumber).ToDictionary(d => d.DriverNumber);
        var intervalDict = intervals.GroupBy(i => i.DriverNumber).ToDictionary(g => g.Key, g => g.OrderByDescending(i => i.Date).First());
        var lapsByDriver = laps.GroupBy(l => l.DriverNumber).ToDictionary(g => g.Key, g => g.OrderBy(l => l.LapNumber).ToList());
        var stintsByDriver = stints.GroupBy(s => s.DriverNumber).ToDictionary(g => g.Key, g => g.OrderByDescending(s => s.StintNumber).First());

        double fastestOverallLap = double.PositiveInfinity;
        int? fastestDriverNum = null;
        foreach (var lap in laps)
        {
            if (lap.LapDuration.HasValue && lap.LapDuration.Value > 0 && lap.LapDuration.Value < fastestOverallLap)
            {
                fastestOverallLap = lap.LapDuration.Value;
                fastestDriverNum = lap.DriverNumber;
            }
        }

        var list = new List<DriverTimingRow>();

        foreach (var driver in driverDict.Values)
        {
            intervalDict.TryGetValue(driver.DriverNumber, out var inter);
            lapsByDriver.TryGetValue(driver.DriverNumber, out var driverLaps);
            stintsByDriver.TryGetValue(driver.DriverNumber, out var stint);

            var lastCompletedLap = driverLaps?.Where(l => l.LapDuration.HasValue && l.LapDuration.Value > 0).LastOrDefault();
            var pb = driverLaps?.Where(l => l.LapDuration.HasValue && l.LapDuration.Value > 0).MinBy(l => l.LapDuration!.Value);

            var gapStr = inter?.GapToLeader ?? "-";
            var intervalStr = inter?.IntervalValue ?? "-";

            var isPb = lastCompletedLap != null && pb != null && Math.Abs(lastCompletedLap.LapDuration!.Value - pb.LapDuration!.Value) < 0.001;
            var isFl = fastestDriverNum.HasValue && driver.DriverNumber == fastestDriverNum.Value;

            double parsedGap = 999999;
            if (gapStr == "0" || gapStr == "LEADER" || gapStr == "0.0") parsedGap = 0;
            else if (double.TryParse(gapStr.TrimStart('+'), out var gVal)) parsedGap = gVal;

            var compound = stint?.Compound?.ToUpperInvariant() ?? "UNKNOWN";
            var tyreAge = stint != null ? (driverLaps?.Count ?? 0) - stint.LapStart + stint.TyreAgeAtStart : 0;

            var pitCount = PitStops.Count(p => p.DriverNumber == driver.DriverNumber);
            var isFastestPit = SessionFastestPitStop?.DriverNumber == driver.DriverNumber;
            var bestPit = PitStops.Where(p => p.DriverNumber == driver.DriverNumber).MinBy(p => p.Duration)?.Duration;

            // DRS eligibility (< 1.0s behind car ahead)
            var isDrsEligible = false;
            if (double.TryParse(intervalStr.TrimStart('+'), out var intVal) && intVal > 0 && intVal <= 1.000)
            {
                isDrsEligible = true;
            }

            var teamColor = TeamColors.GetTeamColor(driver.TeamName, driver.TeamColour);

            list.Add(new DriverTimingRow(
                0,
                driver.DriverNumber,
                driver.NameAcronym,
                $"{driver.FirstName} {driver.LastName}".Trim(),
                driver.TeamName,
                teamColor,
                driver.HeadshotUrl,
                compound,
                Math.Max(0, tyreAge),
                intervalStr,
                gapStr,
                lastCompletedLap?.LapDuration,
                isPb,
                isFl,
                driverLaps?.LastOrDefault()?.IsPitOutLap ?? false,
                pitCount,
                isFastestPit,
                bestPit,
                isDrsEligible ? "ELIGIBLE" : "INELIGIBLE"
            ));
        }

        // Sort by position / gap
        var sorted = list.OrderBy(d => d.GapToLeader == "LEADER" ? 0 : 1)
                         .ThenBy(d => double.TryParse(d.GapToLeader.TrimStart('+'), out var g) ? g : 99999)
                         .Select((d, idx) => d with { Position = idx + 1 })
                         .ToList();

        return sorted;
    }

    private void ParsePitStops(List<PitStop> rawPits, List<Driver> rawDrivers)
    {
        var driverDict = rawDrivers.ToDictionary(d => d.DriverNumber);
        var summaries = new List<PitStopSummary>();

        foreach (var p in rawPits)
        {
            var duration = p.StopDuration ?? p.LaneDuration ?? p.PitDuration ?? 0;
            if (duration <= 0) continue;

            driverDict.TryGetValue(p.DriverNumber, out var d);
            summaries.Add(new PitStopSummary(
                p.DriverNumber,
                d?.NameAcronym ?? $"#{p.DriverNumber}",
                d?.TeamName ?? "F1 Team",
                TeamColors.GetTeamColor(d?.TeamName, d?.TeamColour),
                p.LapNumber,
                duration,
                p.StopDuration.HasValue,
                p.Date
            ));
        }

        PitStops = summaries.OrderBy(s => s.Duration).ToList();
        var fastest = PitStops.FirstOrDefault();
        if (fastest != null)
        {
            driverDict.TryGetValue(fastest.DriverNumber, out var d);
            SessionFastestPitStop = new FastestPitStop(
                fastest.DriverNumber,
                fastest.NameAcronym,
                fastest.TeamName,
                fastest.TeamColor,
                d?.HeadshotUrl,
                fastest.LapNumber,
                fastest.Duration,
                fastest.IsStationary
            );
        }
        else
        {
            SessionFastestPitStop = null;
        }
    }

    private static ActiveRaceControlStatus ComputeRaceControl(List<RaceControlMessage> messages)
    {
        foreach (var msg in messages.OrderByDescending(m => m.Date))
        {
            var raw = (msg.Message ?? "").ToUpperInvariant();
            var flag = (msg.Flag ?? "").ToUpperInvariant();

            if (flag == "RED" || raw.Contains("RED FLAG") || raw.Contains("SESSION SUSPENDED"))
            {
                return new("RED", "SESSION SUSPENDED", msg.Message ?? "Session Suspended", msg.Sector, msg.Date);
            }
            if (raw.Contains("VIRTUAL SAFETY CAR") || raw.Contains("VSC"))
            {
                if (!raw.Contains("ENDING") && !raw.Contains("CLEAR"))
                    return new("VIRTUAL SAFETY CAR", "VIRTUAL SAFETY CAR", msg.Message ?? "VSC Deployed", msg.Sector, msg.Date);
            }
            if (raw.Contains("SAFETY CAR"))
            {
                if (!raw.Contains("ENDING") && !raw.Contains("CLEAR") && !raw.Contains("IN THIS LAP"))
                    return new("SAFETY CAR", "SAFETY CAR", msg.Message ?? "Safety Car Deployed", msg.Sector, msg.Date);
            }
            if (flag.Contains("YELLOW"))
            {
                return new("YELLOW", msg.Sector.HasValue ? $"YELLOW FLAG - SECTOR {msg.Sector}" : "YELLOW FLAG", msg.Message ?? "Yellow Flag", msg.Sector, msg.Date);
            }
            if (flag == "CLEAR" || flag == "GREEN" || raw.Contains("TRACK CLEAR"))
            {
                return new("GREEN", "TRACK CLEAR", msg.Message ?? "Track Clear", msg.Sector, msg.Date);
            }
        }

        return new("GREEN", "TRACK CLEAR", "All sectors green");
    }

    private static TrackState ComputeTrackState(List<TrackWeather> weatherList, ActiveRaceControlStatus rc)
    {
        var latest = weatherList.OrderByDescending(w => w.Date).FirstOrDefault();
        var condition = latest?.Rainfall > 0 ? "WET" : "DRY";
        var drs = rc.Type == "RED" || rc.Type == "SAFETY CAR" || rc.Type == "VIRTUAL SAFETY CAR" ? "DISABLED" : "ENABLED";
        var sc = rc.Type switch
        {
            "SAFETY CAR" => "DEPLOYED",
            "VIRTUAL SAFETY CAR" => "VSC",
            _ => "OFF"
        };

        return new TrackState(
            condition,
            latest?.TrackTemperature,
            latest?.AirTemperature,
            latest?.Humidity,
            latest?.WindSpeed,
            latest?.Rainfall > 0,
            drs,
            sc,
            rc.Type,
            rc.Label
        );
    }

    private void NotifyStateChanged() => OnChange?.Invoke();
}
