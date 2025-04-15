# Enhanced Start script for Anvil application
Write-Host "Starting Anvil application..." -ForegroundColor Cyan

# Set environment variables for proper native module building
Write-Host "Setting up build environment..." -ForegroundColor Cyan
$env:npm_config_msvs_version = "2022"
$env:npm_config_target_platform = "node"
$env:npm_config_runtime = "electron"
$env:npm_config_target = "35.1.5"

# Check if electron-rebuild is installed
if (-not (Test-Path "node_modules/.bin/electron-rebuild")) {
    Write-Host "Installing electron-rebuild..." -ForegroundColor Cyan
    npm install --save-dev electron-rebuild
}

# Start the application using electron-forge
Write-Host "Starting application with electron-forge..." -ForegroundColor Green
npx electron-forge start
