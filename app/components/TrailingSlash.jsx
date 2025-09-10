'use client';

import { useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';

// Ensures internal routes include a trailing slash to match next.config.js (output: 'export', trailingSlash: true)
export default function TrailingSlash() {
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    if (!pathname || pathname === '/') return;

    // Ignore Next.js internals
    if (pathname.startsWith('/_next') || pathname.startsWith('/api')) return;

    // If no trailing slash, normalize via SPA replace (no reload)
    if (!pathname.endsWith('/')) {
      try {
        const search = window.location.search || '';
        const hash = window.location.hash || '';
        router.replace(`${pathname}/${search}${hash}`);
      } catch {
        // Last resort, minimal reload
        window.location.replace(`${pathname}/`);
      }
    }
  }, [pathname, router]);

  return null;
}
