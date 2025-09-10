// Capacitor Storage utility to fix router navigation issues
import { Preferences } from '@capacitor/preferences';
import { Capacitor } from '@capacitor/core';

export class CapacitorStorage {
  static isNative() {
    return Capacitor.isNativePlatform();
  }

  // Set item with fallback to localStorage for web
  static async setItem(key, value) {
    try {
      if (this.isNative()) {
        await Preferences.set({
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
      if (this.isNative()) {
        const result = await Preferences.get({ key });
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
      if (this.isNative()) {
        await Preferences.remove({ key });
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
      if (this.isNative()) {
        await Preferences.clear();
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
