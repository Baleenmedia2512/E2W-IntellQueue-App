// custom-sw.js
if (!self.define) {
  let registry = {};
  let nextDefineUri;
  const singleRequire = (uri, parentUri) => {
    uri = new URL(uri + ".js", parentUri).href;
    return registry[uri] || (
      new Promise((resolve) => {
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
      })
      .then(() => {
        let promise = registry[uri];
        if (!promise) {
          throw new Error(`Module ${uri} didn’t register its module`);
        }
        return promise;
      })
    );
  };

  self.define = (depsNames, factory) => {
    const uri =
      nextDefineUri ||
      ("document" in self ? document.currentScript.src : "") ||
      location.href;
    if (registry[uri]) {
      return;
    }
    let exports = {};
    const require = (depUri) => singleRequire(depUri, uri);
    const specialDeps = {
      module: { uri },
      exports,
      require,
    };
    registry[uri] = Promise.all(
      depsNames.map((depName) => specialDeps[depName] || require(depName))
    ).then((deps) => {
      factory(...deps);
      return exports;
    });
  };
}

define(['./workbox-e43f5367'], (function (workbox) {
  'use strict';

  importScripts("worker-development.js");
  self.skipWaiting();
  workbox.clientsClaim();
  workbox.registerRoute(
    "/",
    new workbox.NetworkFirst({
      cacheName: "start-url",
      plugins: [
        {
          cacheWillUpdate: async ({ response }) => {
            if (response && response.type === "opaqueredirect") {
              return new Response(response.body, {
                status: 200,
                statusText: "OK",
                headers: response.headers,
              });
            }
            return response;
          },
        },
      ],
    }),
    "GET"
  );
  workbox.registerRoute(
    /.*/i,
    new workbox.NetworkOnly({
      cacheName: "dev",
      plugins: [],
    }),
    "GET"
  );
}));

// Listen for messages from the client to set the username.
self.addEventListener("message", (event) => {
  if (event.data?.type === "SET_USERNAME") {
    self.userName = event.data.username;
    console.log("Username set in SW:", self.userName);
  }
});

// Listen for periodic sync events to trigger followup checks.
self.addEventListener("periodicsync", (event) => {
  if (event.tag === "followup-check") {
    event.waitUntil(handleFollowupSync());
  }
});

async function handleFollowupSync() {
  console.log("Periodic sync event fired for followup notifications");
  // Here you can add logic to retrieve leads and username from IndexedDB,
  // then call the scheduling function to show notifications.
}
