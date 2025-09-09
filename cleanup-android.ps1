# Android Development Disk Cleanup Script
Write-Host "=== ANDROID DEVELOPMENT CLEANUP ===" -ForegroundColor Green

# Clean Gradle cache
Write-Host "Cleaning Gradle cache..." -ForegroundColor Yellow
Remove-Item -Recurse -Force "$env:USERPROFILE\.gradle\caches" -ErrorAction SilentlyContinue
Remove-Item -Recurse -Force "$env:USERPROFILE\.gradle\daemon" -ErrorAction SilentlyContinue

# Clean Android Studio cache
Write-Host "Cleaning Android Studio cache..." -ForegroundColor Yellow
Get-ChildItem "$env:USERPROFILE\AppData\Local\Google\AndroidStudio*" -ErrorAction SilentlyContinue | ForEach-Object {
    Remove-Item -Recurse -Force "$($_.FullName)\caches" -ErrorAction SilentlyContinue
    Remove-Item -Recurse -Force "$($_.FullName)\tmp" -ErrorAction SilentlyContinue
}

# Clean project files
Write-Host "Cleaning project build files..." -ForegroundColor Yellow
Remove-Item -Recurse -Force "out" -ErrorAction SilentlyContinue
Remove-Item -Recurse -Force ".next" -ErrorAction SilentlyContinue
Remove-Item -Recurse -Force "android\.gradle" -ErrorAction SilentlyContinue
Remove-Item -Recurse -Force "android\app\build" -ErrorAction SilentlyContinue

Write-Host "Cleanup completed!" -ForegroundColor Green
Write-Host "Run this script regularly to maintain disk space." -ForegroundColor Cyan
