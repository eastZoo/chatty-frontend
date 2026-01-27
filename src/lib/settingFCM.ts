import { initializeApp } from "firebase/app";
import { getMessaging, type Messaging } from "firebase/messaging";

const firebaseConfig = {
  apiKey: import.meta.env.VITE_API_API_KEY,
  authDomain: import.meta.env.VITE_API_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_API_PROJECT_ID,
  messagingSenderId: import.meta.env.VITE_API_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_API_APP_ID,
};

// 환경변수가 없어도 앱이 동작하도록 에러를 throw하지 않음
let messaging: Messaging | null = null;

if (firebaseConfig.apiKey) {
  try {
    const app = initializeApp(firebaseConfig);
    messaging = getMessaging(app);
  } catch (error) {
    console.warn("Firebase 초기화 실패:", error);
  }
} else {
  console.warn("Firebase 환경변수가 설정되지 않았습니다. FCM 기능이 비활성화됩니다.");
}

export { messaging };
