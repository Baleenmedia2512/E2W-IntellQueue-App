importScripts('https://www.gstatic.com/firebasejs/10.7.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.7.0/firebase-messaging-compat.js');

// Workbox loader
if (!self.define) {
  let registry = {};
  let nextDefineUri;

  const singleRequire = (uri, parentUri) => {
    uri = new URL(uri + ".js", parentUri).href;
    return registry[uri] || (new Promise(resolve => {
      if ("document" in self) {
        const script = document.createElement("script");
        script.src = uri;
        script.onload = resolve;
        document.head.appendChild(script);
      } else {
        nextDefineUri = uri;
        importScripts(uri);
        resolve();
      }
    }).then(() => {
      let promise = registry[uri];
      if (!promise) {
        throw new Error(`Module ${uri} didn’t register its module`);
      }
      return promise;
    }));
  };

  self.define = (depsNames, factory) => {
    const uri = nextDefineUri || ("document" in self ? document.currentScript.src : "") || location.href;
    if (registry[uri]) return;
    let exports = {};
    const require = depUri => singleRequire(depUri, uri);
    const specialDeps = {
      module: { uri },
      exports,
      require
    };
    registry[uri] = Promise.all(depsNames.map(
      depName => specialDeps[depName] || require(depName)
    )).then(deps => {
      factory(...deps);
      return exports;
    });
  };
}

define(['./workbox-e43f5367'], function (workbox) {
  'use strict';

  importScripts("worker-development.js");

  self.skipWaiting();
  workbox.clientsClaim();

  workbox.registerRoute("/", new workbox.NetworkFirst({
    "cacheName": "start-url",
    plugins: [{
      cacheWillUpdate: async ({ request, response }) => {
        if (response && response.type === 'opaqueredirect') {
          return new Response(response.body, {
            status: 200,
            statusText: 'OK',
            headers: response.headers
          });
        }
        return response;
      }
    }]
  }), 'GET');

  workbox.registerRoute(/.*/i, new workbox.NetworkOnly({
    "cacheName": "dev",
    plugins: []
  }), 'GET');

  // ✅ Firebase Messaging INIT
  firebase.initializeApp({
    apiKey: "AIzaSyDrqkBnx4Xf4bDl8017B-6zLTExsh00kew",
    authDomain: "easy2work-c470d.firebaseapp.com",
    projectId: "easy2work-c470d",
    storageBucket: "easy2work-c470d.firebasestorage.app",
    messagingSenderId: "159467588074",
    appId: "1:159467588074:web:7a869cc9c27dafc230ca93",
    measurementId: "G-JM8JD4LPQQ"
  });

  const messaging = firebase.messaging();

  messaging.onBackgroundMessage(payload => {
    const { title, body } = payload.notification || {};
    if (title) {
      self.registration.showNotification(title || "Notification", { 
        body: body || "You have a new message",
        icon: "/icon-192x192.png",
      });
    }
  });
});