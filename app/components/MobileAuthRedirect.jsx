'use client';

import { useEffect, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { Capacitor } from '@capacitor/core';
import { useAppSelector } from '@/redux/store';
import { CapacitorNavigation } from '../utils/capacitorNavigation';

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
    if (!Capacitor.isNativePlatform() || !isReady) {
      return;
    }

    console.log('MobileAuthRedirect - Current path:', pathname);
    console.log('MobileAuthRedirect - User:', loggedInUser, 'Company:', companyName);
    console.log('MobileAuthRedirect - Redux ready:', isReady);

    // If we're on the root path and not logged in, redirect to login
    if (pathname === '/' && !loggedInUser) {
      console.log('Mobile app on root path and not logged in - redirecting to login');
      CapacitorNavigation.navigate(router, '/login', { replace: true });
    }
  }, [pathname, loggedInUser, companyName, isReady, router]);

  return null; // This component doesn't render anything
}
