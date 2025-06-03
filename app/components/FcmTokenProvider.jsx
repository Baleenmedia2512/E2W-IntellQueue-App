'use client';

import useFcmToken from '@/hooks/useFcmToken';
import { useEffect } from 'react';
import { usePathname } from 'next/navigation';

export default function FcmTokenProvider() {
  const pathname = usePathname();
  const { token, notificationPermissionStatus } = useFcmToken(); // Always call hooks

  useEffect(() => {
    if (pathname !== '/login') {
      console.log('FCM token:', token);
      console.log('Notification permission:', notificationPermissionStatus);
      // Additional logic
    }
  }, [pathname, token, notificationPermissionStatus]);

  // You can still return early, but only after all hooks
  if (pathname === '/login') {
    return null;
  }

  return null;
}
