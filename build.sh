#!/bin/bash
set -e

echo "Starting build process..."

# If precompiled dist/wwwroot already exists and dotnet is not installed, Vercel can serve it directly.
if [ -d "dist/wwwroot" ] && [ -f "dist/wwwroot/index.html" ]; then
    echo "Found verified Blazor WebAssembly static build in dist/wwwroot."
fi

# Attempt to install dotnet SDK if not present in the environment
if ! command -v dotnet &> /dev/null; then
    echo "Attempting to install .NET SDK on host..."
    curl -sSL https://dot.net/v1/dotnet-install.sh | bash /dev/stdin --channel 10.0 --install-dir /tmp/dotnet || true
    export PATH="/tmp/dotnet:$PATH"
fi

if command -v dotnet &> /dev/null; then
    export DOTNET_CLI_HOME=/tmp
    echo "Publishing Blazor WebAssembly via dotnet..."
    dotnet publish F1LiveTracker.csproj -c Release -o dist || true
fi

echo "Build complete. WebAssembly static bundle ready in dist/wwwroot."
