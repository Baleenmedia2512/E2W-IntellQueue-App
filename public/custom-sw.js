// custom-sw.js

// --- Your custom code starts here ---

let currentUser = null;

self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SET_USERNAME') {
    currentUser = event.data.username;
  }
});

self.addEventListener('periodicsync', (event) => {
  if (event.tag === 'followup-check') {
    event.waitUntil(checkFollowups());
  }
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      if (clientList.length > 0) {
        return clientList[0].focus();
      }
      return clients.openWindow(`/lead/${event.notification.data.leadId}`);
    })
  );
});

const checkFollowups = async () => {
  try {
    // Fetch your leads from your API.
    const response = await fetch('https://leads.baleenmedia.com/api/fetchLeads');
    if (!response.ok) throw new Error('Failed to fetch leads');
    const data = await response.json();

    // Use the currentUser (from postMessage) in filtering.
    if (!currentUser) {
      console.warn('No currentUser set in SW.');
      return;
    }

    const dueLeads = data.rows.filter((lead) =>
      lead.Status === 'Call Followup' &&
      lead.HandledBy &&
      lead.HandledBy.toLowerCase() === currentUser.toLowerCase() &&
      new Date(`${lead.FollowupDate}T${lead.FollowupTime}`) <= new Date()
    );

    dueLeads.forEach((lead) => {
      self.registration.showNotification('Followup Reminder', {
        body: `Time to call ${lead.name} at ${lead.FollowupTime}`,
        icon: '/icons/icon-192x192.png',
        data: { leadId: lead.sNo },
      });
    });
  } catch (error) {
    console.error('Error in followup sync:', error);
  }
};

// --- End of your custom code ---
