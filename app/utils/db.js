// utils/db.js
import { openDB } from 'idb';

export const initDB = async () => {
  return openDB('leadNotifications', 5, {
    upgrade(db, oldVersion) {
      // Create "leads" store with a consistent keyPath.
      if (!db.objectStoreNames.contains('leads')) {
        const leadStore = db.createObjectStore('leads', {
          keyPath: 'id',
          autoIncrement: true,
        });
        leadStore.createIndex('SNo', 'SNo');
        leadStore.createIndex('Name', 'Name');
      }
      // Create "notifications" store using a key that will be our notification ID.
      if (!db.objectStoreNames.contains('notifications')) {
        db.createObjectStore('notifications', {
          keyPath: 'leadId',
        });
      }
      // Create "user" store for storing the current username.
      if (!db.objectStoreNames.contains('user')) {
        db.createObjectStore('user');
      }
    },
  });
};

export const storeLeads = async (leads) => {
  const db = await initDB();
  const tx = db.transaction('leads', 'readwrite');
  // Clear existing leads before storing new ones.
  await tx.store.clear();

  for (const lead of leads) {
    try {
      const processedLead = {
        ...lead,
        // Create a unique id using SNo (or timestamp) and a random suffix.
        id: `lead_${lead.SNo || Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
      };
      await tx.store.put(processedLead);
    } catch (error) {
      console.error('Error storing lead:', lead, error);
    }
  }
  await tx.done;
};

export const getStoredLeads = async () => {
  const db = await initDB();
  return db.getAll('leads');
};

export const storeUsername = async (username) => {
  try {
    const db = await initDB();
    const tx = db.transaction('user', 'readwrite');
    await tx.store.put(username, 'currentUser');
    return tx.done;
  } catch (error) {
    console.error('Error storing username:', error);
  }
};

export const getCurrentUserFromIDB = async () => {
  try {
    const db = await initDB();
    return db.get('user', 'currentUser');
  } catch (error) {
    console.error('Error getting current user:', error);
    return null;
  }
};

export const isNotificationSent = async (notifId) => {
  try {
    const db = await initDB();
    const result = await db.get('notifications', notifId);
    return !!result;
  } catch (error) {
    console.error('Error checking notification status:', error);
    return false;
  }
};

export const markNotificationSent = async (notifId) => {
  try {
    const db = await initDB();
    const tx = db.transaction('notifications', 'readwrite');
    await tx.store.put({ leadId: notifId, timestamp: Date.now() });
    return tx.done;
  } catch (error) {
    console.error('Error marking notification as sent:', error);
  }
};
