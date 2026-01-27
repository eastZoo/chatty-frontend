import { initializeApp } from "firebase/app";
import { getMessaging } from "firebase/messaging";

const firebaseConfig = {
  apiKey: import.meta.env.VITE_API_API_KEY,
  authDomain: import.meta.env.VITE_API_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_API_PROJECT_ID,
  messagingSenderId: import.meta.env.VITE_API_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_API_APP_ID,
};

if (!firebaseConfig.apiKey) {
  throw new Error("Firebase env not loaded");
}

const app = initializeApp(firebaseConfig);
export const messaging = getMessaging(app);
