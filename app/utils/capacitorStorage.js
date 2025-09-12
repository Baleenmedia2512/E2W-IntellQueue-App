// Capacitor Storage utility to fix router navigation issues
// NOTE: Avoid static imports of Capacitor plugins to prevent early native bridge access
let Capacitor = null;
let Preferences = null;

async function ensureCapacitorCore() {
  if (!Capacitor && typeof window !== 'undefined') {
    try {
      const mod = await import('@capacitor/core');
      Capacitor = mod.Capacitor;
    } catch (e) {
      // Capacitor not available (web or early load)
      Capacitor = null;
    }
  }
  return Capacitor;
}

async function ensurePreferences() {
  if (!Preferences && typeof window !== 'undefined') {
    try {
      const mod = await import('@capacitor/preferences');
      Preferences = mod.Preferences;
    } catch (e) {
      Preferences = null;
    }
  }
  return Preferences;
}

export class CapacitorStorage {
  static async isNative() {
    const cap = await ensureCapacitorCore();
    return !!(cap && cap.isNativePlatform());
  }

  // Set item with fallback to localStorage for web
  static async setItem(key, value) {
    try {
      if (await this.isNative() && await ensurePreferences()) {
        const prefs = await ensurePreferences();
        await prefs.set({
          key: key,
          value: typeof value === 'string' ? value : JSON.stringify(value)
        });
      } else {
        localStorage.setItem(key, typeof value === 'string' ? value : JSON.stringify(value));
      }
    } catch (error) {
      console.error('Error setting storage item:', error);
      // Fallback to localStorage even on native if Preferences fails
      localStorage.setItem(key, typeof value === 'string' ? value : JSON.stringify(value));
    }
  }

  // Get item with fallback to localStorage for web
  static async getItem(key) {
    try {
      if (await this.isNative() && await ensurePreferences()) {
        const prefs = await ensurePreferences();
        const result = await prefs.get({ key });
        return result.value;
      } else {
        return localStorage.getItem(key);
      }
    } catch (error) {
      console.error('Error getting storage item:', error);
      // Fallback to localStorage even on native if Preferences fails
      return localStorage.getItem(key);
    }
  }

  // Remove item with fallback to localStorage for web
  static async removeItem(key) {
    try {
      if (await this.isNative() && await ensurePreferences()) {
        const prefs = await ensurePreferences();
        await prefs.remove({ key });
      } else {
        localStorage.removeItem(key);
      }
    } catch (error) {
      console.error('Error removing storage item:', error);
      // Fallback to localStorage even on native if Preferences fails
      localStorage.removeItem(key);
    }
  }

  // Clear all storage
  static async clear() {
    try {
      if (await this.isNative() && await ensurePreferences()) {
        const prefs = await ensurePreferences();
        await prefs.clear();
      } else {
        localStorage.clear();
      }
    } catch (error) {
      console.error('Error clearing storage:', error);
      // Fallback to localStorage even on native if Preferences fails
      localStorage.clear();
    }
  }

  // Session storage equivalents (these will always use sessionStorage since Capacitor doesn't have session equivalent)
  static setSessionItem(key, value) {
    sessionStorage.setItem(key, typeof value === 'string' ? value : JSON.stringify(value));
  }

  static getSessionItem(key) {
    return sessionStorage.getItem(key);
  }

  static removeSessionItem(key) {
    sessionStorage.removeItem(key);
  }

  static clearSession() {
    sessionStorage.clear();
  }
}
