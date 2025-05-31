// firebase-config.js
import { initializeApp } from 'firebase/app';
import { getMessaging, onMessage } from 'firebase/messaging';

const firebaseConfig = {
  apiKey: "AIzaSyDrqkBnx4Xf4bDl8017B-6zLTExsh00kew",
  authDomain: "easy2work-c470d.firebaseapp.com",
  projectId: "easy2work-c470d",
  storageBucket: "easy2work-c470d.firebasestorage.app",
  messagingSenderId: "159467588074",
  appId: "1:159467588074:web:7a869cc9c27dafc230ca93",
  measurementId: "G-JM8JD4LPQQ"
};

const app = initializeApp(firebaseConfig);

let messaging;
if (typeof window !== 'undefined') {
  messaging = getMessaging(app);
}

export { messaging, onMessage };
