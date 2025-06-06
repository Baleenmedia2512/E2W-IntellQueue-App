// A wrapper to ensure companyName is set, else redirect to /login
'use client'
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAppSelector } from '@/redux/store';

export default function RequireCompanyName({ children }) {
  const companyName = useAppSelector(state => state.authSlice.companyName);
  const router = useRouter();

  useEffect(() => {
    if (!companyName) {
      router.push('/login');
    }
  }, [companyName, router]);

  return children;
}
