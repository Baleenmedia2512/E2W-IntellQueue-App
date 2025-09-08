// A wrapper to ensure companyName is set, else redirect to /login
'use client'
import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAppSelector } from '@/redux/store';
import { Capacitor } from '@capacitor/core';

export default function RequireCompanyName({ children }) {
  const companyName = useAppSelector(state => state.authSlice.companyName);
  const userName = useAppSelector(state => state.authSlice.userName);
  const router = useRouter();
  const pathname = usePathname();
  const [isInitialized, setIsInitialized] = useState(false);
  const [redirectAttempts, setRedirectAttempts] = useState(0);
  const [hasCheckedPersistence, setHasCheckedPersistence] = useState(false);

  useEffect(() => {
    console.log('RequireCompanyName check:', {
      companyName,
      userName,
      pathname,
      isNative: Capacitor.isNativePlatform(),
      redirectAttempts,
      hasCheckedPersistence
    });

    // For mobile apps, give more time for Redux persistence to rehydrate
    const isMobile = Capacitor.isNativePlatform();
    const initDelay = isMobile ? 2500 : 1000; // 2.5 seconds for mobile, 1 second for web

    const initTimer = setTimeout(() => {
      setIsInitialized(true);
    }, initDelay);

    // Also check for persisted data in localStorage
    if (!hasCheckedPersistence) {
      try {
        const persistedData = localStorage.getItem('persist:root');
        if (persistedData) {
          const parsed = JSON.parse(persistedData);
          const authData = parsed.authSlice ? JSON.parse(parsed.authSlice) : null;
          console.log('Found persisted auth data:', authData);
        }
        setHasCheckedPersistence(true);
      } catch (error) {
        console.error('Error checking persisted data:', error);
        setHasCheckedPersistence(true);
      }
    }

    return () => clearTimeout(initTimer);
  }, [companyName, userName, pathname, redirectAttempts, hasCheckedPersistence]);

  useEffect(() => {
    // Only check after initialization, persistence check, and limit redirect attempts
    if (!isInitialized || !hasCheckedPersistence || redirectAttempts >= 2) {
      return;
    }

    // Exclude QueueSystem routes from companyName check
    const isQueueSystem = pathname?.startsWith('/QueueSystem');
    const isLoginPage = pathname === '/login';
    
    console.log('Auth state check:', {
      companyName,
      userName,
      pathname,
      isQueueSystem,
      isLoginPage,
      shouldRedirect: !companyName && !isQueueSystem && !isLoginPage
    });

    // Only redirect if we don't have companyName AND we're not already on login or queue system
    if (!companyName && !isQueueSystem && !isLoginPage) {
      console.log('Redirecting to login - no company name found');
      setRedirectAttempts(prev => prev + 1);
      
      // Use replace instead of push to prevent navigation history issues
      setTimeout(() => {
        router.replace('/login');
      }, 750);
    }
  }, [companyName, userName, router, pathname, isInitialized, hasCheckedPersistence, redirectAttempts]);

  // Show loading state during initialization to prevent flickering
  if (!isInitialized) {
    return (
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        height: '100vh',
        backgroundColor: '#f69435',
        color: 'white',
        fontSize: '18px',
        fontFamily: 'system-ui, -apple-system, sans-serif'
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ marginBottom: '20px', fontSize: '24px', fontWeight: 'bold' }}>
            IntellQueue
          </div>
          <div>Loading...</div>
        </div>
      </div>
    );
  }

  return children;
}
