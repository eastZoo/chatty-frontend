// src/api/socket.ts
import { io } from "socket.io-client";

// autoConnect 옵션을 true로 하여 애플리케이션 시작 시 연결하도록 합니다.
const socket = io(
  import.meta.env.VITE_API_BASE_URL || "http://localhost:3001",
  {
    path: "/socket.io",
    transports: ["websocket"],
    autoConnect: false, // 수동으로 연결하도록 변경
    reconnection: true,
    reconnectionDelay: 1000,
    reconnectionAttempts: 5,
    timeout: 20000,
    auth: {
      token: localStorage.getItem("accessToken"),
    },
  }
);

// 토큰 업데이트 함수
export const updateSocketAuth = (token: string | null) => {
  socket.auth = { token };
  if (token && !socket.connected) {
    socket.connect();
  } else if (!token && socket.connected) {
    socket.disconnect();
  }
};

socket.on("connect", () => {
  console.log("Socket connected:", socket.id);
});

socket.on("disconnect", (reason) => {
  console.log("Socket disconnected:", reason);
});

socket.on("reconnect", (attemptNumber) => {
  console.log("Socket reconnected after", attemptNumber, "attempts");
});

socket.on("reconnect_error", (error) => {
  console.error("Socket reconnection error:", error);
});

socket.on("reconnect_failed", () => {
  console.error("Socket reconnection failed");
});

export default socket;
