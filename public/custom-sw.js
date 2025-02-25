// custom-sw.js

// Use postMessage to get the current username from your client
let currentUser = null;
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SET_USERNAME') {
    currentUser = event.data.username;
    // Optionally, store in IndexedDB or cache for persistence.
  }
});

// Periodic Sync event in the service worker
self.addEventListener('periodicsync', (event) => {
  if (event.tag === 'followup-check') {
    event.waitUntil(checkFollowups());
  }
});

// Notification click handler (to open the lead manager page)
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      if (clientList.length > 0) {
        // Force navigation to your lead page if needed:
        return clientList[0].navigate(`/lead/${event.notification.data.leadId}`).then(() => clientList[0].focus());
      }
      return clients.openWindow(`/lead/${event.notification.data.leadId}`);
    })
  );
});

const checkFollowups = async () => {
  try {
    // Make sure currentUser is available (you might load it from IndexedDB if needed)
    if (!currentUser) {
      console.warn('No currentUser available in SW.');
      return;
    }
    
    const response = await fetch('https://leads.baleenmedia.com/api/fetchLeads');
    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
    
    const data = await response.json();
    const now = new Date();
    const todayStr = now.toDateString();

    // Filter for today's followup leads with time less than or equal to now,
    // not already notified, and handled by currentUser.
    const dueLeads = data.rows.filter((lead) => {
      if (!lead.FollowupDate || !lead.FollowupTime) return false;
      // Ensure followup date is today
      if (new Date(lead.FollowupDate).toDateString() !== todayStr) return false;
      
      // Check if the lead is due (followup time is less than or equal to now)
      const followupDateTime = new Date(convertTimeToTimestamp(lead.FollowupTime, lead.FollowupDate));
      if (followupDateTime > now) return false;
      
      // Check if handled by currentUser (make sure to normalize casing)
      if (lead.HandledBy.trim().toLowerCase() !== currentUser.trim().toLowerCase()) return false;
      
      // Optionally, check if notification was already sent (if that flag is in your data)
      if (lead.notificationSent === "Yes") return false;
      
      return true;
    });

    dueLeads.forEach((lead) => {
      self.registration.showNotification('Followup Reminder', {
        body: `Followup with ${lead.name} at ${lead.FollowupTime}`,
        icon: '/icon-192x192.png',
        data: { leadId: lead.sNo }
      });
    });
  } catch (error) {
    console.error('Error in followup sync:', error);
  }
};

// Helper: Make sure you include your convertTimeToTimestamp function here
// (or inline its logic)
function convertTimeToTimestamp(timeStr, dateStr) {
  // Your conversion logic here. For example:
  // Assuming timeStr is in "HH:mm" format and dateStr is in "YYYY-MM-DD"
  return `${dateStr}T${timeStr}:00`;
}

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