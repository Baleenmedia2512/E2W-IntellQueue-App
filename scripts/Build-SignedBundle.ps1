# IntellQueue - Automated Signed Bundle Builder (PowerShell)
# 
# This PowerShell script automates the process of building a signed AAB
# for Google Play Store submission on Windows systems.
# 
# Usage:
#   .\scripts\Build-SignedBundle.ps1 [-Clean] [-Verbose] [-Help]
# 
# Parameters:
#   -Clean      Clean build (runs gradlew clean first)
#   -Verbose    Show detailed output
#   -Help       Show this help message

param(
    [switch]$Clean,
    [switch]$Verbose,
    [switch]$Help
)

# Configuration
$Config = @{
    ProjectRoot = $PSScriptRoot | Split-Path -Parent
    AndroidDir = Join-Path $PSScriptRoot ".." "android"
    KeystorePath = Join-Path $PSScriptRoot ".." "android" "app" "intellqueue-keystore.jks"
    OutputPath = Join-Path $PSScriptRoot ".." "android" "app" "build" "outputs" "bundle" "release" "app-release.aab"
    AppName = "IntellQueue"
    PackageName = "com.easy2work.intellqueue"
    KeystoreAlias = "intellqueue-app"
}

# Functions
function Write-ColorOutput {
    param(
        [string]$Message,
        [string]$Color = "White"
    )
    Write-Host $Message -ForegroundColor $Color
}

function Write-Success {
    param([string]$Message)
    Write-ColorOutput "✅ $Message" "Green"
}

function Write-Info {
    param([string]$Message)
    Write-ColorOutput "ℹ️  $Message" "Cyan"
}

function Write-Warning {
    param([string]$Message)
    Write-ColorOutput "⚠️  $Message" "Yellow"
}

function Write-Error {
    param([string]$Message)
    Write-ColorOutput "❌ ERROR: $Message" "Red"
    exit 1
}

function Test-Prerequisites {
    Write-ColorOutput "🔍 Checking prerequisites..." "Cyan"
    
    # Check if we're in the right directory
    if (!(Test-Path (Join-Path $Config.ProjectRoot "package.json"))) {
        Write-Error "package.json not found. Please run this script from the project root."
    }
    
    # Check if android directory exists
    if (!(Test-Path $Config.AndroidDir)) {
        Write-Error "Android directory not found. Please run 'npx cap add android' first."
    }
    
    # Check if keystore exists
    if (!(Test-Path $Config.KeystorePath)) {
        Write-Error "Keystore not found at: $($Config.KeystorePath)`nPlease generate keystore first using the setup guide."
    }
    
    # Check if gradlew exists
    $gradlePath = Join-Path $Config.AndroidDir "gradlew.bat"
    if (!(Test-Path $gradlePath)) {
        Write-Error "Gradle wrapper not found in android directory."
    }
    
    Write-Success "All prerequisites met!"
}

function Invoke-BuildCommand {
    param(
        [string]$Command,
        [string]$WorkingDirectory = $Config.ProjectRoot,
        [string]$Description
    )
    
    Write-Info "Executing: $Command"
    
    try {
        if ($Verbose) {
            & cmd /c "cd /d `"$WorkingDirectory`" && $Command"
        } else {
            & cmd /c "cd /d `"$WorkingDirectory`" && $Command" 2>&1 | Out-Null
        }
        
        if ($LASTEXITCODE -ne 0) {
            throw "Command failed with exit code $LASTEXITCODE"
        }
    }
    catch {
        Write-Error "$Description failed: $($_.Exception.Message)"
    }
}

function Build-NextApp {
    Write-ColorOutput "🏗️  Building Next.js application..." "Cyan"
    Invoke-BuildCommand "npm run build" $Config.ProjectRoot "Next.js build"
    Write-Success "Next.js build completed!"
}

function Sync-Capacitor {
    Write-ColorOutput "🔄 Syncing with Capacitor Android..." "Cyan"
    Invoke-BuildCommand "npx cap sync android" $Config.ProjectRoot "Capacitor sync"
    Write-Success "Capacitor sync completed!"
}

function Clear-AndroidBuild {
    if ($Clean) {
        Write-ColorOutput "🧹 Cleaning Android build..." "Cyan"
        Invoke-BuildCommand ".\gradlew.bat clean" $Config.AndroidDir "Android clean"
        Write-Success "Android build cleaned!"
    }
}

function Build-SignedAAB {
    Write-ColorOutput "📦 Building signed Android App Bundle..." "Cyan"
    
    # Remove existing AAB if it exists
    if (Test-Path $Config.OutputPath) {
        Remove-Item $Config.OutputPath -Force
        Write-Info "Removed existing AAB file"
    }
    
    Invoke-BuildCommand ".\gradlew.bat bundleRelease" $Config.AndroidDir "Signed AAB build"
    Write-Success "Signed AAB build completed!"
}

function Test-AAB {
    Write-ColorOutput "🔍 Verifying built AAB..." "Cyan"
    
    if (!(Test-Path $Config.OutputPath)) {
        Write-Error "AAB file not found at: $($Config.OutputPath)"
    }
    
    $fileInfo = Get-Item $Config.OutputPath
    $fileSizeMB = [math]::Round($fileInfo.Length / 1MB, 2)
    
    Write-Success "AAB file created successfully!"
    Write-Info "File: $($Config.OutputPath)"
    Write-Info "Size: $fileSizeMB MB"
}

