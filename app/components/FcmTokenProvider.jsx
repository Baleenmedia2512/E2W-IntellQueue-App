'use client';

import useFcmToken from '@/hooks/useFcmToken';
import { useEffect } from 'react';
import { usePathname } from 'next/navigation';

export default function FcmTokenProvider() {
  const pathname = usePathname();

  // Check if we are on the login page
  if (pathname === '/login') {
    return null; // Don't render anything
  }

  const { token, notificationPermissionStatus } = useFcmToken();

  useEffect(() => {
    console.log('FCM token:', token);
    console.log('Notification permission:', notificationPermissionStatus);
    // Additional logic here
  }, [token, notificationPermissionStatus]);

  return null;
}
