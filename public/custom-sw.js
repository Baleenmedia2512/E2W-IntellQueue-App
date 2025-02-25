// custom-sw.js
let currentUser = null;

self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SET_USERNAME') {
    currentUser = event.data.username;
    // Store in IndexedDB for persistence
    event.waitUntil(
      self.caches.open('user-data').then((cache) => {
        return cache.put('currentUser', new Response(JSON.stringify({ username: currentUser })));
      })
    );
  }
});

// Add this to initialize user data on service worker activation
self.addEventListener('activate', (event) => {
  event.waitUntil(
    self.caches.open('user-data').then((cache) => {
      return cache.match('currentUser').then((response) => {
        if (response) {
          return response.json().then((data) => {
            currentUser = data.username;
          });
        }
      });
    })
  );
});

const checkFollowups = async () => {
  try {
    // Get user from cache if not set
    if (!currentUser) {
      const cache = await self.caches.open('user-data');
      const response = await cache.match('currentUser');
      if (response) {
        const data = await response.json();
        currentUser = data.username;
      }
    }

    if (!currentUser) {
      console.warn('No currentUser available');
      return;
    }

    const response = await fetch('https://leads.baleenmedia.com/api/fetchLeads');
    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
    
    const data = await response.json();
    const now = new Date();

    const dueLeads = data.rows.filter((lead) => {
      try {
        if (lead.Status !== 'Call Followup') return false;
        if (!lead.HandledBy || lead.HandledBy.toLowerCase() !== currentUser.toLowerCase()) return false;
        
        const followupDate = new Date(`${lead.FollowupDate}T${lead.FollowupTime}`);
        return followupDate <= now;
      } catch (error) {
        console.error('Error processing lead:', lead, error);
        return false;
      }
    });

    dueLeads.forEach((lead) => {
      self.registration.showNotification('Followup Reminder', {
        body: `Time to call ${lead.name} at ${lead.FollowupTime}`,
        icon: '/icon-192x192.png',
        // badge: '/icons/badge-72x72.png',
        data: { leadId: lead.sNo },
        vibrate: [200, 100, 200]
      });
    });
  } catch (error) {
    console.error('Error in followup sync:', error);
    // Retry logic
    if (event && event.waitUntil) {
      event.waitUntil(
        self.registration.sync.register('retry-followup-check')
      );
    }
  }
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