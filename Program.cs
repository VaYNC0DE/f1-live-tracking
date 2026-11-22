using Microsoft.AspNetCore.Components.Web;
using Microsoft.AspNetCore.Components.WebAssembly.Hosting;
using F1LiveTracker;
using F1LiveTracker.Services;

var builder = WebAssemblyHostBuilder.CreateDefault(args);
builder.RootComponents.Add<App>("#app");
builder.RootComponents.Add<HeadOutlet>("head::after");

builder.Services.AddScoped(sp => new HttpClient { BaseAddress = new Uri(builder.HostEnvironment.BaseAddress) });
builder.Services.AddScoped<OpenF1Client>();
builder.Services.AddScoped<TimingTowerState>();
builder.Services.AddScoped<ThemeState>();

var host = builder.Build();

var theme = host.Services.GetRequiredService<ThemeState>();
await theme.InitializeAsync();

await host.RunAsync();
