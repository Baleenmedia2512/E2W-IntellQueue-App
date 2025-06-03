'use client';

import useFcmToken from '@/hooks/useFcmToken';
import { useEffect } from 'react';

export default function FcmTokenProvider() {
  const { token, notificationPermissionStatus } = useFcmToken();

  useEffect(() => {
    console.log('FCM token:', token);
    console.log('Notification permission:', notificationPermissionStatus);
    // Additional logic here
  }, [token, notificationPermissionStatus]);

  return null;
}