/* Mangiaria service worker — notifications only (no offline caching). */

self.addEventListener("install", () => {
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(self.clients.claim());
});

// Focus (or open) the app when a notification is tapped.
self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  event.waitUntil(
    self.clients.matchAll({ type: "window", includeUncontrolled: true }).then((list) => {
      for (const client of list) {
        if ("focus" in client) return client.focus();
      }
      if (self.clients.openWindow) return self.clients.openWindow("/");
      return undefined;
    }),
  );
});

// Support for web-push (only fires if a push backend is later added).
self.addEventListener("push", (event) => {
  let data = { title: "Mangiaria", body: "" };
  try {
    if (event.data) data = event.data.json();
  } catch {
    /* keep default */
  }
  event.waitUntil(
    self.registration.showNotification(data.title || "Mangiaria", {
      body: data.body || "",
      tag: data.tag || "mangiaria",
    }),
  );
});
