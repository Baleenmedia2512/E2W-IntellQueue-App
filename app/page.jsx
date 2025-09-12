'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthRedirect } from './hooks/useAuthRedirect';

export default function HomePage() {
  const router = useRouter();
  
  // Auth check - redirect to login if no company name, otherwise continue
  const { companyName, userName } = useAuthRedirect();

  useEffect(() => {
    // Only redirect to QueueDashboard if we have auth
    if (companyName && userName) {
      router.replace('/QueueDashboard');
    }
    // If no auth, useAuthRedirect will handle login redirect
  }, [router, companyName, userName]);

  // Show minimal loading state while redirecting
  return (
    <div className="flex justify-center items-center h-screen">
      <div className="ld-ripple">
        <div></div>
        <div></div>
      </div>
    </div>
  );
}