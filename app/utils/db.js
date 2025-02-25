// utils/db.js
import { openDB } from 'idb';

const dbPromise = openDB('leadDB', 1, {
  upgrade(db) {
    db.createObjectStore('followups', { keyPath: 'id' });
  },
});

export const saveFollowups = async (leads) => {
  const db = await dbPromise;
  const tx = db.transaction('followups', 'readwrite');
  leads.forEach(lead => tx.store.put(lead));
  await tx.done;
};

export const getPendingFollowups = async () => {
  const db = await dbPromise;
  return db.getAll('followups');
};