using System.Text.Json.Serialization;

namespace F1LiveTracker.Models;

public record Session(
    [property: JsonPropertyName("session_key")] int SessionKey,
    [property: JsonPropertyName("session_name")] string SessionName,
    [property: JsonPropertyName("date_start")] DateTime DateStart,
    [property: JsonPropertyName("date_end")] DateTime DateEnd,
    [property: JsonPropertyName("gmt_offset")] string? GmtOffset,
    [property: JsonPropertyName("session_type")] string? SessionType,
    [property: JsonPropertyName("meeting_key")] int? MeetingKey,
    [property: JsonPropertyName("location")] string? Location,
    [property: JsonPropertyName("country_name")] string? CountryName,
    [property: JsonPropertyName("circuit_key")] int? CircuitKey,
    [property: JsonPropertyName("circuit_short_name")] string? CircuitShortName,
    [property: JsonPropertyName("year")] int Year
);

public record Driver(
    [property: JsonPropertyName("driver_number")] int DriverNumber,
    [property: JsonPropertyName("broadcast_name")] string? BroadcastName,
    [property: JsonPropertyName("full_name")] string? FullName,
    [property: JsonPropertyName("name_acronym")] string NameAcronym,
    [property: JsonPropertyName("team_name")] string TeamName,
    [property: JsonPropertyName("team_colour")] string? TeamColour,
    [property: JsonPropertyName("first_name")] string? FirstName,
    [property: JsonPropertyName("last_name")] string? LastName,
    [property: JsonPropertyName("headshot_url")] string? HeadshotUrl,
    [property: JsonPropertyName("country_code")] string? CountryCode,
    [property: JsonPropertyName("session_key")] int? SessionKey
);

public record Interval(
    [property: JsonPropertyName("driver_number")] int DriverNumber,
    [property: JsonPropertyName("gap_to_leader")] object? RawGapToLeader,
    [property: JsonPropertyName("interval")] object? RawInterval,
    [property: JsonPropertyName("date")] DateTime Date,
    [property: JsonPropertyName("session_key")] int? SessionKey
)
{
    public string? GapToLeader => RawGapToLeader?.ToString();
    public string? IntervalValue => RawInterval?.ToString();
}

public record Lap(
    [property: JsonPropertyName("driver_number")] int DriverNumber,
    [property: JsonPropertyName("lap_number")] int LapNumber,
    [property: JsonPropertyName("lap_duration")] double? LapDuration,
    [property: JsonPropertyName("is_pit_out_lap")] bool? IsPitOutLap,
    [property: JsonPropertyName("duration_sector_1")] double? DurationSector1,
    [property: JsonPropertyName("duration_sector_2")] double? DurationSector2,
    [property: JsonPropertyName("duration_sector_3")] double? DurationSector3,
    [property: JsonPropertyName("date_start")] string? DateStart,
    [property: JsonPropertyName("session_key")] int? SessionKey
);

public record Stint(
    [property: JsonPropertyName("driver_number")] int DriverNumber,
    [property: JsonPropertyName("stint_number")] int StintNumber,
    [property: JsonPropertyName("compound")] string Compound,
    [property: JsonPropertyName("tyre_age_at_start")] int TyreAgeAtStart,
    [property: JsonPropertyName("lap_start")] int LapStart,
    [property: JsonPropertyName("lap_end")] int? LapEnd,
    [property: JsonPropertyName("session_key")] int? SessionKey
);

public record PitStop(
    [property: JsonPropertyName("driver_number")] int DriverNumber,
    [property: JsonPropertyName("lap_number")] int LapNumber,
    [property: JsonPropertyName("pit_duration")] double? PitDuration,
    [property: JsonPropertyName("lane_duration")] double? LaneDuration,
    [property: JsonPropertyName("stop_duration")] double? StopDuration,
    [property: JsonPropertyName("date")] DateTime Date,
    [property: JsonPropertyName("session_key")] int? SessionKey
);

