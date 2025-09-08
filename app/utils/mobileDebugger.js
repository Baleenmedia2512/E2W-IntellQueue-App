// Global error handling and debugging for mobile app
export class MobileDebugger {
  static init() {
    // Only enable in development or for debugging
    if (typeof window === 'undefined') return;
    
    console.log('Initializing mobile debugger...');
    
    // Global error handler
    window.addEventListener('error', (event) => {
      console.error('Global JavaScript Error:', {
        message: event.message,
        filename: event.filename,
        lineno: event.lineno,
        colno: event.colno,
        error: event.error
      });
      
      // Prevent the error from causing app refresh/crash
      event.preventDefault();
      return true;
    });
    
    // Unhandled promise rejection handler
    window.addEventListener('unhandledrejection', (event) => {
      console.error('Unhandled Promise Rejection:', {
        reason: event.reason,
        promise: event.promise
      });
      
      // Prevent the error from causing app refresh/crash
      event.preventDefault();
      return true;
    });
    
    // Console override for better mobile debugging
    const originalConsole = { ...console };
    
    ['log', 'warn', 'error', 'info'].forEach(level => {
      console[level] = (...args) => {
        // Add timestamp and context
        const timestamp = new Date().toISOString();
        const message = `[${timestamp}] [${level.toUpperCase()}]`;
        
        originalConsole[level](message, ...args);
        
        // Store critical errors for debugging
        if (level === 'error' && this.shouldStoreError(args)) {
          this.storeError(level, args);
        }
      };
    });
    
    // Monitor app lifecycle
    document.addEventListener('DOMContentLoaded', () => {
      console.log('DOM Content Loaded');
    });
    
    window.addEventListener('load', () => {
      console.log('Window Loaded');
    });
    
    window.addEventListener('beforeunload', () => {
      console.log('Window Before Unload');
    });
    
    // Monitor network status
    window.addEventListener('online', () => {
      console.log('Network: Online');
    });
    
    window.addEventListener('offline', () => {
      console.log('Network: Offline');
    });
    
    console.log('Mobile debugger initialized successfully');
  }
  
  static shouldStoreError(args) {
    const errorString = args.join(' ');
    // Don't store minor warnings or development-only errors
    const ignoredErrors = [
      'ResizeObserver loop limit exceeded',
      'Non-passive event listener',
      'Violation',
      'DevTools'
    ];
    
    return !ignoredErrors.some(ignored => errorString.includes(ignored));
  }
  
  static storeError(level, args) {
    try {
      const errors = JSON.parse(localStorage.getItem('mobile_app_errors') || '[]');
      errors.push({
        level,
        message: args.join(' '),
        timestamp: Date.now(),
        url: window.location.href,
        userAgent: navigator.userAgent
      });
      
      // Keep only last 50 errors
      if (errors.length > 50) {
        errors.splice(0, errors.length - 50);
      }
      
      localStorage.setItem('mobile_app_errors', JSON.stringify(errors));
    } catch (e) {
      console.warn('Could not store error in localStorage:', e);
    }
  }
  
  static getStoredErrors() {
    try {
      return JSON.parse(localStorage.getItem('mobile_app_errors') || '[]');
    } catch (e) {
      return [];
    }
  }
  
  static clearStoredErrors() {
    try {
      localStorage.removeItem('mobile_app_errors');
    } catch (e) {
      console.warn('Could not clear stored errors:', e);
    }
  }
  
  static logAppInfo() {
    console.log('App Information:', {
      userAgent: navigator.userAgent,
      url: window.location.href,
      viewport: {
        width: window.innerWidth,
        height: window.innerHeight
      },
      connection: navigator.connection ? {
        effectiveType: navigator.connection.effectiveType,
        downlink: navigator.connection.downlink,
        rtt: navigator.connection.rtt
      } : 'Not available',
      memory: navigator.deviceMemory || 'Not available',
      hardwareConcurrency: navigator.hardwareConcurrency || 'Not available'
    });
  }
}
