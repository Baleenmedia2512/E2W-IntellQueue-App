'use client';

import { useEffect } from 'react';
import { MobileAppInitializer } from '../utils/mobileInit';
import { MobileDebugger } from '../utils/mobileDebugger';

export default function MobileAppProvider({ children }) {
  useEffect(() => {
    // Initialize mobile debugging first
    MobileDebugger.init();
    
    // Log app information
    MobileDebugger.logAppInfo();
    
    // Initialize mobile app when component mounts
    MobileAppInitializer.initialize();
    
    // Log any stored errors from previous sessions
    const storedErrors = MobileDebugger.getStoredErrors();
    if (storedErrors.length > 0) {
      console.warn('Found stored errors from previous sessions:', storedErrors);
      // Clear old errors after logging them
      setTimeout(() => {
        MobileDebugger.clearStoredErrors();
      }, 5000);
    }
  }, []);

  return <>{children}</>;
}
