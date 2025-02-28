// utils/db.js
import { openDB } from 'idb';

export const initDB = async () => {
  return openDB('leadNotifications', 3, { // Increment version to 3
    upgrade(db, oldVersion) {
      // Handle database upgrades
      if (!db.objectStoreNames.contains('leads')) {
        // Create with auto-generated keys
        db.createObjectStore('leads', { 
          keyPath: 'id',
          autoIncrement: true 
        });
      }
      
      if (!db.objectStoreNames.contains('notifications')) {
        db.createObjectStore('notifications', {
          keyPath: 'leadId'
        });
      }

      if (oldVersion < 2) {
        // Migration logic for existing users
      }
    }
  });
};

export const storeLeads = async (leads) => {
  const db = await initDB();
  const tx = db.transaction('leads', 'readwrite');
  
  // Clear existing leads before storing new ones
  await tx.store.clear();
  
  // Add IDs to leads if missing
  const leadsWithIds = leads.map(lead => ({
    ...lead,
    id: lead.sNo || Date.now().toString()
  }));

  await Promise.all([
    ...leadsWithIds.map(lead => tx.store.put(lead)),
    tx.done
  ]);
};

export const getStoredLeads = async () => {
  const db = await initDB();
  return db.getAll('leads');
};

export const getCurrentUserFromIDB = async () => {
  const db = await initDB();
  return db.get('user', 'currentUser');
};