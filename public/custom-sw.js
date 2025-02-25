// custom-sw.js
let currentUser = null;

self.addEventListener('periodicsync', (event) => {
  if (event.tag === 'followup-check') {
    event.waitUntil(checkFollowups(true)); // Pass isPeriodicCheck flag
  }
});

const checkFollowups = async (isPeriodicCheck = false) => {
  try {
    const response = await fetch('https://leads.baleenmedia.com/api/fetchLeads');
    const data = await response.json();
    
    const dueLeads = data.rows.filter(lead => {
      if (!isFollowupDue(lead.FollowupDate, lead.FollowupTime)) return false;
      return !isNotificationSent(lead.id);
    });

    dueLeads.forEach(lead => {
      showNotification(lead);
      markNotificationSent(lead.id);
    });
  } catch (error) {
    console.error('Error in followup sync:', error);
  }
};

// IndexedDB helpers
const markNotificationSent = async (leadId) => {
  const db = await openDB('notifications', 1, {
    upgrade(db) {
      db.createObjectStore('sentNotifications');
    }
  });
  await db.put('sentNotifications', true, leadId);
};

const isNotificationSent = async (leadId) => {
  const db = await openDB('notifications', 1);
  return !!await db.get('sentNotifications', leadId);
};

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      // If there is at least one client, check if it's already at the correct URL.
      if (clientList.length > 0) {
        for (const client of clientList) {
          // If the client is already open but not on the lead page, navigate it.
          if (!client.url.includes(`/LeadManager`)) {
            client.navigate(`/LeadManager`);
          }
          return client.focus();
        }
      }
      // If no window is open, open a new one.
      return clients.openWindow(`/LeadManager`);
    })
  );
});


self.addEventListener('sync', (event) => {
  if (event.tag === 'retry-followup-check') {
    event.waitUntil(checkFollowups());
  }
});