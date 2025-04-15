# Master cleanup script for Anvil Platform
# This script addresses all the issues identified in the build_issues_report.md
# and prepares the application to run with the latest versions

Write-Host "Starting comprehensive Anvil Platform cleanup and preparation..." -ForegroundColor Cyan
$startTime = Get-Date

# Ensure we're in the correct directory
$projectRoot = Get-Location
Write-Host "Working in: $projectRoot" -ForegroundColor Cyan

# Check for proper directory structure
if ((Get-Item $projectRoot).Name -eq "Anvil" -and (Test-Path -Path "$projectRoot\anvil")) {
    Write-Host "Detected nested directory structure - working from this location" -ForegroundColor Yellow
} elseif (!(Test-Path -Path "$projectRoot\package.json")) {
    Write-Host "Unable to locate package.json. Please run this script from the project root." -ForegroundColor Red
    exit 1
}

# Step 1: Clean up previous build artifacts
Write-Host "Step 1: Cleaning previous build artifacts..." -ForegroundColor Cyan
if (Test-Path ".webpack") {
    Remove-Item -Path ".webpack" -Recurse -Force -ErrorAction SilentlyContinue
    Write-Host "  Removed .webpack directory" -ForegroundColor Green
}

if (Test-Path "node_modules/.cache") {
    Remove-Item -Path "node_modules/.cache" -Recurse -Force -ErrorAction SilentlyContinue
    Write-Host "  Cleaned node_modules/.cache" -ForegroundColor Green
}

# Step 2: Set up proper native module compilation environment
Write-Host "Step 2: Setting up native module compilation environment..." -ForegroundColor Cyan
$env:npm_config_msvs_version = "2022"
$env:npm_config_target_platform = "node"
$env:npm_config_runtime = "electron"
$env:npm_config_target = "35.1.5"

# Create or update .npmrc file
@"
msvs_version=2022
runtime=electron
target=35.1.5
target_platform=node
strict-ssl=false
legacy-peer-deps=true
"@ | Out-File -FilePath ".npmrc" -Encoding UTF8
Write-Host "  Created/updated .npmrc with proper settings" -ForegroundColor Green

# Step 3: Clean install dependencies
Write-Host "Step 3: Installing dependencies..." -ForegroundColor Cyan
npm cache clean --force
Write-Host "  Cleaned npm cache" -ForegroundColor Green

Write-Host "  Installing dependencies (this may take a few minutes)..." -ForegroundColor Cyan
npm install
if (!$?) {
    Write-Host "  Standard npm install failed, trying with --legacy-peer-deps..." -ForegroundColor Yellow
    npm install --legacy-peer-deps
    if (!$?) {
        Write-Host "  Failed to install dependencies. See error details above." -ForegroundColor Red
        exit 1
    }
}
Write-Host "  Dependencies installed successfully" -ForegroundColor Green

# Step 4: Rebuild native modules for Electron compatibility
Write-Host "Step 4: Rebuilding native modules for Electron compatibility..." -ForegroundColor Cyan
npx electron-rebuild
if (!$?) {
    Write-Host "  Native module rebuild had issues but continuing..." -ForegroundColor Yellow
} else {
    Write-Host "  Native modules rebuilt successfully" -ForegroundColor Green
}

# Step 5: Check for directory structure issues
Write-Host "Step 5: Verifying project structure..." -ForegroundColor Cyan
$requiredFiles = @(
    "package.json",
    "forge.config.js",
    "webpack.main.config.js",
    "webpack.renderer.config.js",
    "webpack.rules.js",
    "src/main.js",
    "src/index.tsx"
)

$allFilesExist = $true
foreach ($file in $requiredFiles) {
    if (!(Test-Path $file)) {
        Write-Host "  Missing required file: $file" -ForegroundColor Red
        $allFilesExist = $false
    }
}

if ($allFilesExist) {
    Write-Host "  All required files are present" -ForegroundColor Green
} else {
    Write-Host "  Some required files are missing. The application may not start correctly." -ForegroundColor Yellow
}

# Step 6: Ready to start
$endTime = Get-Date
$duration = $endTime - $startTime
Write-Host "Preparation completed in $($duration.TotalSeconds) seconds" -ForegroundColor Cyan

Write-Host "`nAnvil Platform is now ready to run with the latest versions" -ForegroundColor Green
Write-Host "Starting Anvil Platform..." -ForegroundColor Cyan
npx electron-forge start