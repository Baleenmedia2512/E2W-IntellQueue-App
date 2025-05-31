'use client';

import { useState, useEffect } from 'react';
import { messaging, onMessage } from '../../lib/firebase-config';
import { getToken } from 'firebase/messaging';
import useFcmToken from "@/hooks/useFcmToken";

export default function PushNotificationPage() {
  // const [token, setToken] = useState('');
  // const [apiResponse, setApiResponse] = useState(null);
  const { token, notificationPermissionStatus } = useFcmToken();

  // useEffect(() => {
  //   // Foreground message listener initialized once when component mounts
  //   const unsubscribe = onMessage(messaging, (payload) => {
  //     console.log('📬 Foreground message received:', payload);

  //     const title = payload.notification?.title || 'Notification';
  //     const body = payload.notification?.body || 'You have a new message!';
  //     const options = {
  //       body,
  //       icon: '/icon-192x192.png',
  //       data: payload.data || {},
  //     };

  //     if (Notification.permission === 'granted') {
  //       navigator.serviceWorker.getRegistration().then((reg) => {
  //         if (reg) {
  //           reg.showNotification(title, options);
  //         } else {
  //           console.warn('No service worker registration found.');
  //         }
  //       });
  //     }
  //   });

  //   // Cleanup on unmount
  //   return () => unsubscribe();
  // }, []);

    const handleNotification = async () => {
    const response = await fetch("/api/send-notification", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        token: token,
        icon: "/icon-192x192.png",
        title: "Queue Update!",
        body: "Logesh is In-Progress",
        link: "/QueueDashboard",
      }),
    });

    const data = await response.json();
    console.log('📡 Backend response:', data);
  };


  // const handleFCMRegister = async () => {
  //   try {
  //     const permission = await Notification.requestPermission();
  //     console.log('🔔 Notification permission:', permission);

  //     if (permission === 'granted') {
  //       // const swReg = await navigator.serviceWorker.ready;
  //       const currentToken = await getToken(messaging, {
  //         vapidKey: process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY,
  //         // serviceWorkerRegistration: swReg,
  //       });

  //       if (currentToken) {
  //         console.log('🎉 FCM Token obtained:', currentToken);
  //         setToken(currentToken);

  //         // Send the token to the backend API
  //         const response = await fetch('/api/send-notification', {
  //           method: 'POST',
  //           headers: { 'Content-Type': 'application/json' },
  //           body: JSON.stringify({
  //             token: currentToken,
  //             title: 'Hello from FCM!',
  //             body: 'This is a test notification triggered from the client.',
  //             link: "/QueueDashboard",
  //           }),
  //         });

  //         const data = await response.json();
  //         console.log('📡 Backend response:', data);
  //         setApiResponse(data);
  //       } else {
  //         console.warn('⚠️ No registration token available.');
  //       }
  //     } else {
  //       console.warn('❌ Notification permission denied.');
  //     }
  //   } catch (error) {
  //     console.error('🔥 FCM error:', error);
  //   }
  // };

  return (
<main className="p-10 bg-white dark:bg-gray-900 text-black dark:text-white min-h-screen">
  <h1 className="text-4xl mb-4 font-bold">Firebase Cloud Messaging Demo</h1>

  {notificationPermissionStatus === "granted" ? (
    <p>Permission to receive notifications has been granted.</p>
  ) : notificationPermissionStatus !== null ? (
    <p>
      You have not granted permission to receive notifications. Please
      enable notifications in your browser settings.
    </p>
  ) : null}

  <button
    disabled={!token}
    className={`mt-5 px-4 py-2 rounded ${
      token
        ? 'bg-blue-500 text-white hover:bg-blue-600'
        : 'bg-gray-400 text-gray-200 cursor-not-allowed'
    }`}
    onClick={handleNotification}
  >
    Send Test Notification
  </button>
</main>

  );
}
