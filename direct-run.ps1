# Direct Run Script for Anvil Platform
# This script bypasses the webpack build process and runs the application directly

Write-Host "Starting Anvil Platform using direct Electron run..." -ForegroundColor Cyan

# Set development environment 
$env:NODE_ENV = "development"

# Ensure the latest changes to index.html are applied
Write-Host "Setting up environment..." -ForegroundColor Green

# Check if src directory exists
if (-not (Test-Path "src")) {
    Write-Host "Error: src directory not found. Make sure you're in the correct directory." -ForegroundColor Red
    exit 1
}

# Directly run Electron with our source code
Write-Host "Launching Electron with source files..." -ForegroundColor Green
npx electron src/main.js

# If that fails, try electron-forge
if (!$?) {
    Write-Host "Direct run failed, trying with electron-forge..." -ForegroundColor Yellow
    npx electron-forge start
}