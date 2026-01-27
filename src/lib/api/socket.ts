// src/api/socket.ts
import { io, type ManagerOptions, type SocketOptions } from "socket.io-client";

const initialToken = localStorage.getItem("chatty_accessToken") ?? "";

const socketOptions = {
  path: "/socket.io",
  transports: ["websocket"],
  autoConnect: false, // 수동으로 연결하도록 변경
  reconnection: true,
  reconnectionDelay: 1000,
  reconnectionDelayMax: 5000,
  reconnectionAttempts: Infinity, // 무한 재시도
  timeout: 20000,
  query: initialToken ? { token: initialToken } : undefined,
  auth: initialToken ? { token: initialToken } : undefined,
  // 연결이 끊어졌을 때 자동으로 재연결 시도
  forceNew: false,
};

// autoConnect 옵션을 true로 하여 애플리케이션 시작 시 연결하도록 합니다.
const socket = io(
  import.meta.env.VITE_API_BASE_URL || "http://localhost:3001",
  socketOptions as Partial<ManagerOptions & SocketOptions>
);

socket.on("connect", () => {
  console.log("Socket connected:", socket.id);
});

socket.on("disconnect", (reason) => {
  console.log("Socket disconnected:", reason);
});

socket.on("error", (error) => {
  console.error("Socket error:", error);
});

socket.on("reconnect", (attemptNumber) => {
  console.log("Socket reconnected after", attemptNumber, "attempts");
});

socket.on("reconnect_error", (error) => {
  console.error("Socket reconnection error:", error);
});

socket.on("reconnect_failed", () => {
  console.error("Socket reconnection failed. Attempting manual reconnect...");
  // 수동 재연결 시도
  setTimeout(() => {
    if (!socket.connected) {
      console.log("Manual reconnect attempt...");
      socket.connect();
    }
  }, 2000);
});

// Page Visibility API를 사용하여 탭이 다시 활성화될 때 소켓 재연결
if (typeof document !== "undefined") {
  document.addEventListener("visibilitychange", () => {
    if (!document.hidden && !socket.connected) {
      console.log("Tab became visible. Reconnecting socket...");
      const token = localStorage.getItem("chatty_accessToken");
      if (token) {
        socket.connect();
      }
    }
  });

  // Window focus 이벤트로도 재연결 시도
  window.addEventListener("focus", () => {
    if (!socket.connected) {
      console.log("Window focused. Reconnecting socket...");
      const token = localStorage.getItem("chatty_accessToken");
      if (token) {
        socket.connect();
      }
    }
  });
}

// 토큰 업데이트 함수
export const updateSocketToken = (newToken?: string) => {
  const token = newToken ?? localStorage.getItem("chatty_accessToken") ?? "";
  const wasActive = socket.active;
  const wasConnected = socket.connected;

  const managerOpts = socket.io.opts as ManagerOptions & {
    auth?: Record<string, unknown>;
    query?: Record<string, unknown>;
  };

  if (token.length === 0) {
    socket.auth = {};
    managerOpts.auth = {};
    managerOpts.query = {};
    if (socket.connected) {
      socket.disconnect();
    }
    return;
  }

  const ensureRecord = (value: unknown): Record<string, unknown> => {
    if (value && typeof value === "object" && !Array.isArray(value)) {
      return value as Record<string, unknown>;
    }
    return {};
  };

  socket.auth = {
    ...ensureRecord(socket.auth),
    token,
  };

  const authOpts = ensureRecord(managerOpts.auth);
  authOpts.token = token;
  managerOpts.auth = authOpts;

  const queryOpts = ensureRecord(managerOpts.query);
  queryOpts.token = token;
  managerOpts.query = queryOpts;

  if (wasConnected) {
    socket.disconnect();
    socket.connect();
  } else if (wasActive) {
    socket.disconnect();
  }
};

export default socket;
