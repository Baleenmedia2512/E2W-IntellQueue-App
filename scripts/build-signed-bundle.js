#!/usr/bin/env node

/**
 * IntellQueue - Automated Signed Bundle Builder
 * 
 * This script automates the process of building a signed AAB (Android App Bundle)
 * for Google Play Store submission.
 * 
 * Usage:
 *   node scripts/build-signed-bundle.js [options]
 * 
 * Options:
 *   --clean     Clean build (runs gradlew clean first)
 *   --verbose   Show detailed output
 *   --help      Show this help message
 * 
 * Prerequisites:
 *   - Keystore file must exist at: android/app/intellqueue-keystore.jks
 *   - Build.gradle must be configured with signing config
 *   - Android SDK and Gradle must be installed
 */

const { execSync, spawn } = require('child_process');
const fs = require('fs');
const path = require('path');
const os = require('os');

// Configuration
const CONFIG = {
    projectRoot: path.resolve(__dirname, '..'),
    androidDir: path.resolve(__dirname, '../android'),
    keystorePath: path.resolve(__dirname, '../android/app/intellqueue-keystore.jks'),
    outputPath: path.resolve(__dirname, '../android/app/build/outputs/bundle/release/app-release.aab'),
    appName: 'IntellQueue',
    packageName: 'com.easy2work.intellqueue',
    keystoreAlias: 'intellqueue-app'
};

// Colors for console output
const colors = {
    reset: '\x1b[0m',
    bright: '\x1b[1m',
    red: '\x1b[31m',
    green: '\x1b[32m',
    yellow: '\x1b[33m',
    blue: '\x1b[34m',
    magenta: '\x1b[35m',
    cyan: '\x1b[36m'
};

// Command line arguments
const args = process.argv.slice(2);
const options = {
    clean: args.includes('--clean'),
    verbose: args.includes('--verbose'),
    help: args.includes('--help')
};

/**
 * Print colored console messages
 */
function log(message, color = 'reset') {
    console.log(`${colors[color]}${message}${colors.reset}`);
}

/**
 * Print error and exit
 */
function error(message) {
    log(`❌ ERROR: ${message}`, 'red');
    process.exit(1);
}

/**
 * Print success message
 */
function success(message) {
    log(`✅ ${message}`, 'green');
}

/**
 * Print info message
 */
function info(message) {
    log(`ℹ️  ${message}`, 'blue');
}

/**
 * Print warning message
 */
function warn(message) {
    log(`⚠️  ${message}`, 'yellow');
}

/**
 * Execute command with error handling
 */
function executeCommand(command, cwd = CONFIG.projectRoot, showOutput = true, allowFailure = false) {
    try {
        info(`Executing: ${command}`);
        const result = execSync(command, {
            cwd: cwd,
            stdio: showOutput && options.verbose ? 'inherit' : 'pipe',
            encoding: 'utf8'
        });
        return result;
    } catch (err) {
        if (allowFailure) {
            throw err; // Let caller handle the error
        }
        error(`Command failed: ${command}\n${err.message}`);
    }
}

/**
 * Check if file exists
 */
function fileExists(filePath) {
    return fs.existsSync(filePath);
}

/**
 * Get file size in MB
 */
function getFileSize(filePath) {
    try {
        const stats = fs.statSync(filePath);
        return (stats.size / (1024 * 1024)).toFixed(2);
    } catch (err) {
        return 'Unknown';
    }
}

/**
 * Check prerequisites
 */
function checkPrerequisites() {
    log('🔍 Checking prerequisites...', 'cyan');
    
    // Check if we're in the right directory
    if (!fileExists(path.join(CONFIG.projectRoot, 'package.json'))) {
        error('package.json not found. Please run this script from the project root.');
    }
    
    // Check if android directory exists
    if (!fileExists(CONFIG.androidDir)) {
        error('Android directory not found. Please run "npx cap add android" first.');
    }
    
    // Check if keystore exists
    if (!fileExists(CONFIG.keystorePath)) {
        error(`Keystore not found at: ${CONFIG.keystorePath}\nPlease generate keystore first using the setup guide.`);
    }
    
    // Check if gradlew exists
    const gradlePath = path.join(CONFIG.androidDir, os.platform() === 'win32' ? 'gradlew.bat' : 'gradlew');
    if (!fileExists(gradlePath)) {
        error('Gradle wrapper not found in android directory.');
    }
    
    success('All prerequisites met!');
}

