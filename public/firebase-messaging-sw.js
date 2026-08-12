self.addEventListener("push", (event) => {
  if (!event.data) return;

  let payload = {};
  try {
    payload = event.data.json();
  } catch {
    payload = { notification: { body: event.data.text() } };
  }

  const notification = payload.notification || {};
  const data = payload.data || {};
  const title = notification.title || data.title || "Chatty";
  const options = {
    body: notification.body || data.body || "새 메시지가 도착했습니다.",
    icon: "/chatty-favicon.svg",
    badge: "/chatty-favicon.svg",
    tag: data.messageId ? `chatty-message-${data.messageId}` : undefined,
    data: { url: data.url || "/chat", chatId: data.chatId },
  };

  // The in-page handler only manages sound/title state. The service worker is
  // the sole owner of the system notification, so show it even when an app tab
  // is visible. A message-specific tag prevents duplicate windows for the same
  // persisted message without suppressing subsequent messages.
  event.waitUntil(self.registration.showNotification(title, options));
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  const targetUrl = event.notification.data?.url || "/chat";
  event.waitUntil(
    self.clients.matchAll({ type: "window", includeUncontrolled: true }).then((clients) => {
      const appClient = clients.find((client) => {
        try {
          return new URL(client.url).origin === self.location.origin;
        } catch {
          return false;
        }
      });
      if (appClient) {
        appClient.navigate(targetUrl);
        return appClient.focus();
      }
      return self.clients.openWindow(targetUrl);
    }),
  );
});
