"use client";

import { useEffect, useRef, useState } from "react";
import { getToken, onMessage } from "firebase/messaging";
import { fetchToken, messaging } from "./../lib/firebase-config";
import { useRouter } from "next/navigation";
import { SaveFcmToken } from './../app/api/FetchAPI';
import { useAppSelector } from '@/redux/store';

async function getNotificationPermissionAndToken() {
  if (!("Notification" in window)) {
    console.info("This browser does not support desktop notification");
    return null;
  }

  if (Notification.permission === "granted") {
    return await fetchToken();
  }

  if (Notification.permission !== "denied") {
    const permission = await Notification.requestPermission();
    if (permission === "granted") {
      return await fetchToken();
    }
  }

  console.log("Notification permission not granted.");
  return null;
}

const useFcmToken = () => {
  const companyName = useAppSelector(state => state.authSlice.companyName);
  const router = useRouter();
  const [notificationPermissionStatus, setNotificationPermissionStatus] = useState(null);
  const [token, setToken] = useState([]);
  const retryLoadToken = useRef(0);
  const isLoading = useRef(false);

  const loadToken = async () => {
    if (isLoading.current) return;

    isLoading.current = true;
    const token = await getNotificationPermissionAndToken();

    if (Notification.permission === "denied") {
      setNotificationPermissionStatus("denied");
      isLoading.current = false;
      return;
    }

    if (!token) {
      if (retryLoadToken.current >= 3) {
        alert("Unable to load token, refresh the browser");
        isLoading.current = false;
        return;
      }

      retryLoadToken.current += 1;
      console.error("An error occurred while retrieving token. Retrying...");
      isLoading.current = false;
      await loadToken();
      return;
    }

    setNotificationPermissionStatus(Notification.permission);
    setToken(token);
    isLoading.current = false;
  };

  useEffect(() => {
    if ("Notification" in window) {
      loadToken();
    }
  }, []);

  useEffect(() => {
    const setupListener = async () => {
      if (!token) return;

      const m = await messaging();
      if (!m) return;

      const unsubscribe = onMessage(m, (payload) => {
        console.log("Foreground push notification received:", payload);

        const link = payload.fcmOptions?.link || payload.data?.link;
        const title = payload.notification?.title || "New Message";
        const body = payload.notification?.body || "You have a new message";

        // Show the toast via the global function
        window.showCustomToast(title, body, link, router);
      });

      return unsubscribe;
    };

    let unsubscribe = null;
    setupListener().then((unsub) => {
      if (unsub) unsubscribe = unsub;
    });

    return () => unsubscribe?.();
  }, [token, router]);

useEffect(() => {
  if (token) {
    const saveToken = async () => {
      try {
        const res = await SaveFcmToken(companyName, token);
        if (res && res.success) {
          console.log("Token saved successfully.");
        } else {
          console.warn("Token save response:", res);
        }
      } catch (error) {
        console.error("Error saving FCM token:", error);
      }
    };

    saveToken();
  }
}, [token]);


  return { token, notificationPermissionStatus };
};

export default useFcmToken;
