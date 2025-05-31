'use client';

import { useState } from 'react';
import { messaging, onMessage } from '../../lib/firebase-config'; // adjust path as needed
import { getToken } from 'firebase/messaging';

export default function PushNotificationPage() {
  const [token, setToken] = useState('');
  const [apiResponse, setApiResponse] = useState(null);

  const handleFCMRegister = async () => {
    try {
      const permission = await Notification.requestPermission();
      console.log('🔔 Notification permission:', permission);

      if (permission === 'granted') {
        const swReg = await navigator.serviceWorker.ready;
        const currentToken = await getToken(messaging, {
          vapidKey: process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY,
          serviceWorkerRegistration: swReg,
        });

        if (currentToken) {
          console.log('🎉 FCM Token obtained:', currentToken);
          setToken(currentToken);

          // Send the token to the backend API
          const response = await fetch('/api/send-notification', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              token: currentToken,
              title: 'Hello from FCM!',
              body: 'This is a test notification triggered from the client.',
            }),
          });

          const data = await response.json();
          console.log('📡 Backend response:', data);
          setApiResponse(data);
        } else {
          console.warn('⚠️ No registration token available. Request permission to generate one.');
        }
      } else {
        console.warn('❌ Notification permission denied.');
      }

      // Listen for foreground messages
      onMessage(messaging, (payload) => {
        console.log('📬 Foreground message received:', payload);
        
        const title = payload.notification?.title || 'Notification';
        const body = payload.notification?.body || 'You have a new message!';
        const options = {
          body,
          icon: '/firebase-logo.png', // Optional
          data: payload.data || {},
        };

        if (Notification.permission === 'granted') {
          navigator.serviceWorker.getRegistration().then(reg => {
            if (reg) {
              reg.showNotification(title, options);
            } else {
              console.warn('No service worker registration found.');
            }
          });
        }
      });



    } catch (error) {
      console.error('🔥 FCM error:', error);
    }
  };

  return (
    <main style={{ padding: 32, color: 'black' }}>
      <h1>🔥 Test FCM Push Notification</h1>
      <button onClick={handleFCMRegister} style={{ padding: 10 }}>
        Enable Notifications & Send Test
      </button>

      {token && (
        <div style={{ marginTop: 20 }}>
          <p><strong>📲 Your FCM Token:</strong></p>
          <code style={{ wordBreak: 'break-word' }}>{token}</code>
        </div>
      )}

      {apiResponse && (
        <div style={{ marginTop: 20 }}>
          <p><strong>✅ Backend Response:</strong></p>
          <pre>{JSON.stringify(apiResponse, null, 2)}</pre>
        </div>
      )}
    </main>
  );
}
