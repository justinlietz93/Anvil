# Enhanced rebuild script for Anvil application
Write-Host "Starting enhanced rebuild process..." -ForegroundColor Cyan

# Ensure we are using the right Node.js settings
Write-Host "Setting up environment for native module building..." -ForegroundColor Cyan
$env:npm_config_msvs_version="2022"
$env:npm_config_target_platform="node"
$env:npm_config_runtime="electron"
$env:npm_config_target="35.1.5"

# Clean the previous build
Write-Host "Cleaning the webpack build directory..." -ForegroundColor Cyan
Remove-Item -Path '.webpack' -Recurse -ErrorAction SilentlyContinue
Remove-Item -Path 'node_modules/.cache' -Recurse -ErrorAction SilentlyContinue

# Install electron-rebuild if needed
if (!(Get-Command "electron-rebuild" -ErrorAction SilentlyContinue)) {
    Write-Host "Installing electron-rebuild to devDependencies..." -ForegroundColor Cyan
    npm install --save-dev electron-rebuild
    if (!$?) {
        Write-Host "Failed to install electron-rebuild. Proceeding anyway..." -ForegroundColor Yellow
    }
}

# Clean install dependencies
Write-Host "Clean installing dependencies..." -ForegroundColor Cyan
npm ci
if (!$?) {
    Write-Host "npm ci failed, falling back to npm install..." -ForegroundColor Yellow
    npm install
}

# Rebuild native modules specifically for this Electron version
Write-Host "Rebuilding native modules for Electron..." -ForegroundColor Cyan
npx electron-rebuild
if (!$?) {
    Write-Host "Warning: Native module rebuild may have failed. Continuing anyway..." -ForegroundColor Yellow
}

# Build the application
Write-Host "Building the application..." -ForegroundColor Green
npx electron-forge start
