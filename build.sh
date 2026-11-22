#!/bin/bash
set -e

echo "Starting Vercel Blazor WebAssembly build..."

# Ensure unhashed blazor.webassembly.js exists
if [ -d "dist/wwwroot/_framework" ]; then
    BLAZOR_JS=$(find dist/wwwroot/_framework -name "blazor.webassembly*.js" | head -n 1)
    if [ -n "$BLAZOR_JS" ] && [ ! -f "dist/wwwroot/_framework/blazor.webassembly.js" ]; then
        cp "$BLAZOR_JS" "dist/wwwroot/_framework/blazor.webassembly.js"
    fi
fi

# Verify precompiled dist/wwwroot bundle
if [ -d "dist/wwwroot" ] && [ -f "dist/wwwroot/index.html" ]; then
    echo "Found precompiled Blazor WebAssembly static assets in dist/wwwroot."
    echo "Ready for Vercel deployment."
    exit 0
fi

# Fallback compile if dotnet is present
if command -v dotnet &> /dev/null; then
    export DOTNET_CLI_HOME=/tmp
    echo "Publishing Blazor WebAssembly project..."
    dotnet publish F1LiveTracker.csproj -c Release -o dist
fi

# Ensure unhashed blazor.webassembly.js exists
if [ -d "dist/wwwroot/_framework" ]; then
    BLAZOR_JS=$(find dist/wwwroot/_framework -name "blazor.webassembly*.js" | head -n 1)
    if [ -n "$BLAZOR_JS" ] && [ ! -f "dist/wwwroot/_framework/blazor.webassembly.js" ]; then
        cp "$BLAZOR_JS" "dist/wwwroot/_framework/blazor.webassembly.js"
    fi
fi
