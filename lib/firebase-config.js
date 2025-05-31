// firebase-config.js
import { getApp, getApps, initializeApp } from "firebase/app";
import { getMessaging, getToken, isSupported } from "firebase/messaging";

const firebaseConfig = {
  apiKey: "AIzaSyDrqkBnx4Xf4bDl8017B-6zLTExsh00kew",
  authDomain: "easy2work-c470d.firebaseapp.com",
  projectId: "easy2work-c470d",
  storageBucket: "easy2work-c470d.firebasestorage.app",
  messagingSenderId: "159467588074",
  appId: "1:159467588074:web:7a869cc9c27dafc230ca93",
  measurementId: "G-JM8JD4LPQQ"
};

// Initialize Firebase app
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();

// Messaging instance wrapped for isSupported check (now async)
const messaging = async () => {
  const supported = await isSupported();
  return supported ? getMessaging(app) : null;
};

// Fetch FCM token with VAPID key (still async)
const fetchToken = async () => {
  try {
    const fcmMessaging = await messaging();
    if (fcmMessaging) {
      const token = await getToken(fcmMessaging, {
        vapidKey: process.env.NEXT_PUBLIC_FIREBASE_FCM_VAPID_KEY,
      });
      return token;
    }
    return null;
  } catch (err) {
    console.error("An error occurred while fetching the token:", err);
    return null;
  }
};

// Export app and messaging functions
export { app, messaging, fetchToken };
