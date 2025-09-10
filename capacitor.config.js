const { CapacitorConfig } = require('@capacitor/cli');

const config = {
  appId: 'com.easy2work.intellqueue',
  appName: 'IntellQueue',
  webDir: 'out',
  server: {
    androidScheme: 'https',
    // Enable cleartext traffic for debugging (remove in production)
    allowNavigation: [
      'orders.baleenmedia.com',
      'https://orders.baleenmedia.com',
      'https://orders.baleenmedia.com/*'
    ]
  },
  android: {
    // Enable debugging and prevent crashes
    allowMixedContent: true,
    captureInput: true,
    webContentsDebuggingEnabled: true
  },
  plugins: {
    SplashScreen: {
  launchShowDuration: 3000, // Increased to 3 seconds for better loading
  backgroundColor: "#f69435",
  showSpinner: false,
  // Avoid immersive/fullscreen so content doesn't draw under system bars
  splashFullScreen: false,
  splashImmersive: false,
  androidScaleType: "CENTER_CROP"
    },
    StatusBar: {
  style: 'DEFAULT',
  backgroundColor: "#00000000", // transparent, we'll pad content via CSS safe areas
  overlaysWebView: false
    },
    // PushNotifications disabled for Android to prevent Firebase crashes
    // Use native Android notifications or enable only for web
    // PushNotifications: {
    //   presentationOptions: ["badge", "sound", "alert"]
    // },
    App: {
      backButtonExitApp: false
    },
    Keyboard: {
      resize: 'body',
      style: 'dark',
      resizeOnFullScreen: true
    }
  }
};

module.exports = config;
