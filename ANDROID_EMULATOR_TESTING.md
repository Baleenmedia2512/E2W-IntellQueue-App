# 🔧 Android Emulator Testing Guide

## 🚨 **Java Version Issue - Workaround**

We're encountering a Java compatibility issue where Capacitor is trying to use Java 21, but we have Java 17. Here are the solutions:

## 🛠 **Solution 1: Build in Android Studio (Recommended for Testing)**

### **Step 1: Open Project in Android Studio**
1. **Open Android Studio**
2. **Open Existing Project**
3. **Navigate to:** `C:\xampp\htdocs\Easy2Work\android`
4. **Select the android folder** and click OK

### **Step 2: Configure Java Version in Android Studio**
1. **Go to:** File → Project Structure
2. **In SDK Location tab:**
   - Set **JDK Location** to: `C:\Program Files\Eclipse Adoptium\jdk-17.0.10.7-hotspot`
3. **In Modules → app:**
   - Set **Compile Sdk Version** to: 35
   - Set **Source Compatibility** to: 17
   - Set **Target Compatibility** to: 17

### **Step 3: Build and Run**
1. **Click the green "Run" button** or press Shift+F10
2. **Select your Pixel 8 emulator**
3. **Wait for build to complete**

## 🛠 **Solution 2: Fix Capacitor Java Version**

If you want to use command line, let's downgrade some Capacitor versions:

```bash
# Update Capacitor to a version compatible with Java 17
npm install @capacitor/core@6.1.2 @capacitor/cli@6.1.2 @capacitor/android@6.1.2
```

## 📱 **For Debugging Once App Runs:**

### **Chrome DevTools Setup:**
1. **Open Chrome** on your computer
2. **Go to:** `chrome://inspect/#devices`
3. **Look for IntellQueue** in the device list
4. **Click "inspect"** when the app is running
5. **Go to Console tab** to see our detailed logs

### **What to Look For in Console:**
```javascript
// You should see logs like:
"Starting mobile app initialization..."
"RequireCompanyName check: {companyName: '', userName: '', pathname: '/'}"
"Stored authentication data: Found/Not found"
"Running on native platform: android"
```

### **Expected Behavior:**
1. **Splash screen** should show "IntellQueue" for 3 seconds
2. **Loading screen** should appear for 1 second (to prevent redirect loops)
3. **If no authentication:** Should redirect to login page
4. **If authentication exists:** Should go to main app

## 🔍 **Debugging the Login Redirect Issue:**

### **In Chrome Console, check:**
```javascript
// Check Redux store state
localStorage.getItem('persist:root')

// Check if user is authenticated
JSON.parse(localStorage.getItem('persist:root'))?.authSlice
```

### **If you see redirect loops, look for:**
- Console errors during app initialization
- Network requests failing
- Redux state not loading properly
- Navigation issues

## 🎯 **Quick Test Steps:**

1. **Build in Android Studio** (easier for now)
2. **Open Chrome DevTools** when app launches
3. **Check Console for logs** about authentication state
4. **Test if it redirects to login** when no user is found
5. **Try logging in** to see if authentication works
6. **Report back what you see** in the console logs

The enhanced logging we added should give us much clearer information about what's happening during app startup and where the refresh/crash is occurring! 🔍

Let me know what you see in the Chrome DevTools console when the app runs!
