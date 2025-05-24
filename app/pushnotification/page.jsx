'use client';

import { useState } from 'react';
import { messaging, onMessage } from '../../firebase-config'; // adjust path as needed
import { getToken } from 'firebase/messaging';

export default function PushNotificationPage() {
  const [token, setToken] = useState('');

  const handleFCMRegister = async () => {
    try {
      if ('serviceWorker' in navigator) {
        await navigator.serviceWorker.register('/sw.js'); // adjust to your SW path
        console.log('Service worker registered');
      }

      const permission = await Notification.requestPermission();

      if (permission === 'granted') {
        const currentToken = await getToken(messaging, {
          vapidKey: process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY,
          serviceWorkerRegistration: await navigator.serviceWorker.register('/sw.js'), // adjust to your SW path
        });

        if (currentToken) {
          console.log('FCM Token:', currentToken);
          setToken(currentToken);
        } else {
          console.warn('No registration token available');
        }
      } else {
        console.warn('Notification permission denied');
      }

      onMessage(messaging, (payload) => {
        console.log('Message received in foreground:', payload);
        // const { title, body } = payload.notification || {};
        if (navigator.serviceWorker && navigator.serviceWorker.controller) {
          console.log('Sending message to service worker');
          // Send the payload to the service worker
          navigator.serviceWorker.controller.postMessage({
            payload: payload
          });
          console.log('Message sent to service worker');
        }
        console.log("After if condition")
      });
    } catch (error) {
      console.error('FCM error:', error);
    }
  };

  return (
    <main style={{ padding: 32, color: 'black' }}>
      <h1>Test FCM Push Notification</h1>
      <button onClick={handleFCMRegister} style={{ padding: 10 }}>
        Enable Notifications
      </button>
      {token && (
        <div style={{ marginTop: 20 }}>
          <p><strong>Your FCM Token:</strong></p>
          <code style={{ wordBreak: 'break-word' }}>{token}</code>
        </div>
      )}
    </main>
  );
}
