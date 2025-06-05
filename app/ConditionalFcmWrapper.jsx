'use client';

import { usePathname } from 'next/navigation';
import FcmTokenProvider from './components/FcmTokenProvider';

export default function ConditionalFcmWrapper() {
  const pathname = usePathname();
  
  // Don't render FcmTokenProvider at all on login page
  if (pathname === '/login') {
    return null;
  }
  
  return <FcmTokenProvider />;
}