importScripts('https://www.gstatic.com/firebasejs/9.6.1/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/9.6.1/firebase-messaging-compat.js');

firebase.initializeApp({
    apiKey: "AIzaSyDrqkBnx4Xf4bDl8017B-6zLTExsh00kew",
    authDomain: "easy2work-c470d.firebaseapp.com",
    projectId: "easy2work-c470d",
    storageBucket: "easy2work-c470d.firebasestorage.app",
    messagingSenderId: "159467588074",
    appId: "1:159467588074:web:7a869cc9c27dafc230ca93",
    measurementId: "G-JM8JD4LPQQ",
});

const messaging = firebase.messaging();

messaging.onBackgroundMessage(function(payload) {
    console.log('[firebase-messaging-sw.js] Received background message ', payload);
    
    // Skip custom notification if it contains notification payload
    if (payload.notification) {
        console.log("Notification already handled by Firebase");
        return;
    }

    const link = payload.fcmOptions?.link || payload.data?.link;
    const notificationTitle = payload.notification.title;
    const notificationOptions = {
        body: payload.notification.body,
        icon: "/icon-192x192.png",
        data: { url: link },
    };

    self.registration.showNotification(notificationTitle, notificationOptions);
});

self.addEventListener("notificationclick", function (event) {
    console.log('[firebase-messaging-sw.js] Received notification click');

    event.notification.close();

    event.waitUntil(
        clients
        .matchAll({ type: "window", includeUncontrolled: true })
        .then(function (clientList) {
            const url = event.notification.data.url;
            if (!url) return;

            for (const client of clientList) {
                if (client.url === url && "focus" in client) {
                    return client.focus();
                }
            }

            if (clients.openWindow) {
                console.log("OPENWINDOW ON CLIENT");
                return clients.openWindow(url);
            }
        })
    );
});
