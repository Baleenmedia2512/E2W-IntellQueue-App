'use client';

import { usePathname } from 'next/navigation';
import FcmTokenProvider from './components/FcmTokenProvider';

export default function ConditionalFcmWrapper() {
  const pathname = usePathname().replace(/\/$/, ''); // remove trailing slash if present

  const allowedQueuePages = [
    '/QueueSystem/ReadyScreen',
    '/QueueSystem/WaitingScreen',
    '/QueueSystem/ThankYouScreen'
  ];

  const isLoginPage = pathname === '/login' || pathname.startsWith('/login/');
  const isQueueSystemOtherPage =
    pathname.startsWith('/QueueSystem') && !allowedQueuePages.includes(pathname);

  if (isLoginPage || isQueueSystemOtherPage) {
    return null; // Don't trigger FCM here
  }

  return <FcmTokenProvider />;
}