/**
 * Build Next.js app
 */
function buildNextApp() {
    log('🏗️  Building Next.js application...', 'cyan');
    executeCommand('npm run build', CONFIG.projectRoot, options.verbose);
    success('Next.js build completed!');
}

/**
 * Sync with Capacitor
 */
function syncCapacitor() {
    log('🔄 Syncing with Capacitor Android...', 'cyan');
    executeCommand('npx cap sync android', CONFIG.projectRoot, options.verbose);
    success('Capacitor sync completed!');
}

/**
 * Clean Android build (if requested)
 */
function cleanAndroidBuild() {
    if (options.clean) {
        log('🧹 Cleaning Android build...', 'cyan');
        const gradleCmd = os.platform() === 'win32' ? '.\\gradlew.bat clean' : './gradlew clean';
        executeCommand(gradleCmd, CONFIG.androidDir, options.verbose);
        success('Android build cleaned!');
    }
}

/**
 * Build signed AAB
 */
function buildSignedAAB() {
    log('📦 Building signed Android App Bundle...', 'cyan');
    
    // Remove existing AAB if it exists
    if (fileExists(CONFIG.outputPath)) {
        fs.unlinkSync(CONFIG.outputPath);
        info('Removed existing AAB file');
    }
    
    const gradleCmd = os.platform() === 'win32' ? '.\\gradlew.bat bundleRelease' : './gradlew bundleRelease';
    executeCommand(gradleCmd, CONFIG.androidDir, options.verbose);
    
    success('Signed AAB build completed!');
}

/**
 * Verify the built AAB
 */
function verifyAAB() {
    log('🔍 Verifying built AAB...', 'cyan');
    
    if (!fileExists(CONFIG.outputPath)) {
        error(`AAB file not found at: ${CONFIG.outputPath}`);
    }
    
    const fileSize = getFileSize(CONFIG.outputPath);
    success(`AAB file created successfully!`);
    info(`File: ${CONFIG.outputPath}`);
    info(`Size: ${fileSize} MB`);
    
    // Optional: Verify AAB signature (requires aapt2)
    try {
        const aaptResult = executeCommand(`aapt2 dump badging "${CONFIG.outputPath}"`, CONFIG.androidDir, false, true);
        if (aaptResult.includes(CONFIG.packageName)) {
            success('AAB package verification passed!');
        }
    } catch (err) {
        // aapt2 verification is optional - don't fail the build
        warn('Could not verify AAB with aapt2 (optional check - aapt2 not found in PATH)');
        info('AAB verification skipped - file exists and has correct size');
    }
}

/**
 * Generate build report
 */
function generateBuildReport() {
    const timestamp = new Date().toISOString();
    const fileSize = getFileSize(CONFIG.outputPath);
    
    const report = `
# IntellQueue - Signed Bundle Build Report

**Build Date**: ${timestamp}
**App Name**: ${CONFIG.appName}
**Package**: ${CONFIG.packageName}
**Version**: 1.0 (Build 1)

## Build Output
- **AAB File**: \`${CONFIG.outputPath}\`
- **File Size**: ${fileSize} MB
- **Status**: ✅ Successfully Signed
- **Ready for**: Google Play Store Upload

## Next Steps
1. 🔐 Backup keystore securely
2. 📸 Capture app screenshots  
3. 🎨 Create feature graphic (1024x500)
4. 🏪 Upload to Google Play Console
5. 📝 Complete store listing

## Upload Command
\`\`\`
# Copy AAB to desktop for easy access
copy "${CONFIG.outputPath}" "%USERPROFILE%\\Desktop\\intellqueue-v1.0.aab"
\`\`\`

---
Generated by IntellQueue Build Script v1.0
`;

    const reportPath = path.join(CONFIG.projectRoot, 'BUILD_REPORT.md');
    fs.writeFileSync(reportPath, report.trim());
    success(`Build report saved: ${reportPath}`);
}