function New-BuildReport {
    $timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
    $fileInfo = Get-Item $Config.OutputPath
    $fileSizeMB = [math]::Round($fileInfo.Length / 1MB, 2)
    
    $report = @"
# IntellQueue - Signed Bundle Build Report

**Build Date**: $timestamp
**App Name**: $($Config.AppName)
**Package**: $($Config.PackageName)
**Version**: 1.0 (Build 1)

## Build Output
- **AAB File**: ``$($Config.OutputPath)``
- **File Size**: $fileSizeMB MB
- **Status**: ✅ Successfully Signed
- **Ready for**: Google Play Store Upload

## Next Steps
1. 🔐 Backup keystore securely
2. 📸 Capture app screenshots  
3. 🎨 Create feature graphic (1024x500)
4. 🏪 Upload to Google Play Console
5. 📝 Complete store listing

## Upload Command
``````powershell
# Copy AAB to desktop for easy access
Copy-Item "$($Config.OutputPath)" "$env:USERPROFILE\Desktop\intellqueue-v1.0.aab"
``````

---
Generated by IntellQueue Build Script (PowerShell) v1.0
"@

    $reportPath = Join-Path $Config.ProjectRoot "BUILD_REPORT.md"
    $report | Out-File -FilePath $reportPath -Encoding UTF8
    Write-Success "Build report saved: $reportPath"
}

function Show-Help {
    Write-Host @"

IntellQueue - Automated Signed Bundle Builder (PowerShell)

USAGE:
  .\scripts\Build-SignedBundle.ps1 [parameters]

PARAMETERS:
  -Clean      Clean build (runs gradlew clean first)
  -Verbose    Show detailed build output
  -Help       Show this help message

EXAMPLES:
  .\scripts\Build-SignedBundle.ps1                    # Standard build
  .\scripts\Build-SignedBundle.ps1 -Clean            # Clean build
  .\scripts\Build-SignedBundle.ps1 -Clean -Verbose   # Clean build with detailed output

PREREQUISITES:
  ✅ Keystore: android/app/intellqueue-keystore.jks
  ✅ Android SDK and Gradle installed
  ✅ Build configuration in android/app/build.gradle

OUTPUT:
  📦 Signed AAB: android/app/build/outputs/bundle/release/app-release.aab
  📝 Build Report: BUILD_REPORT.md

SECURITY NOTE:
  🔐 Keystore password is embedded in build.gradle
  🔐 Ensure keystore is backed up securely
  🔐 Never commit keystore to version control

"@ -ForegroundColor Cyan
}

# Main execution
function Main {
    try {
        # Show help if requested
        if ($Help) {
            Show-Help
            exit 0
        }

        Write-ColorOutput "🚀 Starting IntellQueue Signed Bundle Build..." "Green"
        Write-ColorOutput "📅 Build Date: $(Get-Date)" "Cyan"
        
        $stopwatch = [System.Diagnostics.Stopwatch]::StartNew()
        
        # Step 1: Check prerequisites
        Test-Prerequisites
        
        # Step 2: Build Next.js app
        Build-NextApp
        
        # Step 3: Sync with Capacitor
        Sync-Capacitor
        
        # Step 4: Clean Android build (optional)
        Clear-AndroidBuild
        
        # Step 5: Build signed AAB
        Build-SignedAAB
        
        # Step 6: Verify AAB
        Test-AAB
        
        # Step 7: Generate build report
        New-BuildReport
        
        $stopwatch.Stop()
        $buildTime = [math]::Round($stopwatch.Elapsed.TotalSeconds, 2)
        
        Write-ColorOutput "🎉 BUILD COMPLETED SUCCESSFULLY!" "Green"
        Write-ColorOutput "⏱️  Total build time: $buildTime seconds" "Cyan"
        
        # Show final instructions
        Write-Host ""
        Write-ColorOutput "📋 NEXT STEPS:" "Green"
        Write-Warning "1. 🔐 Backup your keystore file securely"
        Write-Warning "2. 📸 Capture app screenshots for Play Store"
        Write-Warning "3. 🎨 Create feature graphic (1024x500)"
        Write-Warning "4. 🏪 Upload AAB to Google Play Console"
        Write-Warning "5. 📝 Complete store listing information"
        
        Write-Host ""
        Write-Success "Your signed AAB is ready for Google Play Store upload!"
        Write-Info "File: $($Config.OutputPath)"
        
        # Copy to desktop for convenience
        $desktopPath = Join-Path $env:USERPROFILE "Desktop" "intellqueue-v1.0.aab"
        Copy-Item $Config.OutputPath $desktopPath -Force
        Write-Success "AAB copied to desktop: intellqueue-v1.0.aab"
        
    }
    catch {
        Write-Error "Build failed: $($_.Exception.Message)"
    }
}

# Handle Ctrl+C gracefully
$null = Register-EngineEvent -SourceIdentifier PowerShell.Exiting -Action {
    Write-ColorOutput "🛑 Build cancelled by user" "Yellow"
}

# Run the main function
if ($MyInvocation.InvocationName -ne '.') {
    Main
}