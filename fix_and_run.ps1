# Improved script to fix path issues and run the Anvil application

Write-Host "Current directory: $(Get-Location)" -ForegroundColor Cyan

# Determine if we're in the correct directory structure
$projectRoot = Get-Location
if ((Get-Item $projectRoot).Name -eq "Anvil" -and (Test-Path -Path "$projectRoot\anvil")) {
    # We're in the nested directory structure - c:\git\Anvil\Anvil
    Write-Host "Detected nested directory structure - working from this location" -ForegroundColor Yellow
} elseif (!(Test-Path -Path "$projectRoot\src") -or !(Test-Path -Path "$projectRoot\package.json")) {
    Write-Host "Unable to locate project files. Please run this script from the project root." -ForegroundColor Red
    exit 1
}

# Clean previous build artifacts that might be causing issues
Write-Host "Cleaning build artifacts..." -ForegroundColor Cyan
if (Test-Path ".webpack") {
    Remove-Item -Path ".webpack" -Recurse -Force -ErrorAction SilentlyContinue
    if ($?) {
        Write-Host "Successfully removed old .webpack directory" -ForegroundColor Green
    } else {
        Write-Host "Failed to clean .webpack directory - it may be in use" -ForegroundColor Yellow
    }
}

# Install electron-rebuild if needed
if (!(Get-Command "electron-rebuild" -ErrorAction SilentlyContinue)) {
    Write-Host "Installing electron-rebuild globally..." -ForegroundColor Cyan
    npm install -g electron-rebuild
    if (!$?) {
        Write-Host "Failed to install electron-rebuild. Continuing anyway..." -ForegroundColor Yellow
    }
}

# Ensure dependencies are installed
Write-Host "Installing dependencies..." -ForegroundColor Cyan
npm install
if (!$?) {
    Write-Host "Failed to install dependencies. Attempting to fix..." -ForegroundColor Yellow
    npm cache clean --force
    npm install --no-package-lock
    if (!$?) {
        Write-Host "Failed to install dependencies after cleanup." -ForegroundColor Red
        exit 1
    }
}

# Rebuild native modules to ensure compatibility with Electron
Write-Host "Rebuilding native modules for Electron compatibility..." -ForegroundColor Cyan
npm run rebuild
if (!$?) {
    Write-Host "Native module rebuild failed. Attempting to continue anyway..." -ForegroundColor Yellow
}

# Create a .npmrc file with the correct C++ standard settings if it doesn't exist
if (!(Test-Path ".npmrc")) {
    Write-Host "Creating .npmrc file with correct compiler settings..." -ForegroundColor Cyan
    @"
msvs_version=2022
target_platform=node
runtime=electron
target=35.1.5
"@ | Out-File -FilePath ".npmrc" -Encoding UTF8
}

# Start the application
Write-Host "Starting Anvil application..." -ForegroundColor Green
npm start
if (!$?) {
    Write-Host "Failed to start the application. See error details above." -ForegroundColor Red
    exit 1
}
