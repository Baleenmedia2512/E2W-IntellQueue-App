'use client';

import { useEffect } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';

// Ensure trailing slash and strip accidental double slashes without triggering full reloads
export default function RouteNormalizer() {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    if (!pathname) return;
    if (pathname.startsWith('/_next') || pathname.startsWith('/api')) return;

    try {
      // Build normalized URL with trailing slash
      const url = new URL(window.location.href);
      let newPath = pathname.replace(/\/+$/, '');
      if (newPath === '') newPath = '/';
      if (newPath !== '/' && !newPath.endsWith('/')) newPath += '/';

      const normalized = `${newPath}${searchParams?.toString() ? `?${searchParams.toString()}` : ''}${url.hash || ''}`;

      if ((url.pathname + url.search + url.hash) !== normalized) {
        // Soft replace without reload
        window.history.replaceState(window.history.state, '', normalized);
      }
    } catch {}
  }, [pathname, searchParams]);

  return null;
}
