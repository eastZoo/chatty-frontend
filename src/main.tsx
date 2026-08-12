import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import AppProviders from "./AppProviders.tsx";
import "@/lib/settingFCM.ts";
import { registerChattyServiceWorker } from "@/lib/registerChattyServiceWorker";

registerChattyServiceWorker().catch((error) => {
  console.warn("Service worker update failed:", error);
});

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <AppProviders />
  </StrictMode>,
);
