// A wrapper to ensure companyName is set, else redirect to /login
'use client'
import { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAppSelector } from '@/redux/store';

export default function RequireCompanyName({ children }) {
  const companyName = useAppSelector(state => state.authSlice.companyName);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    // Only check QueueSystem routes for company name requirement
    const isQueueSystem = pathname?.startsWith('/QueueSystem');
    
    // ONLY handle QueueSystem routes - let other pages handle their own auth
    if (!isQueueSystem) {
      return;
    }

    // For QueueSystem routes, check if company name is required and available
    if (!companyName) {
      router.replace('/login');
    }
  }, [companyName, router, pathname]);

  return children;
}