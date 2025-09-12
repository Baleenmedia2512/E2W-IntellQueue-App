'use client';

import { useEffect, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { useAppSelector } from '@/redux/store';
// Dynamic import to avoid early Capacitor bridge usage
let CapacitorNavigation = null;
if (typeof window !== 'undefined') {
  import('../utils/capacitorNavigation')
    .then(mod => { CapacitorNavigation = mod.CapacitorNavigation; })
    .catch(err => console.warn('CapacitorNavigation import failed:', err));
}

export default function MobileAuthRedirect() {
  const pathname = usePathname();
  const router = useRouter();
  const [isReady, setIsReady] = useState(false);
  
  // Use Redux state instead of sessionStorage for more reliable auth check
  const loggedInUser = useAppSelector(state => state.authSlice.userName);
  const companyName = useAppSelector(state => state.authSlice.companyName);

  // Wait for Redux persistence to load before making redirect decisions
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsReady(true);
    }, 500); // Small delay to ensure Redux persistence is loaded

    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    // Only run on mobile platforms and after Redux is ready
    const isNative = typeof window !== 'undefined'
      && window.Capacitor
      && typeof window.Capacitor.isNativePlatform === 'function'
      && window.Capacitor.isNativePlatform();

    if (!isNative || !isReady) {
      return;
    }

    console.log('MobileAuthRedirect - Current path:', pathname);
    console.log('MobileAuthRedirect - User:', loggedInUser, 'Company:', companyName);
    console.log('MobileAuthRedirect - Redux ready:', isReady);

    // If we're on the root path and not logged in, redirect to login
    if (pathname === '/' && !loggedInUser) {
      console.log('Mobile app on root path and not logged in - redirecting to login');
      if (CapacitorNavigation) {
        CapacitorNavigation.navigate(router, '/login', { replace: true });
      } else {
        try { router.replace('/login'); } catch { window.location.replace('/login'); }
      }
    }
  }, [pathname, loggedInUser, companyName, isReady, router]);

  return null; // This component doesn't render anything
}
