using Microsoft.JSInterop;

namespace F1LiveTracker.Services;

public class ThemeState
{
    private readonly IJSRuntime _js;
    public string CurrentTheme { get; private set; } = "dark";
    public event Action? OnThemeChanged;

    public ThemeState(IJSRuntime js)
    {
        _js = js;
    }

    public async Task InitializeAsync()
    {
        try
        {
            var saved = await _js.InvokeAsync<string?>("localStorage.getItem", "f1_theme");
            if (saved == "light" || saved == "dark")
            {
                CurrentTheme = saved;
            }
            else
            {
                CurrentTheme = "dark";
            }
            await ApplyThemeAsync(CurrentTheme);
        }
        catch
        {
            CurrentTheme = "dark";
        }
    }

    public async Task ToggleThemeAsync()
    {
        CurrentTheme = CurrentTheme == "dark" ? "light" : "dark";
        await ApplyThemeAsync(CurrentTheme);
        OnThemeChanged?.Invoke();
    }

    private async Task ApplyThemeAsync(string theme)
    {
        try
        {
            await _js.InvokeVoidAsync("localStorage.setItem", "f1_theme", theme);
            await _js.InvokeVoidAsync("eval", $@"
                if ('{theme}' === 'dark') {{
                    document.documentElement.classList.add('dark');
                    document.documentElement.classList.remove('light');
                    document.documentElement.style.colorScheme = 'dark';
                }} else {{
                    document.documentElement.classList.remove('dark');
                    document.documentElement.classList.add('light');
                    document.documentElement.style.colorScheme = 'light';
                }}
            ");
        }
        catch
        {
            // Ignore in testing
        }
    }
}
