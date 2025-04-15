# Enhanced run script with path correction for Anvil Platform
$currentDir = Get-Location
Write-Host "Running in: $currentDir" -ForegroundColor Cyan

# Check if we're in the right directory (should contain package.json)
if (-not (Test-Path "package.json")) {
    Write-Host "ERROR: package.json not found in current directory. This script must be run from the Anvil directory containing package.json." -ForegroundColor Red
    exit 1
}

# Set environment variables for proper native module building
Write-Host "Setting up build environment..." -ForegroundColor Cyan
$env:npm_config_msvs_version = "2022"
$env:npm_config_target_platform = "node"
$env:npm_config_runtime = "electron"
$env:npm_config_target = "35.1.5"

# Clean previous webpack build
Write-Host "Cleaning previous webpack build..." -ForegroundColor Cyan
if (Test-Path ".webpack") {
    Remove-Item -Path ".webpack" -Recurse -Force -ErrorAction SilentlyContinue
}

# Clean node_modules/.cache to ensure fresh build
if (Test-Path "node_modules/.cache") {
    Remove-Item -Path "node_modules/.cache" -Recurse -Force -ErrorAction SilentlyContinue
}

# Verify the webpack configuration files exist
if (-not (Test-Path "webpack.main.config.js")) {
    Write-Host "ERROR: webpack.main.config.js not found" -ForegroundColor Red
    exit 1
}

if (-not (Test-Path "webpack.renderer.config.js")) {
    Write-Host "ERROR: webpack.renderer.config.js not found" -ForegroundColor Red
    exit 1
}

Write-Host "All webpack config files verified" -ForegroundColor Green

# Install the electron-rebuild dependency if needed
if (-not (Test-Path "node_modules/.bin/electron-rebuild")) {
    Write-Host "Installing electron-rebuild..." -ForegroundColor Cyan
    npm install --save-dev electron-rebuild
}

# Rebuild native modules for correct Electron version
Write-Host "Rebuilding native modules for Electron..." -ForegroundColor Cyan
npx electron-rebuild
if (!$?) {
    Write-Host "Native module rebuild had issues but continuing..." -ForegroundColor Yellow
}

# Start the application
Write-Host "Starting the application..." -ForegroundColor Cyan
npx electron-forge start
