"use client";

import { useEffect, useRef, useState } from "react";
import { getToken, onMessage } from "firebase/messaging";
import { fetchToken, messaging } from "./../lib/firebase-config";
import { useRouter, usePathname } from "next/navigation";
import { SaveFcmToken, SaveQueueClientFcmToken } from './../app/api/FetchAPI';
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

  return null;
}

const useFcmToken = () => {
  const companyName = useAppSelector(state => state.authSlice.companyName);
  const phoneNumber = useAppSelector(state => state.queueSlice.phoneNumber); //Queue-Client
  const router = useRouter();
  const pathname = usePathname();
  const [notificationPermissionStatus, setNotificationPermissionStatus] = useState(null);
  const [token, setToken] = useState([]);
  const retryLoadToken = useRef(0);
  const isLoading = useRef(false);

  const isQueueSystemScreen =
    pathname?.startsWith("/QueueSystem/ReadyScreen") ||
    pathname?.startsWith("/QueueSystem/ThankYouScreen") ||
    pathname?.startsWith("/QueueSystem/WaitingScreen");

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

        const link = payload.data?.link || payload.fcmOptions?.link || "";
        const title = payload.data?.title || payload.notification.title || "New Message";
        const body = payload.data?.body || payload.notification?.body || "You have a new message";

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
    if (typeof token === "string" && token.trim() !== "") {
      const saveToken = async () => {
        try {
          if (isQueueSystemScreen) {
            if (phoneNumber) {
              const res2 = await SaveQueueClientFcmToken(companyName, phoneNumber, token);
              if (res2 && res2.success) {
              } else {
                console.warn("Queue token save response:", res2);
              }
            } else {
              console.warn("QueueSystem screen but phone number is empty, token will not be saved.");
            }
          } else {
            const res = await SaveFcmToken(companyName, token);
            if (res && res.success) {
            } else {
              console.warn("Token save response:", res);
            }
          }
        } catch (error) {
          console.error("Error saving FCM token:", error);
        }
      };

      saveToken();
    } else {
      console.warn("FCM token is empty or invalid, not saving.");
    }

  }, [token, isQueueSystemScreen, phoneNumber, companyName]);


  return { token, notificationPermissionStatus };
};

export default useFcmToken;
