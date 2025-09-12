'use client';
import { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAppSelector } from '@/redux/store';

/**
 * Hook to redirect to login if company name is missing
 * Should be used in all pages except /QueueSystem routes
 */
export function useAuthRedirect() {
  const router = useRouter();
  const pathname = usePathname();
  const companyName = useAppSelector(state => state.authSlice.companyName);
  const userName = useAppSelector(state => state.authSlice.userName);

  useEffect(() => {
    // Skip auth check for QueueSystem routes and login page
    if (pathname?.startsWith('/QueueSystem') || pathname === '/login' || pathname === '/login/') {
      return;
    }

    // Check if company name is missing
    if (!companyName || !userName) {
      router.replace('/login');
    }
  }, [companyName, userName, pathname, router]);

  return { companyName, userName };
}