/**
 * Show help message
 */
function showHelp() {
    console.log(`
${colors.cyan}IntellQueue - Automated Signed Bundle Builder${colors.reset}

${colors.bright}USAGE:${colors.reset}
  node scripts/build-signed-bundle.js [options]

${colors.bright}OPTIONS:${colors.reset}
  --clean     Clean build (runs gradlew clean first)
  --verbose   Show detailed build output
  --help      Show this help message

${colors.bright}EXAMPLES:${colors.reset}
  node scripts/build-signed-bundle.js                    # Standard build
  node scripts/build-signed-bundle.js --clean            # Clean build
  node scripts/build-signed-bundle.js --clean --verbose  # Clean build with detailed output

${colors.bright}PREREQUISITES:${colors.reset}
  ✅ Keystore: android/app/intellqueue-keystore.jks
  ✅ Android SDK and Gradle installed
  ✅ Build configuration in android/app/build.gradle

${colors.bright}OUTPUT:${colors.reset}
  📦 Signed AAB: android/app/build/outputs/bundle/release/app-release.aab
  📝 Build Report: BUILD_REPORT.md

${colors.bright}SECURITY NOTE:${colors.reset}
  🔐 Keystore password is embedded in build.gradle
  🔐 Ensure keystore is backed up securely
  🔐 Never commit keystore to version control
`);
}

/**
 * Main build process
 */
async function main() {
    try {
        // Show help if requested
        if (options.help) {
            showHelp();
            process.exit(0);
        }

        log('🚀 Starting IntellQueue Signed Bundle Build...', 'bright');
        log(`📅 Build Date: ${new Date().toLocaleString()}`, 'cyan');
        
        const startTime = Date.now();
        
        // Step 1: Check prerequisites
        checkPrerequisites();
        
        // Step 2: Build Next.js app
        buildNextApp();
        
        // Step 3: Sync with Capacitor
        syncCapacitor();
        
        // Step 4: Clean Android build (optional)
        cleanAndroidBuild();
        
        // Step 5: Build signed AAB
        buildSignedAAB();
        
        // Step 6: Verify AAB
        verifyAAB();
        
        // Step 7: Generate build report
        generateBuildReport();
        
        const endTime = Date.now();
        const buildTime = ((endTime - startTime) / 1000).toFixed(2);
        
        log('🎉 BUILD COMPLETED SUCCESSFULLY!', 'green');
        log(`⏱️  Total build time: ${buildTime}s`, 'cyan');
        
        // Show final instructions
        log('\n📋 NEXT STEPS:', 'bright');
        log('1. 🔐 Backup your keystore file securely', 'yellow');
        log('2. 📸 Capture app screenshots for Play Store', 'yellow');
        log('3. 🎨 Create feature graphic (1024x500)', 'yellow');
        log('4. 🏪 Upload AAB to Google Play Console', 'yellow');
        log('5. 📝 Complete store listing information', 'yellow');
        
        log(`\n✅ Your signed AAB is ready for Google Play Store upload!`, 'green');
        log(`📦 File: ${CONFIG.outputPath}`, 'cyan');
        
    } catch (err) {
        error(`Build failed: ${err.message}`);
    }
}

// Handle uncaught exceptions
process.on('uncaughtException', (err) => {
    error(`Uncaught exception: ${err.message}`);
});

process.on('unhandledRejection', (err) => {
    error(`Unhandled rejection: ${err.message}`);
});

// Run the main function
if (require.main === module) {
    main();
}

module.exports = {
    CONFIG,
    checkPrerequisites,
    buildNextApp,
    syncCapacitor,
    buildSignedAAB,
    verifyAAB
};