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
    // Exclude all /QueueSystem/* and /QueueSystem/AutoLogin routes from companyName check
    // const isQueueSystem = pathname?.startsWith('/QueueSystem');
    const isAutoLogin = pathname === '/QueueSystem/AutoLogin';

    if (!companyName && !isAutoLogin) {
      router.push('/login');
    }
  }, [companyName, router, pathname]);

  return children;
}
