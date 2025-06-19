'use client';

import useFcmToken from '@/hooks/useFcmToken';
import { useEffect } from 'react';

export default function FcmTokenProvider() {
  const { token, notificationPermissionStatus } = useFcmToken();

  useEffect(() => {
    console.log('Notification permission:', notificationPermissionStatus);
  }, [token, notificationPermissionStatus]);

  return null;
}