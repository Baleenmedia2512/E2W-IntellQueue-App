// Mobile app initialization for Capacitor
import { Capacitor } from '@capacitor/core';
import { StatusBar, Style } from '@capacitor/status-bar';
import { SplashScreen } from '@capacitor/splash-screen';
import { App } from '@capacitor/app';
import { CapacitorStorage } from './capacitorStorage';
// Note: PushNotifications removed to prevent Firebase crashes on Android
// import { PushNotifications } from '@capacitor/push-notifications';

export class MobileAppInitializer {
  static isInitialized = false;
  
  static async initialize() {
    // Prevent multiple initializations
    if (this.isInitialized) {
      console.log('Mobile app already initialized - skipping');
      return;
    }
    
    console.log('Starting mobile app initialization...');
    console.log('Current URL:', window.location.href);
    console.log('User Agent:', navigator.userAgent);
    
    if (!Capacitor.isNativePlatform()) {
      console.log('Running in web browser - skipping native initialization');
      return;
    }

    console.log('Running on native platform:', Capacitor.getPlatform());
    this.isInitialized = true;

    // Check if we have any stored authentication data
    try {
      const storedAuth = await CapacitorStorage.getItem('persist:root');
      console.log('Stored authentication data:', storedAuth ? 'Found' : 'Not found');
      if (storedAuth) {
        const parsedAuth = JSON.parse(storedAuth);
        console.log('Auth slice data:', parsedAuth.authSlice ? JSON.parse(parsedAuth.authSlice) : 'No auth slice');
      }
    } catch (error) {
      console.error('Error reading stored auth:', error);
    }

    try {
      // Initialize Status Bar
      console.log('Initializing status bar...');
      await this.initializeStatusBar();
      
      // Initialize Splash Screen
      console.log('Initializing splash screen...');
      await this.initializeSplashScreen();
      
      // Initialize App listeners
      console.log('Initializing app listeners...');
      await this.initializeAppListeners();
      
    //   // Skip push notifications entirely for Android platform
    //   if (Capacitor.getPlatform() === 'android') {
    //     console.log('Android platform detected - push notifications disabled');
    //     console.log('Push notifications are disabled for Android to prevent Firebase crashes');
    //   } else {
    //     console.log('Initializing push notifications...');
    //     await this.initializePushNotifications();
    //   }
      
      console.log('Mobile app initialized successfully');
    } catch (error) {
      console.error('Error initializing mobile app:', error);
      // Don't throw the error to prevent app crashes
    }
  }

  static async initializeStatusBar() {
    try {
      await StatusBar.setStyle({ style: Style.Default });
      await StatusBar.setBackgroundColor({ color: '#f69435' });
      await StatusBar.setOverlaysWebView({ overlay: false });
    } catch (error) {
      console.error('Status bar initialization error:', error);
    }
  }

  static async initializeSplashScreen() {
    try {
      // Hide splash screen after a delay
      setTimeout(async () => {
        await SplashScreen.hide();
      }, 2000);
    } catch (error) {
      console.error('Splash screen initialization error:', error);
    }
  }

  static async initializeAppListeners() {
    try {
      // Add error handler for Capacitor bridge
      window.addEventListener('capacitorBridgeError', (error) => {
        console.error('Capacitor bridge error:', error);
      });
      
      // Handle app state changes
      App.addListener('appStateChange', ({ isActive }) => {
        console.log('App state changed. Is active?', isActive);
      }).catch(error => {
        console.error('Error adding appStateChange listener:', error);
      });

      // Handle back button
      App.addListener('backButton', ({ canGoBack }) => {
        console.log('Back button pressed, canGoBack:', canGoBack);
        
        if (!canGoBack) {
          App.exitApp();
        } else {
          // Use proper navigation for back button
          if (window.history.length > 1) {
            window.history.back();
          } else {
            // If no proper history, navigate to home instead of exiting
            window.location.href = '/';
          }
        }
      }).catch(error => {
        console.error('Error adding backButton listener:', error);
      });

      // Handle app URL open
      App.addListener('appUrlOpen', (event) => {
        console.log('App opened with URL:', event.url);
        // Handle deep links here
      });
    } catch (error) {
      console.error('App listeners initialization error:', error);
    }
  }

  static async initializePushNotifications() {
    try {
      console.log('Push notifications disabled for Android platform');
      console.log('Firebase-based push notifications can cause crashes without proper configuration');
      console.log('For production Android app, implement native Android push notification services');
      console.log('Firebase push notifications remain available for web platform only');
      
      // For future implementation:
      // 1. For Android: Use native Android notification services or FCM with proper setup
      // 2. For Web: Can re-enable Firebase push notifications with proper configuration
      // 3. For iOS: Use APNs (Apple Push Notification service)
      
      return;
    } catch (error) {
      console.error('Push notifications initialization error:', error);
      // Don't throw error to prevent app crashes
    }
  }

  static isFirebaseConfigured() {
    // Simple check to determine if Firebase is likely configured
    // This prevents the app from crashing when trying to initialize push notifications
    // without proper Firebase setup
    try {
      // Check if we're in a development environment without Firebase
      const isDevelopment = window.location.hostname === 'localhost' || 
                           window.location.hostname === '127.0.0.1' ||
                           window.location.protocol === 'capacitor:';
      
      // For now, return false to disable push notifications until proper Firebase setup
      // This can be changed to true once google-services.json is properly configured
      return false;
    } catch (error) {
      console.error('Error checking Firebase configuration:', error);
      return false;
    }
  }

  static isMobile() {
    return Capacitor.isNativePlatform();
  }

  static getPlatform() {
    return Capacitor.getPlatform();
  }
}
