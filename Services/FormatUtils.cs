namespace F1LiveTracker.Services;

public static class FormatUtils
{
    public static string FormatLapTime(double? seconds)
    {
        if (!seconds.HasValue || seconds.Value <= 0) return "--:--.---";
        var totalSeconds = seconds.Value;
        var mins = (int)(totalSeconds / 60);
        var remSecs = totalSeconds - (mins * 60);
        return $"{mins}:{remSecs:00.000}";
    }

    public static string FormatGap(int position, string? rawGap)
    {
        if (position == 1) return "LEADER";
        if (string.IsNullOrWhiteSpace(rawGap) || rawGap == "-") return "-";
        if (double.TryParse(rawGap.TrimStart('+'), out var val))
        {
            return val == 0 ? "LEADER" : $"+{val:F3}";
        }
        return rawGap.Trim();
    }
}
