import { convertTimeToTimestamp, getStartOfDay } from "../LeadManager/Report/page";

// utils/notifications.js
export const requestNotificationPermission = async () => {
    if (Notification.permission !== 'granted') {
      return await Notification.requestPermission();
    }
    return Notification.permission;
  };
  
  export const scheduleFollowupNotifications = (leads,userName) => {
    if (!('serviceWorker' in navigator)) return;
    
    const now = new Date();
    const todayStr = now.toDateString();
    
  
    leads.forEach((lead) => {
      if (lead.FollowupDate && lead.FollowupTime) {
        // Convert lead FollowupDate & FollowupTime to a Date object.
        const followupDateTime = new Date(
          convertTimeToTimestamp(lead.FollowupTime, lead.FollowupDate)
        );

        // Check that the followup date is today.
        // if (getStartOfDay(lead.FollowupDate) !== getStartOfDay(now)) return;
        console.log(followupDateTime <= now && new Date(lead.FollowupDate).toDateString() === now.toDateString(), getStartOfDay(lead.FollowupDate) && lead.HandledBy === userName, lead.HandledBy, userName)
        // If the followup time is less than or equal to now, show notification.
        if (followupDateTime <= now && new Date(lead.FollowupDate).toDateString() === now.toDateString() && lead.notificationSent !== "Yes" && lead.HandledBy === userName) {
          console.log(lead)
          showNotification(lead);
        }
        // Else, if it's in the future (later today), do nothing (or schedule if needed).
      }
    });
  };
  
  const showNotification = (lead) => {
    if (Notification.permission === 'granted') {
      navigator.serviceWorker.ready.then(registration => {
        registration.showNotification('Followup Reminder', {
          body: `Followup with ${lead.Name} at ${lead.FollowupTime}`,
          icon: '/icon-192x192.png',
          data: { leadId: lead.sNo }
        });
      });
    }
  };

  // utils/notifications.js
export const isNotificationSent = async (leadId) => {
  const db = await initDB();
  return db.get('notifications', leadId);
};

export const markNotificationSent = async (leadId) => {
  const db = await initDB();
  await db.put('notifications', { id: leadId, sentAt: new Date() });
};