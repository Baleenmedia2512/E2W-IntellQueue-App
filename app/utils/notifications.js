// utils/notifications.js
import { isNotificationSent, markNotificationSent } from './db';

const isToday = (date) => {
  const today = new Date();
  return (
    date.getDate() === today.getDate() &&
    date.getMonth() === today.getMonth() &&
    date.getFullYear() === today.getFullYear()
  );
};

export const scheduleFollowupNotifications = async (leads, userName) => {
  if (!('serviceWorker' in navigator)) return;

  const now = new Date();
  const validLeads = [];

  // Process each lead asynchronously.
  for (const lead of leads) {
    try {
      // Parse the DD-MMM-YYYY formatted date.
      const [day, monthStr, year] = lead.FollowupDate.split('-');
      const monthMap = { Jan: 0, Feb: 1, Mar: 2, Apr: 3, May: 4, Jun: 5, Jul: 6, Aug: 7, Sep: 8, Oct: 9, Nov: 10, Dec: 11 };
      const month = monthMap[monthStr];

      // Parse the "9:28 am" formatted time.
      let [time, period] = lead.FollowupTime.split(' ');
      let [hours, minutes] = time.split(':').map(Number);
      if (period.toLowerCase() === 'pm' && hours !== 12) hours += 12;
      if (period.toLowerCase() === 'am' && hours === 12) hours = 0;

      // Combine date and time into a Date object.
      const followupDate = new Date(year, month, day, hours, minutes);
      // Create a unique notification ID based on the lead and followup time.
      const notifId = `lead-${lead.SNo}-${followupDate.getTime()}`;

      // Check if the lead meets criteria and if a notification hasn’t been sent yet.
      const alreadyNotified = await isNotificationSent(notifId);
      if (
        isToday(followupDate) &&
        followupDate <= now &&
        lead.HandledBy === userName &&
        !alreadyNotified
      ) {
        validLeads.push({ lead, followupDate, notifId });
      }
    } catch (error) {
      console.error('Error processing lead for notification:', error, lead);
    }
  }

  // Show notifications for valid leads.
  for (const { lead, notifId } of validLeads) {
    try {
      const registration = await navigator.serviceWorker.ready;
      registration.showNotification('Followup Reminder', {
        body: `Followup with ${lead.Name} is due`,
        icon: '/icon-192x192.png',
        data: { leadId: lead.SNo, notifId },
      });
      await markNotificationSent(notifId);
    } catch (error) {
      console.error('Error showing notification:', error);
    }
  }
};
