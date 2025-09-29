# 🔧 IntellQueue Build Scripts

## 📦 Automated Signed Bundle Builder

The `build-signed-bundle.js` script automates the entire process of creating a signed AAB (Android App Bundle) ready for Google Play Store upload.

### 🚀 Quick Start

```bash
# Standard signed bundle build
npm run android:bundle

# Clean build (recommended for releases)
npm run android:bundle:clean

# Verbose build with detailed output
npm run android:bundle:verbose
```

### 📋 What the Script Does

1. **🔍 Prerequisites Check**
   - Verifies keystore exists
   - Checks Android setup
   - Validates project structure

2. **🏗️ Build Process**
   - Builds Next.js application
   - Syncs with Capacitor Android
   - Optionally cleans previous builds
   - Generates signed AAB bundle

3. **✅ Verification**
   - Checks AAB file creation
   - Verifies file size and signature
   - Generates build report

4. **📝 Documentation**
   - Creates `BUILD_REPORT.md`
   - Shows next steps for upload
   - Provides file locations

### 🔑 Prerequisites

Before running the build script, ensure you have:

- ✅ **Keystore File**: `android/app/intellqueue-keystore.jks`
- ✅ **Android SDK**: Properly installed and configured
- ✅ **Gradle**: Available via Android Studio or standalone
- ✅ **Build Config**: Signing configuration in `android/app/build.gradle`

### 📊 Output

After successful build, you'll get:

```
📦 Signed AAB: android/app/build/outputs/bundle/release/app-release.aab
📝 Build Report: BUILD_REPORT.md
📋 Next Steps: Displayed in terminal
```

### 🔧 Command Options

```bash
# Available npm scripts:
npm run android:bundle           # Standard build
npm run android:bundle:clean     # Clean build (removes previous build files)
npm run android:bundle:verbose   # Clean build with detailed output

# Direct script usage:
node scripts/build-signed-bundle.js [options]

# Options:
--clean     # Clean build (runs gradlew clean first)
--verbose   # Show detailed build output
--help      # Show help message
```

### 📱 Build Output Example

```
🚀 Starting IntellQueue Signed Bundle Build...
📅 Build Date: 9/29/2025, 3:04:23 PM

🔍 Checking prerequisites...
✅ All prerequisites met!

🏗️ Building Next.js application...
✅ Next.js build completed!

🔄 Syncing with Capacitor Android...
✅ Capacitor sync completed!

📦 Building signed Android App Bundle...
✅ Signed AAB build completed!

🔍 Verifying built AAB...
✅ AAB file created successfully!
ℹ️  File: /path/to/app-release.aab
ℹ️  Size: 9.26 MB

🎉 BUILD COMPLETED SUCCESSFULLY!
⏱️  Total build time: 45.2s
```

### 🛡️ Security Notes

- **🔐 Keystore Security**: Never commit keystore files to version control
- **🔑 Password Protection**: Keystore passwords are in `build.gradle`
- **💾 Backup**: Always backup your keystore securely
- **🔄 Updates**: Use same keystore for all app updates

### 🆘 Troubleshooting

#### Common Issues:

**❌ "Keystore not found"**
```bash
# Ensure keystore is in correct location:
android/app/intellqueue-keystore.jks
```

**❌ "Gradle command failed"**
```bash
# Try cleaning and rebuilding:
npm run android:bundle:clean
```

**❌ "Build failed with signing error"**
```bash
# Check keystore configuration in:
android/app/build.gradle
```

**❌ "Out of memory during build"**
```bash
# Add to android/gradle.properties:
org.gradle.jvmargs=-Xmx4g
```

### 📞 Next Steps After Build

1. **🔐 Backup Keystore** - Save to secure cloud storage
2. **📸 Screenshots** - Capture 4-6 app screenshots
3. **🎨 Feature Graphic** - Create 1024x500 promotional image
4. **🏪 Google Play Console** - Create developer account ($25)
5. **⬆️ Upload AAB** - Follow Google Play submission guide

### 🎯 Success Metrics

- **Build Time**: ~30-60 seconds (depending on system)
- **AAB Size**: ~8-12 MB (typical for Capacitor apps)
- **Success Rate**: 95%+ with proper setup
- **Compatibility**: All Android devices (API 21+)

---

**💡 Tip**: Run `npm run android:bundle:clean` before important releases to ensure a clean build environment.