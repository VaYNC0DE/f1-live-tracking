# F1 Live Timing Tower (C# Blazor WebAssembly)

A real-time Formula 1 broadcast timing tower, cockpit telemetry feed, and strategy tracker written in **C#** and running entirely in the browser via **Blazor WebAssembly (.NET 10)**.

Powered by the [OpenF1 API](https://openf1.org).

---

## 🏎️ Features
- **Timing Tower**: Real-time position tracking, live intervals, gaps, tyre compound ages (`S`, `M`, `H`, `I`, `W`), pit counts, and DRS detection zone indicators (`< 1.0s`).
- **Fastest Lap Recognition**: Automatic purple session-best lap highlighting (`FL`).
- **Cockpit & DRS Wing Flap Telemetry**: Single-car focused high-frequency telemetry with physical DRS flap status (`OPEN` vs `CLOSED`), speed, gear, 15-LED RPM rev lights, and throttle/brake pedal readouts.
- **Fastest Pit Stop Hero & Leaderboard**: DHL stationary box duration ranking and pit lane transit telemetry.
- **Track State & Safety Car Tracker**: Real-time meteorological readings, live track condition (`DRY`/`WET`), Safety Car (`SC`), Virtual Safety Car (`VSC`), and Red Flag session suspended status banners.
- **Theme Toggle**: Sleek Light and Dark broadcast aesthetic.

---

## 🛠️ Tech Stack
- **C# / .NET 10**
- **Blazor WebAssembly Standalone** (runs 100% in the client browser)
- **Tailwind CSS** (via broadcast theme engine)
- **OpenF1 REST API**
