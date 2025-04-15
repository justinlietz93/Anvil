# Enhanced rebuild and start script for Anvil application
Write-Host "Starting enhanced rebuild and start process..." -ForegroundColor Cyan

# Clean the build cache
Write-Host "Cleaning build cache..." -ForegroundColor Cyan
Remove-Item -Path 'node_modules\.cache' -Recurse -ErrorAction SilentlyContinue

# Set environment variables for proper native module building
Write-Host "Setting up build environment..." -ForegroundColor Cyan
$env:npm_config_msvs_version = "2022"
$env:npm_config_target_platform = "node"
$env:npm_config_runtime = "electron"
$env:npm_config_target = "35.1.5"

# Clean previous webpack output
if (Test-Path ".webpack") {
    Write-Host "Removing previous webpack output..." -ForegroundColor Cyan
    Remove-Item -Path ".webpack" -Recurse -Force -ErrorAction SilentlyContinue
}

# Rebuild native modules
Write-Host "Rebuilding native modules for Electron compatibility..." -ForegroundColor Cyan
npx electron-rebuild
if (!$?) {
    Write-Host "Warning: Native module rebuild had issues but continuing..." -ForegroundColor Yellow
}

# Install any missing dependencies
Write-Host "Ensuring dependencies are installed..." -ForegroundColor Cyan
npm install

# Start the app
Write-Host "Starting Anvil application..." -ForegroundColor Green
npx electron-forge start
