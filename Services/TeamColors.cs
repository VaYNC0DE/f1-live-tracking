namespace F1LiveTracker.Services;

public static class TeamColors
{
    private static readonly Dictionary<string, string> Colors = new(StringComparer.OrdinalIgnoreCase)
    {
        { "Red Bull", "#3671C6" },
        { "Red Bull Racing", "#3671C6" },
        { "Ferrari", "#E80020" },
        { "Mercedes", "#27F4D2" },
        { "McLaren", "#FF8000" },
        { "Aston Martin", "#229971" },
        { "Alpine", "#FF87BC" },
        { "Williams", "#64C4FF" },
        { "Racing Bulls", "#6692FF" },
        { "RB", "#6692FF" },
        { "AlphaTauri", "#5E8FAA" },
        { "Kick Sauber", "#52E252" },
        { "Sauber", "#52E252" },
        { "Audi", "#E2001A" },
        { "Haas", "#B6BABD" },
        { "Haas F1 Team", "#B6BABD" }
    };

    public static string GetTeamColor(string? teamName, string? apiColour = null)
    {
        if (!string.IsNullOrWhiteSpace(apiColour))
        {
            var clean = apiColour.Trim().TrimStart('#');
            if (clean.Length == 6)
            {
                return $"#{clean.ToUpperInvariant()}";
            }
        }

        if (string.IsNullOrWhiteSpace(teamName)) return "#808080";

        foreach (var (key, value) in Colors)
        {
            if (teamName.Contains(key, StringComparison.OrdinalIgnoreCase))
            {
                return value;
            }
        }

        return "#808080";
    }
}
