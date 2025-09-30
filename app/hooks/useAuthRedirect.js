'use client';
import { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAppSelector } from '@/redux/store';

/**
 * Hook to redirect to login if company name is missing
 * Should be used in all pages except public routes:
 * - /QueueSystem routes (public queue access)
 * - /login (authentication page)
 * - /privacy (public privacy policy)
 */
export function useAuthRedirect() {
  const router = useRouter();
  const pathname = usePathname();
  const companyName = useAppSelector(state => state.authSlice.companyName);
  const userName = useAppSelector(state => state.authSlice.userName);

  useEffect(() => {
    // Skip auth check for public routes: QueueSystem, login, and privacy policy
    if (pathname?.startsWith('/QueueSystem') || 
        pathname === '/login' || 
        pathname === '/login/' ||
        pathname === '/privacy' ||
        pathname === '/privacy/') {
      return;
    }

    // Check if company name is missing
    if (!companyName || !userName) {
      router.replace('/login');
    }
  }, [companyName, userName, pathname, router]);

  return { companyName, userName };
}