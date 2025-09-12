'use client';

import { useEffect } from 'react';
import { MobileAppInitializer } from '../utils/mobileInit';
import { MobileDebugger } from '../utils/mobileDebugger';

export default function MobileAppProvider({ children }) {
  useEffect(() => {
    // In dev, aggressively unregister any SW to avoid stale caches causing bad bundles
    if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
      const isLocalhost = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
      if (isLocalhost) {
        navigator.serviceWorker.getRegistrations().then(regs => {
          regs.forEach(reg => reg.unregister().catch(() => {}));
        }).catch(() => {});
        if (window.caches && typeof window.caches.keys === 'function') {
          window.caches.keys().then(keys => keys.forEach(k => window.caches.delete(k))).catch(() => {});
        }
      }
    }

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
