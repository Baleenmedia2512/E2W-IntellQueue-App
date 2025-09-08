# 🔧 IntellQueue Mobile App - Crash/Refresh Troubleshooting

## 🚨 **Issue: App Refreshes Multiple Times and Closes**

The app refreshing multiple times and then closing is typically caused by:

1. **JavaScript Errors** - Uncaught exceptions causing the WebView to reload
2. **Network Issues** - API calls failing and causing state corruption  
3. **Memory Issues** - App running out of memory on the device
4. **Configuration Problems** - Capacitor or Android configuration issues
5. **Plugin Conflicts** - Capacitor plugins causing initialization failures

---

## ✅ **Fixes Applied**

### **1. Enhanced Error Handling**
- ✅ Added `ErrorBoundary` component to catch React errors
- ✅ Added global JavaScript error handling
- ✅ Added unhandled promise rejection handling
- ✅ Wrapped entire app in error boundary

### **2. Improved Mobile Initialization**
- ✅ Added detailed logging to mobile initialization
- ✅ Made push notification initialization optional (non-blocking)
- ✅ Added try-catch blocks around all plugin initializations
- ✅ Added timeout and error recovery for API calls

### **3. Enhanced Capacitor Configuration**
- ✅ Enabled web debugging (`webContentsDebuggingEnabled: true`)
- ✅ Added network navigation allowances
- ✅ Increased splash screen duration
- ✅ Added keyboard configuration

### **4. Network and API Improvements**
- ✅ Added network connectivity checking
- ✅ Added API timeout configuration (10 seconds)
- ✅ Added request/response interceptors with error handling
- ✅ Added retry logic for network requests

---

## 🛠 **Debugging Steps**

### **Step 1: Enable Chrome DevTools Debugging**

1. **Connect your Android device** to computer via USB
2. **Enable USB Debugging** on your Android device
3. **Open Chrome** on your computer
4. **Go to** `chrome://inspect/#devices`
5. **Find your device** and click "inspect" next to the IntellQueue app
6. **Check Console tab** for JavaScript errors

### **Step 2: Check Android Logcat**

In Android Studio:
1. **Open Logcat** (View → Tool Windows → Logcat)
2. **Filter by package**: `com.easy2work.intellqueue`
3. **Look for error messages** when the app crashes
4. **Check for**:
   - `FATAL EXCEPTION`
   - `AndroidRuntime`
   - `chromium`
   - `WebView`

### **Step 3: Test Network Connectivity**

1. **Check internet connection** on the device
2. **Try accessing** `https://orders.baleenmedia.com/API/Media/` in mobile browser
3. **Check if API is accessible** from the device's network

### **Step 4: Monitor Memory Usage**

In Android Studio:
1. **Open Memory Profiler** (View → Tool Windows → Profiler)
2. **Select your device** and IntellQueue app
3. **Monitor memory usage** during app startup
4. **Look for memory spikes** or out-of-memory errors

---

## 🧪 **Testing Recommendations**

### **Immediate Test:**
```bash
# Rebuild and test with debugging
npm run android:build
```

Then in Android Studio:
1. **Run the app** with debugger attached
2. **Open Chrome DevTools** (chrome://inspect)
3. **Watch console output** during app startup
4. **Check for specific error messages**

### **Common Error Patterns to Look For:**

#### **JavaScript Errors:**
```
TypeError: Cannot read property 'X' of undefined
ReferenceError: X is not defined
Promise rejection: Network request failed
```

#### **Capacitor Plugin Errors:**
```
Plugin 'PushNotifications' not available
Capacitor plugin not implemented
Error loading plugin
```

#### **Network Errors:**
```
CORS error
Network request failed
ERR_INTERNET_DISCONNECTED
ERR_NETWORK_CHANGED
```

#### **Memory Errors:**
```
OutOfMemoryError
GC overhead limit exceeded
```

---

## 🔧 **Quick Fixes to Try**

### **1. Disable Push Notifications Temporarily**

If push notifications are causing issues, comment out the initialization:

```javascript
// Comment this line in MobileAppInitializer
// await this.initializePushNotifications();
```

### **2. Reduce Bundle Size**

Remove unused dependencies:
```bash
# Remove heavy libraries temporarily
npm uninstall @mui/x-data-grid @devexpress/dx-react-grid
```

### **3. Test with Minimal Configuration**

Create a simple test page to isolate the issue:

```javascript
// Create app/test/page.jsx
export default function TestPage() {
  return (
    <div style={{ padding: '20px', textAlign: 'center' }}>
      <h1>IntellQueue Test</h1>
      <p>If you see this, basic React rendering works!</p>
      <button onClick={() => alert('Button works!')}>
        Test Button
      </button>
    </div>
  );
}
```

### **4. Check Android WebView Version**

On your Android device:
1. Go to **Settings → Apps → Android System WebView**
2. Check the version - should be recent
3. Update if needed from Google Play Store

---

## 📱 **Device-Specific Checks**

### **Android Version Compatibility:**
- ✅ **Android 5.0+ (API 21+)**: Supported
- ⚠️ **Android 4.4 and below**: Not supported

### **Memory Requirements:**
- ✅ **Minimum**: 2GB RAM
- ✅ **Recommended**: 4GB+ RAM

### **Storage Requirements:**
- ✅ **Minimum**: 100MB free space
- ✅ **Recommended**: 500MB+ free space

---

## 🎯 **Next Steps**

1. **Test the rebuilt app** with debugging enabled
2. **Check Chrome DevTools** for JavaScript errors
3. **Monitor Android Logcat** for native errors
4. **Report specific error messages** found in logs
5. **Try the quick fixes** if specific issues are identified

The enhanced error handling and debugging should now provide much clearer information about what's causing the app to crash. The app should be more stable and any remaining issues should be easier to identify through the improved logging and error boundaries.

---

## 📞 **Reporting Issues**

When reporting issues, please include:
- **Android version** and device model
- **Specific error messages** from Chrome DevTools
- **Android Logcat output** during crash
- **Steps to reproduce** the issue
- **Network connectivity status** when testing

The debugging improvements should help identify the root cause! 🔍
