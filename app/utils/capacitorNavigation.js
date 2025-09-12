// Navigation utility to fix router issues in Capacitor apps

export class CapacitorNavigation {
  static isNative() {
    return !!(typeof window !== 'undefined' && window.Capacitor && typeof window.Capacitor.isNativePlatform === 'function' && window.Capacitor.isNativePlatform());
  }

  // Enhanced navigation for Capacitor apps
  static navigate(router, path, options = {}) {
    const { replace = false, fullReload = false } = options;

    // Helper: determine if this is an internal app path
    const isInternalPath = typeof path === 'string' && /^\/?(?!https?:\/\/|mailto:|tel:)/i.test(path);

    // Normalize internal paths to honor Next.js trailingSlash export config
    const normalizePath = (p) => {
      try {
        if (!p || !isInternalPath) return p;
        // Preserve query/hash
        const [base, suffix = ''] = String(p).split(/([?#].*)/);
        // If it has a file extension, leave as-is (e.g., /file.json)
        if (/\.[a-z0-9]+$/i.test(base)) return p;
        // Ensure trailing slash
        const normalizedBase = base.endsWith('/') ? base : `${base}/`;
        return `${normalizedBase}${suffix}`;
      } catch { return p; }
    };

    const targetPath = isInternalPath ? normalizePath(path) : path;

    // Avoid redundant navigations
    try {
      if (typeof window !== 'undefined' && isInternalPath) {
        const current = normalizePath(window.location.pathname) + (window.location.search || '') + (window.location.hash || '');
        const target = targetPath;
        if (current === target) {
          console.log('[CapacitorNavigation] Skipping navigation, already on path:', path);
          return;
        }
      }
    } catch {}

    // Prefer SPA (router) navigation even on native for internal routes
    if (isInternalPath && router && typeof router.push === 'function' && !fullReload) {
      try {
        console.log(`[CapacitorNavigation] SPA navigation to: ${targetPath} (replace=${replace})`);
        if (replace && typeof router.replace === 'function') {
          router.replace(targetPath);
        } else {
          router.push(targetPath);
        }
        return;
      } catch (err) {
        console.warn('[CapacitorNavigation] Router navigation failed, falling back to full reload:', err);
      }
    }

    // Fallbacks
    if (this.isNative()) {
      // On native, avoid early reloads during bootstrap; defer a tick
      console.log(`[CapacitorNavigation] Native fallback navigation to: ${targetPath} (replace=${replace})`);
      setTimeout(() => {
        if (replace) {
          window.location.replace(targetPath);
        } else {
          window.location.href = targetPath;
        }
      }, 50);
    } else {
      console.log(`[CapacitorNavigation] Web fallback navigation to: ${targetPath} (replace=${replace})`);
      if (replace) {
        window.location.replace(targetPath);
      } else {
        window.location.href = targetPath;
      }
    }
  }

  // Navigate with delay - useful after state changes
  static navigateWithDelay(router, path, delay = 100, options = {}) {
    setTimeout(() => {
      this.navigate(router, path, options);
    }, delay);
  }

  // Go back with proper handling
  static goBack(router) {
    if (this.isNative()) {
      if (window.history.length > 1) {
        window.history.back();
      } else {
        // If no history, go to home
        window.location.href = '/';
      }
    } else {
      router.back();
    }
  }

  // Reload current page
  static reload() {
    if (this.isNative()) {
      window.location.reload();
    } else {
      window.location.reload();
    }
  }

  // Get current path safely
  static getCurrentPath() {
    if (typeof window !== 'undefined') {
      return window.location.pathname;
    }
    return '/';
  }
}
