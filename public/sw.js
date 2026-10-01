// Milo's service worker: it only shows pushes and opens Milo when one is pressed. No caching.

self.addEventListener("push", (event) => {
  const data = event.data ? event.data.json() : {};
  event.waitUntil(
    (async () => {
      // Milo is in front of you: its own toast already said it
      const windows = await self.clients.matchAll({ type: "window", includeUncontrolled: true });
      if (windows.some((w) => w.focused)) return;

      await self.registration.showNotification(data.title || "Milo", {
        body: data.body,
        tag: data.tag,
        icon: "/icon-192.png",
        badge: "/icon-192.png",
        data: { url: data.url || "/daily" },
      });
    })(),
  );
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  const url = event.notification.data?.url || "/daily";
  event.waitUntil(
    (async () => {
      const windows = await self.clients.matchAll({ type: "window", includeUncontrolled: true });
      const open = windows.find((w) => new URL(w.url).pathname.startsWith(url)) || windows[0];
      if (open) return open.focus();
      return self.clients.openWindow(url);
    })(),
  );
});
