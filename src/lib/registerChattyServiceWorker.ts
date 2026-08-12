const SERVICE_WORKER_URL = "/firebase-messaging-sw.js?v=3";

export async function registerChattyServiceWorker(): Promise<ServiceWorkerRegistration | null> {
  if (!("serviceWorker" in navigator) || !window.isSecureContext) return null;

  const registration = await navigator.serviceWorker.register(
    SERVICE_WORKER_URL,
    {
      scope: "/",
      updateViaCache: "none",
    },
  );

  // Check immediately instead of waiting for the browser's periodic update.
  await registration.update();
  return registration;
}
