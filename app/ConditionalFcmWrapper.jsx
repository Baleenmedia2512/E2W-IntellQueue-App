'use client';

import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import FcmTokenProvider from './components/FcmTokenProvider';

export default function ConditionalFcmWrapper() {
  const pathname = usePathname().replace(/\/$/, ''); // remove trailing slash if present
  const [isAndroid, setIsAndroid] = useState(false);

  useEffect(() => {
    // Check if we're on Android platform
    const checkPlatform = async () => {
      try {
        if (typeof window !== 'undefined' && window.Capacitor) {
          const { Capacitor } = await import('@capacitor/core');
          const platform = Capacitor.getPlatform();
          setIsAndroid(platform === 'android');
          
          if (platform === 'android') {
            console.log('Android platform detected - Firebase/FCM disabled to prevent crashes');
          }
        }
      } catch (error) {
        console.log('Capacitor not available, assuming web platform');
        setIsAndroid(false);
      }
    };

    checkPlatform();
  }, []);

  const allowedQueuePages = [
    '/QueueSystem/ReadyScreen',
    '/QueueSystem/WaitingScreen',
    '/QueueSystem/ThankYouScreen'
  ];

  const isLoginPage = pathname === '/login' || pathname.startsWith('/login/');
  const isQueueSystemOtherPage =
    pathname.startsWith('/QueueSystem') && !allowedQueuePages.includes(pathname);

  // Skip FCM completely on Android to prevent Firebase crashes
  if (isAndroid) {
    console.log('FCM disabled on Android platform');
    return null;
  }

  if (isLoginPage || isQueueSystemOtherPage) {
    return null; // Don't trigger FCM here
  }

  return <FcmTokenProvider />;
}
