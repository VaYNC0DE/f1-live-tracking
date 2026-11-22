using System.Net.Http.Json;
using System.Text.Json;
using F1LiveTracker.Models;

namespace F1LiveTracker.Services;

public class OpenF1Client
{
    private readonly HttpClient _http;
    private const string BaseUrl = "https://api.openf1.org/v1";
    private readonly Dictionary<string, (object Data, DateTime ExpiresAt)> _cache = new();
    public string? AuthToken { get; set; }

    public OpenF1Client(HttpClient http)
    {
        _http = http;
    }

    public async Task<List<Session>> GetSessionsByYearAsync(int year)
    {
        var cacheKey = $"sessions_{year}";
        if (_cache.TryGetValue(cacheKey, out var entry) && entry.ExpiresAt > DateTime.UtcNow)
        {
            return (List<Session>)entry.Data;
        }

        try
        {
            var sessions = await FetchWithRetryAsync<List<Session>>($"{BaseUrl}/sessions?year={year}");
            if (sessions != null && sessions.Count > 0)
            {
                var sorted = sessions.OrderByDescending(s => s.DateStart).ToList();
                _cache[cacheKey] = (sorted, DateTime.UtcNow.AddMinutes(15));
                return sorted;
            }
        }
        catch (Exception ex)
        {
            Console.WriteLine($"Failed to fetch {year} sessions from OpenF1: {ex.Message}");
        }

        // Fallback calendar list so the UI always has Grand Prix sessions to display
        return GetFallbackSessions(year);
    }

    public async Task<List<Driver>> GetDriversAsync(int sessionKey)
    {
        return await FetchCachedAsync<List<Driver>>($"drivers_{sessionKey}", $"{BaseUrl}/drivers?session_key={sessionKey}", TimeSpan.FromMinutes(10)) ?? new();
    }

    public async Task<List<Interval>> GetIntervalsAsync(int sessionKey)
    {
        return await FetchCachedAsync<List<Interval>>($"intervals_{sessionKey}", $"{BaseUrl}/intervals?session_key={sessionKey}", TimeSpan.FromSeconds(5)) ?? new();
    }

    public async Task<List<Lap>> GetLapsAsync(int sessionKey)
    {
        return await FetchCachedAsync<List<Lap>>($"laps_{sessionKey}", $"{BaseUrl}/laps?session_key={sessionKey}", TimeSpan.FromSeconds(5)) ?? new();
    }

    public async Task<List<Stint>> GetStintsAsync(int sessionKey)
    {
        return await FetchCachedAsync<List<Stint>>($"stints_{sessionKey}", $"{BaseUrl}/stints?session_key={sessionKey}", TimeSpan.FromSeconds(15)) ?? new();
    }

    public async Task<List<PitStop>> GetPitStopsAsync(int sessionKey)
    {
        return await FetchCachedAsync<List<PitStop>>($"pits_{sessionKey}", $"{BaseUrl}/pit?session_key={sessionKey}", TimeSpan.FromSeconds(15)) ?? new();
    }

    public async Task<List<RaceControlMessage>> GetRaceControlAsync(int sessionKey)
    {
        return await FetchCachedAsync<List<RaceControlMessage>>($"race_control_{sessionKey}", $"{BaseUrl}/race_control?session_key={sessionKey}", TimeSpan.FromSeconds(5)) ?? new();
    }

    public async Task<List<TrackWeather>> GetWeatherAsync(int sessionKey)
    {
        return await FetchCachedAsync<List<TrackWeather>>($"weather_{sessionKey}", $"{BaseUrl}/weather?session_key={sessionKey}", TimeSpan.FromSeconds(30)) ?? new();
    }

    public async Task<List<CarData>> GetCarTelemetryAsync(int sessionKey, int driverNumber, string? dateGte = null)
    {
        var url = $"{BaseUrl}/car_data?session_key={sessionKey}&driver_number={driverNumber}";
        if (!string.IsNullOrWhiteSpace(dateGte))
        {
            url += $"&date>={dateGte}";
        }
        return await FetchCachedAsync<List<CarData>>($"car_{sessionKey}_{driverNumber}_{dateGte}", url, TimeSpan.FromSeconds(3)) ?? new();
    }

    private async Task<T?> FetchCachedAsync<T>(string cacheKey, string url, TimeSpan ttl)
    {
        if (_cache.TryGetValue(cacheKey, out var entry) && entry.ExpiresAt > DateTime.UtcNow)
        {
            return (T)entry.Data;
        }

        try
        {
            var data = await FetchWithRetryAsync<T>(url);
            if (data != null)
            {
                _cache[cacheKey] = (data, DateTime.UtcNow.Add(ttl));
                return data;
            }
        }
        catch (Exception ex)
        {
            Console.WriteLine($"Error fetching {url}: {ex.Message}");
            if (_cache.TryGetValue(cacheKey, out var stale))
            {
                return (T)stale.Data;
            }
        }

        return default;
    }

    private async Task<T?> FetchWithRetryAsync<T>(string url)
    {
        using var request = new HttpRequestMessage(HttpMethod.Get, url);
        request.Headers.Accept.Add(new System.Net.Http.Headers.MediaTypeWithQualityHeaderValue("application/json"));

        if (!string.IsNullOrWhiteSpace(AuthToken))
        {
            request.Headers.Authorization = new System.Net.Http.Headers.AuthenticationHeaderValue("Bearer", AuthToken);
        }

        var response = await _http.SendAsync(request);

        if (response.StatusCode == System.Net.HttpStatusCode.NotFound)
        {
            return default;
        }

        if (response.StatusCode == System.Net.HttpStatusCode.Unauthorized)
        {
            throw new InvalidOperationException("OpenF1 live session lockdown active (HTTP 401). API key required during live sessions.");
        }

        if (response.StatusCode == (System.Net.HttpStatusCode)429)
        {
            await Task.Delay(1500);
            return default;
        }

        response.EnsureSuccessStatusCode();
        return await response.Content.ReadFromJsonAsync<T>();
    }

    private static List<Session> GetFallbackSessions(int year)
    {
        if (year == 2026)
        {
            return new List<Session>
            {
                new(11404, "Race", DateTime.Parse("2026-10-25T19:00:00Z"), DateTime.Parse("2026-10-25T21:00:00Z"), "-06:00", "Race", 1248, "Mexico City", "Mexico", 14, "Mexico City", 2026),
                new(11405, "Practice 1", DateTime.Parse("2026-11-06T14:30:00Z"), DateTime.Parse("2026-11-06T15:30:00Z"), "-03:00", "Practice", 1249, "São Paulo", "Brazil", 15, "Interlagos", 2026),
                new(11406, "Race", DateTime.Parse("2026-11-08T17:00:00Z"), DateTime.Parse("2026-11-08T19:00:00Z"), "-03:00", "Race", 1249, "São Paulo", "Brazil", 15, "Interlagos", 2026)
            };
        }

        return new List<Session>
        {
            new(9158, "Race", DateTime.Parse("2023-09-17T12:00:00Z"), DateTime.Parse("2023-09-17T14:00:00Z"), "+08:00", "Race", 1219, "Marina Bay", "Singapore", 61, "Marina Bay", year)
        };
    }
}
