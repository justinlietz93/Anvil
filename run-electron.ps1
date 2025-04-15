# This script directly launches Electron with the main.js file for testing
Write-Host "Starting Anvil Platform directly with Electron..." -ForegroundColor Cyan

# Clean any previous webpack build if it exists
if (Test-Path ".webpack") {
    Write-Host "Cleaning previous webpack build..." -ForegroundColor Cyan
    Remove-Item -Path ".webpack" -Recurse -Force -ErrorAction SilentlyContinue
}

# Create minimal webpack structure
Write-Host "Creating minimal webpack structure..." -ForegroundColor Cyan
New-Item -Path ".webpack" -ItemType Directory -Force
New-Item -Path ".webpack\main" -ItemType Directory -Force
New-Item -Path ".webpack\renderer" -ItemType Directory -Force
New-Item -Path ".webpack\preload" -ItemType Directory -Force

# Copy source files to webpack structure
Write-Host "Copying files to webpack structure..." -ForegroundColor Cyan
Copy-Item -Path "src\main.js" -Destination ".webpack\main\index.js" -Force
Copy-Item -Path "src\preload.js" -Destination ".webpack\preload\index.js" -Force
Copy-Item -Path "src\index.html" -Destination ".webpack\renderer\index.html" -Force

# Create a basic renderer script
@"
// Simple renderer
document.addEventListener('DOMContentLoaded', () => {
  const root = document.getElementById('root');
  if (root) {
    root.innerHTML = '<h1>Anvil Platform</h1><p>The application is running in development mode.</p>';
  }
});
"@ | Out-File -FilePath ".webpack\renderer\index.js" -Encoding UTF8

# Launch electron with the webpack build
Write-Host "Launching Electron..." -ForegroundColor Green
npx electron .