public record CarData(
    [property: JsonPropertyName("driver_number")] int DriverNumber,
    [property: JsonPropertyName("rpm")] int Rpm,
    [property: JsonPropertyName("speed")] int Speed,
    [property: JsonPropertyName("n_gear")] int NGear,
    [property: JsonPropertyName("throttle")] int Throttle,
    [property: JsonPropertyName("brake")] int Brake,
    [property: JsonPropertyName("drs")] int? Drs,
    [property: JsonPropertyName("date")] DateTime Date,
    [property: JsonPropertyName("session_key")] int? SessionKey
)
{
    public bool IsDrsOpen => Drs.HasValue && Drs.Value >= 10;
    public bool IsDrsArmed => Drs.HasValue && Drs.Value == 8;
}

public record RaceControlMessage(
    [property: JsonPropertyName("date")] DateTime Date,
    [property: JsonPropertyName("category")] string? Category,
    [property: JsonPropertyName("message")] string Message,
    [property: JsonPropertyName("flag")] string? Flag,
    [property: JsonPropertyName("scope")] string? Scope,
    [property: JsonPropertyName("sector")] int? Sector,
    [property: JsonPropertyName("session_key")] int? SessionKey
);

public record TrackWeather(
    [property: JsonPropertyName("air_temperature")] double? AirTemperature,
    [property: JsonPropertyName("track_temperature")] double? TrackTemperature,
    [property: JsonPropertyName("humidity")] double? Humidity,
    [property: JsonPropertyName("pressure")] double? Pressure,
    [property: JsonPropertyName("wind_speed")] double? WindSpeed,
    [property: JsonPropertyName("wind_direction")] int? WindDirection,
    [property: JsonPropertyName("rainfall")] int? Rainfall,
    [property: JsonPropertyName("date")] DateTime Date,
    [property: JsonPropertyName("session_key")] int? SessionKey
);

public record DriverTimingRow(
    int Position,
    int DriverNumber,
    string NameAcronym,
    string FullName,
    string TeamName,
    string TeamColor,
    string? HeadshotUrl,
    string TyreCompound,
    int TyreAgeLaps,
    string IntervalToAhead,
    string GapToLeader,
    double? LastLapTime,
    bool IsPersonalBest,
    bool IsFastestLap,
    bool InPit,
    int PitStopCount,
    bool IsFastestPitStop,
    double? BestPitStopDuration,
    string DrsState // "ELIGIBLE", "ACTIVE", "INELIGIBLE"
);

public record TrackState(
    string Condition, // "DRY", "WET"
    double? TrackTemp,
    double? AirTemp,
    double? Humidity,
    double? WindSpeed,
    bool Rainfall,
    string DrsStatus, // "ENABLED", "DISABLED"
    string SafetyCarStatus, // "OFF", "DEPLOYED", "VSC", "IN_THIS_LAP"
    string Flag, // "GREEN", "YELLOW", "RED", "CLEAR"
    string FlagLabel
);

public record ActiveRaceControlStatus(
    string Type, // "RED", "SAFETY CAR", "VIRTUAL SAFETY CAR", "YELLOW", "GREEN"
    string Label,
    string Message,
    int? Sector = null,
    DateTime? Timestamp = null
);

public record FastestPitStop(
    int DriverNumber,
    string NameAcronym,
    string TeamName,
    string TeamColor,
    string? HeadshotUrl,
    int LapNumber,
    double Duration,
    bool IsStationary
);

public record PitStopSummary(
    int DriverNumber,
    string NameAcronym,
    string TeamName,
    string TeamColor,
    int LapNumber,
    double Duration,
    bool IsStationary,
    DateTime Timestamp
);

public record DriverCockpitTelemetry(
    int DriverNumber,
    string NameAcronym,
    string FullName,
    string TeamName,
    string TeamColor,
    string? HeadshotUrl,
    int Speed,
    int Gear,
    int Rpm,
    int Throttle,
    int Brake,
    bool IsDrsOpen,
    bool IsDrsArmed,
    int DrsRawValue,
    DateTime Timestamp
);
