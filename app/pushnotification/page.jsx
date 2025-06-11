'use client';

import { useState } from 'react';
import { messaging, onMessage } from '../../lib/firebase-config';
import { getToken } from 'firebase/messaging';
import useFcmToken from "@/hooks/useFcmToken";
import { useAppSelector } from '@/redux/store';
import { fetchFcmTokens } from './../api/FetchAPI';

export default function PushNotificationPage() {
  const companyName = useAppSelector(state => state.authSlice.companyName);
  const { token, notificationPermissionStatus } = useFcmToken();

  const handleNotification = async () => {
    try {
      // Fetch the latest tokens right before sending
      const tokenArray = await fetchFcmTokens(companyName);
      const filteredTokens = tokenArray.filter(Boolean);  // Filter valid tokens

      if (!filteredTokens.length) {
        console.warn("No tokens available to send notification.");
        return;
      }

      const response = await fetch("/api/send-notification", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          token: filteredTokens,  // sending array of tokens
          icon: "/icon-192x192.png",
          title: "Queue Update!",
          body: "Logesh is In-Progress",
          link: "/QueueDashboard",
        }),
      });

      const data = await response.json();
      console.log('📡 Backend response:', data);
    } catch (error) {
      console.error("Error sending notification:", error);
    }
  };

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
        className="mt-5 px-4 py-2 rounded bg-blue-500 text-white hover:bg-blue-600"
        onClick={handleNotification}
      >
        Send Test Notification
      </button>
    </main>
  );
}
