/**
 * A reusable deduplication utility for any action, based on key fields and time window.
 * 
 * @param {Object} options
 *   - windowMs: Number (deduplication window in ms)
 *   - keyFn: Function (optional) - generates a unique string key from arguments
 * 
 * Usage:
 *   const dedupe = createDeduplicator({ windowMs: 2000 }); // default key: JSON.stringify
 *   if (dedupe.shouldAllow({ a: 1, b: 2 })) { ... }
 * 
 *   // Custom key:
 *   const dedupe = createDeduplicator({ keyFn: ({ user, type }) => `${user}|${type}` });
 *   if (dedupe.shouldAllow({ user: "foo", type: "bar" })) { ... }
 */
export default function createDeduplicator({ windowMs = 2000, keyFn } = {}) {
  const lastSentMap = new Map();
  // Default key function: JSON.stringify for objects, toString for primitives
  const defaultKeyFn = (args) =>
    typeof args === "object" && args !== null
      ? JSON.stringify(args)
      : String(args);

  const getKey = keyFn || defaultKeyFn;

  return {
    /**
     * Returns true if the action should be allowed (not a duplicate in window).
     * @param {*} args - Arguments to use for deduplication key, passed to keyFn.
     */
    shouldAllow(args) {
      const key = getKey(args);
      const now = Date.now();
      if (lastSentMap.has(key)) {
        const last = lastSentMap.get(key);
        if (now - last < windowMs) return false;
      }
      lastSentMap.set(key, now);
      return true;
    },
    /**
     * Optionally, force reset a deduplication key (e.g., after manual action)
     */
    reset(args) {
      const key = getKey(args);
      lastSentMap.delete(key);
    },
    /**
     * Optionally, clear all deduplication history
     */
    clear() {
      lastSentMap.clear();
    }
  };
}