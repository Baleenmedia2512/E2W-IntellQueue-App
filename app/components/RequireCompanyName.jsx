'use client'
// A wrapper to ensure authentication is properly handled for both web and mobile
import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAppSelector } from '@/redux/store';
import { Capacitor } from '@capacitor/core';

// Dynamic import to prevent SSR issues and timing problems
let CapacitorNavigation = null;

if (typeof window !== 'undefined') {
  import('../utils/capacitorNavigation').then(module => {
    CapacitorNavigation = module.CapacitorNavigation;
  }).catch(error => {
    console.warn('CapacitorNavigation import failed:', error);
  });
}

export default function RequireCompanyName({ children }) {
  const pathname = usePathname();
  const router = useRouter();
  const [isChecking, setIsChecking] = useState(true);
  
  console.log('🔍 RequireCompanyName component mounted!');
  
  // Get auth state from Redux
  const companyName = useAppSelector(state => state.authSlice.companyName);
  const userName = useAppSelector(state => state.authSlice.userName);
  
  console.log('🔍 RequireCompanyName - Initial state:');
  console.log('  - pathname:', pathname);
  console.log('  - userName:', userName);
  console.log('  - companyName:', companyName);
  
  // Early return for pages that don't need auth check
  const isQueueSystem = pathname?.startsWith('/QueueSystem');
  const isLoginPage = pathname === '/login' || pathname === '/login/';
  
  console.log('🔍 RequireCompanyName - Page checks:');
  console.log('  - isQueueSystem:', isQueueSystem);
  console.log('  - isLoginPage:', isLoginPage);
  console.log('  - pathname === "/login" or "/login/":', pathname === '/login' || pathname === '/login/');
  console.log('  - pathname value:', JSON.stringify(pathname));

  // ALWAYS run authentication check, even on login page
  // This will help us understand what's happening
  console.log('🔍 RequireCompanyName - Running auth check for all pages');
  
  // For both mobile and web, check authentication
  useEffect(() => {
    console.log('=== RequireCompanyName Debug ===');
    console.log('Platform:', Capacitor.isNativePlatform() ? 'Mobile' : 'Web');
    console.log('Current pathname:', pathname);
    console.log('isLoginPage:', isLoginPage);
    console.log('isQueueSystem:', isQueueSystem);
    console.log('User:', userName);
    console.log('Company:', companyName);
    console.log('Should redirect?', !userName || !companyName);
    console.log('================================');
    
    // Small delay to ensure Redux persistence has loaded
    const checkAuth = setTimeout(() => {
      // For queue system, never redirect
      if (isQueueSystem) {
        console.log('RequireCompanyName - Queue system page, skipping auth');
        setIsChecking(false);
        return;
      }
      
      // For login page, allow if no auth OR if already has auth
      if (isLoginPage) {
        console.log('RequireCompanyName - Login page detected');
        if (!userName || !companyName) {
          console.log('RequireCompanyName - Login page + no auth = OK, allowing login page to show');
          setIsChecking(false);
        } else {
          console.log('RequireCompanyName - Login page + has auth = redirect to home');
          if (CapacitorNavigation) {
            CapacitorNavigation.navigate(router, '/', { replace: true });
          } else {
            // Prefer SPA navigation to avoid early full reloads on native
            setTimeout(() => {
              try {
                if (CapacitorNavigation) {
                  CapacitorNavigation.navigate(router, '/', { replace: true });
                } else if (router && typeof router.replace === 'function') {
                  router.replace('/');
                } else if (router && typeof router.push === 'function') {
                  router.push('/');
                } else {
                  window.location.replace('/');
                }
              } catch {
                window.location.replace('/');
              }
            }, 100);
          }
        }
        return;
      }
      
      // For all other pages, check authentication
      if (!userName || !companyName) {
        console.log('RequireCompanyName - Not authenticated, forcing redirect to login');
        
        // Use CapacitorNavigation if available, otherwise fallback
        if (CapacitorNavigation) {
          CapacitorNavigation.navigate(router, '/login', { replace: true });
        } else {
          // Prefer SPA navigation to avoid early full reloads on native
          setTimeout(() => {
            try {
              if (CapacitorNavigation) {
                CapacitorNavigation.navigate(router, '/login', { replace: true });
              } else if (router && typeof router.replace === 'function') {
                router.replace('/login');
              } else if (router && typeof router.push === 'function') {
                router.push('/login');
              } else {
                window.location.replace('/login');
              }
            } catch {
              window.location.replace('/login');
            }
          }, 100);
        }
      } else {
        console.log('RequireCompanyName - User authenticated, allowing access');
        setIsChecking(false);
      }
    }, 100);
    
    return () => clearTimeout(checkAuth);
  }, [companyName, userName, router, pathname, isLoginPage, isQueueSystem]);
  
  // Show loading while checking authentication
  if (isChecking) {
    return (
      <section className='flex justify-center items-center h-screen'>
        <div className='ld-ripple'>
          <div></div>
          <div></div>
        </div>
      </section>
    );
  }
  
  // Always render children after auth check is complete
  return children;
}
