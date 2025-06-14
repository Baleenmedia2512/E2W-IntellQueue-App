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
    
    let notificationTitle;
    let notificationOptions;
    let link;

    if (payload.notification) {
        // Handle notification payload
        notificationTitle = payload.notification.title;
        notificationOptions = {
            body: payload.notification.body,
            icon: "/icon-192x192.png",
            data: { url: payload.fcmOptions?.link || payload.data?.link || "" },
        };
    } else if (payload.data) {
        // Handle data payload
        notificationTitle = payload.data.title;
        notificationOptions = {
            body: payload.data.body,
            icon: "/icon-192x192.png",
            data: { url: payload.data?.link || "" },
        };

    }

    if (notificationTitle) {
        return self.registration.showNotification(notificationTitle, notificationOptions);
    }
});

self.addEventListener("notificationclick", function (event) {
    event.notification.close();

    const urlToOpen = event.notification.data?.url || '/';

    event.waitUntil(
        clients.matchAll({
            type: 'window',
            includeUncontrolled: true
        }).then(function(clientList) {
            
            // Normalize the target URL
            const targetUrl = new URL(urlToOpen, self.location.origin);
            const targetPath = targetUrl.pathname + targetUrl.search;
            
            for (let client of clientList) {
                // Normalize the client URL
                const clientUrl = new URL(client.url);
                const clientPath = clientUrl.pathname + clientUrl.search;

                // Check if paths match (ignoring origin)
                if (clientPath === targetPath && 'focus' in client) {
                    return client.focus();
                }
            }
            
            return clients.openWindow(urlToOpen);
        })
    );
});
