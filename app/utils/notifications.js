// utils/notifications.js
export const requestNotificationPermission = async () => {
    if (Notification.permission !== 'granted') {
      return await Notification.requestPermission();
    }
    return Notification.permission;
  };
  
  export const scheduleFollowupNotifications = (leads) => {
    if (!('serviceWorker' in navigator)) return;
  
    leads.forEach(lead => {
      if (lead.FollowupDate && lead.FollowupTime) {
        const followupDateTime = new Date(`${lead.FollowupDate}T${lead.FollowupTime}`);
        const now = new Date();
        
        if (followupDateTime > now) {
          // Schedule future notification
          const timeout = followupDateTime - now;
          
          setTimeout(() => {
            showNotification(lead);
          }, timeout);
        } else {
          // Show immediate notification for past followups
          showNotification(lead);
        }
      }
    });
  };
  
  const showNotification = (lead) => {
    if (Notification.permission === 'granted') {
      navigator.serviceWorker.ready.then(registration => {
        registration.showNotification('Followup Reminder', {
          body: `Followup with ${lead.name} at ${lead.FollowupTime}`,
          icon: '/icon-192x192.png',
          data: { leadId: lead.sNo }
        });
      });
    }
  };