Write-Host "Starting Ratings Platform Application"
Write-Host ""

Write-Host "Checking if MySQL is running..."
$mysqlService = Get-Service -Name "MySQL80" -ErrorAction SilentlyContinue
if ($mysqlService -and $mysqlService.Status -eq "Running") {
    Write-Host "MySQL is running"
} else {
    Write-Host "MySQL80 service is not running"
    Write-Host "Please start MySQL by running: net start MySQL80"
    Read-Host "Press Enter to exit"
    exit 1
}
Write-Host ""

Write-Host "Installing backend dependencies..."
Set-Location "$PSScriptRoot\server"
npm install
Write-Host "Backend done"
Write-Host ""

Write-Host "Installing frontend dependencies..."
Set-Location "$PSScriptRoot\client"
npm install
Write-Host "Frontend done"
Write-Host ""

Write-Host "Starting Backend Server"
Set-Location "$PSScriptRoot\server"
Start-Process -FilePath "node" -ArgumentList "working-server.js"

Start-Sleep -Seconds 5

Write-Host "Starting Frontend Server"
Set-Location "$PSScriptRoot\client"
Start-Process -FilePath "npm" -ArgumentList "start"

Start-Sleep -Seconds 10

Write-Host "Application Started"
Write-Host "Frontend: http://localhost:3000"
Write-Host "Backend: http://localhost:4000"
Write-Host "Health: http://localhost:4000/health"
Write-Host ""
Write-Host "Admin Login:"
Write-Host "Email: admin@ratings.com"
Write-Host "Password: Admin123!"
Write-Host ""
Write-Host "If the app doesn't open, go to http://localhost:3000"
Write-Host ""

Read-Host "Press Enter to close"
