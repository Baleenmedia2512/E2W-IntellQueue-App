// Mobile app initialization for Capacitor
// Avoid static imports of Capacitor plugins to prevent early native bridge access
import { CapacitorStorage } from './capacitorStorage';

let Capacitor = null;
let StatusBar = null;
let Style = null;
let SplashScreen = null;
let App = null;

// Import new plugins for proper Android status bar handling
let EdgeToEdgeSupport, NavigationBar;

async function ensureCapacitorCore() {
  if (!Capacitor && typeof window !== 'undefined') {
    try {
      const mod = await import('@capacitor/core');
      Capacitor = mod.Capacitor;
    } catch (e) {
      Capacitor = null;
    }
  }
  return Capacitor;
}

async function ensureStatusBar() {
  if (!StatusBar && typeof window !== 'undefined') {
    try {
      const mod = await import('@capacitor/status-bar');
      StatusBar = mod.StatusBar;
      Style = mod.Style;
    } catch (e) {
      StatusBar = null; Style = null;
    }
  }
  return { StatusBar, Style };
}

async function ensureSplashScreen() {
  if (!SplashScreen && typeof window !== 'undefined') {
    try {
      const mod = await import('@capacitor/splash-screen');
      SplashScreen = mod.SplashScreen;
    } catch (e) {
      SplashScreen = null;
    }
  }
  return SplashScreen;
}

async function ensureApp() {
  if (!App && typeof window !== 'undefined') {
    try {
      const mod = await import('@capacitor/app');
      App = mod.App;
    } catch (e) {
      App = null;
    }
  }
  return App;
}

// Dynamically import the new plugins to prevent errors on non-Android platforms
const initializeEdgeToEdgePlugins = async () => {
  if (Capacitor.getPlatform() === 'android') {
    try {
      const { EdgeToEdgeSupport: EdgeToEdgeSupportPlugin } = await import('@capawesome/capacitor-android-edge-to-edge-support');
      const { NavigationBar: NavigationBarPlugin } = await import('@capgo/capacitor-navigation-bar');
      EdgeToEdgeSupport = EdgeToEdgeSupportPlugin;
      NavigationBar = NavigationBarPlugin;
      console.log('Edge-to-edge plugins loaded successfully');
    } catch (error) {
      console.warn('Could not load edge-to-edge plugins:', error);
    }
  }
};

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
    
    const cap = await ensureCapacitorCore();
    if (!cap || !cap.isNativePlatform()) {
      console.log('Running in web browser - skipping native initialization');
      return;
    }

    console.log('Running on native platform:', cap.getPlatform());
    this.isInitialized = true;

    // Load edge-to-edge plugins for Android
    await initializeEdgeToEdgePlugins();

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
      // Initialize Edge-to-Edge support first (Android only)
      if (cap.getPlatform() === 'android') {
        console.log('Initializing edge-to-edge support...');
        await this.initializeEdgeToEdgeSupport();
      }
      
      // Initialize Status Bar
      console.log('Initializing status bar...');
      await this.initializeStatusBar();
      
      // Initialize Navigation Bar (Android only)
      if (cap.getPlatform() === 'android') {
        console.log('Initializing navigation bar...');
        await this.initializeNavigationBar();
      }
      
      // Initialize Splash Screen
      console.log('Initializing splash screen...');
      await this.initializeSplashScreen();
      
      // Initialize App listeners
      console.log('Initializing app listeners...');
      await this.initializeAppListeners();
      
      console.log('Mobile app initialized successfully');
    } catch (error) {
      console.error('Error initializing mobile app:', error);
      // Don't throw the error to prevent app crashes
    }
  }

  static async initializeEdgeToEdgeSupport() {
    if (!EdgeToEdgeSupport) {
      console.warn('EdgeToEdgeSupport plugin not available');
      return;
    }

    try {
      // Enable edge-to-edge support for Android 15+
      await EdgeToEdgeSupport.enable({
        statusBarColor: '#f8fafc', // Light gray to match app theme
        statusBarStyle: 'light', // Dark icons on light background
        navigationBarColor: '#ffffff', // White navigation bar
        navigationBarStyle: 'light'
      });
      console.log('Edge-to-edge support enabled');
    } catch (error) {
      console.error('Edge-to-edge support initialization error:', error);
    }
  }

  static async initializeStatusBar() {
    try {
      const { StatusBar: SB, Style: ST } = await ensureStatusBar();
      if (!SB || !ST) throw new Error('StatusBar not available');
      // Use light status bar (dark text/icons on light background)
      await SB.setStyle({ style: ST.Light });
      console.log('Status bar style set to light');
    } catch (error) {
      console.error('Status bar initialization error:', error);
    }
  }

  static async initializeNavigationBar() {
    if (!NavigationBar) {
      console.warn('NavigationBar plugin not available');
      return;
    }

    try {
      // Set navigation bar appearance
      await NavigationBar.setColor({
        color: '#ffffff', // White background
        darkButtons: true // Dark icons for better contrast
      });
      console.log('Navigation bar configured');
    } catch (error) {
      console.error('Navigation bar initialization error:', error);
    }
  }

  static async initializeSplashScreen() {
    try {
      const SS = await ensureSplashScreen();
      if (!SS) throw new Error('SplashScreen not available');
      // Hide splash screen after a delay
      setTimeout(async () => {
        await SS.hide();
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
      const app = await ensureApp();
      if (!app) throw new Error('App plugin not available');
      app.addListener('appStateChange', ({ isActive }) => {
        console.log('App state changed. Is active?', isActive);
      }).catch(error => {
        console.error('Error adding appStateChange listener:', error);
      });

      // Handle back button
      app.addListener('backButton', ({ canGoBack }) => {
        console.log('Back button pressed, canGoBack:', canGoBack);
        
        if (!canGoBack) {
          app.exitApp();
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
      app.addListener('appUrlOpen', (event) => {
        console.log('App opened with URL:', event.url);
        // Handle deep links here
      });
      
    } catch (error) {
      console.error('App listeners initialization error:', error);
    }
  }

  static isMobile() {
    // Best-effort check; may be null early
    return !!(typeof window !== 'undefined' && window.Capacitor && window.Capacitor.isNativePlatform && window.Capacitor.isNativePlatform());
  }

  static getPlatform() {
    return (typeof window !== 'undefined' && window.Capacitor && window.Capacitor.getPlatform) ? window.Capacitor.getPlatform() : 'web';
  }
}
