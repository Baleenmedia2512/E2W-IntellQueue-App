import { getStoredLeads, getCurrentUserFromIDB } from './utils/db';

// Global variable to store the current username
let currentUser = null;

// Listen for messages from the client
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SET_USERNAME') {
    currentUser = event.data.username;
    console.log('Username set in SW:', currentUser);
  }
});

/// custom-sw.js
self.addEventListener('sync', async (event) => {
  if (event.tag === 'check-followups') {
    event.waitUntil(handleBackgroundSync());
  }
});

self.addEventListener('periodicsync', (event) => {
  if (event.tag === 'followup-check') {
    event.waitUntil(handleBackgroundSync());
  }
});

const handleBackgroundSync = async () => {
  try {
    const [storedLeads] = await Promise.all([
      getStoredLeads()
    ]);

    const dueLeads = storedLeads.filter(lead => 
      isFollowupDue(lead.FollowupDate, lead.FollowupTime) &&
      !isNotificationSent(lead.sNo) &&
      lead.HandledBy === currentUser
    );

    dueLeads.forEach(lead => {
      showNotification(lead);
      markNotificationSent(lead.sNo);
    });
  } catch (error) {
    console.error('Background sync failed:', error);
    // Retry logic
    if (event.type === 'sync') {
      await new Promise(resolve => setTimeout(resolve, 5000));
      return handleBackgroundSync();
    }
  }
};