// src/api/socket.ts
import { io, type ManagerOptions, type SocketOptions } from "socket.io-client";

const initialToken = localStorage.getItem("chatty_accessToken") ?? "";

const socketOptions = {
  path: "/socket.io",
  transports: ["websocket"],
  autoConnect: false, // 수동으로 연결하도록 변경
  reconnection: true,
  reconnectionDelay: 1000,
  reconnectionAttempts: 5,
  timeout: 20000,
  query: initialToken ? { token: initialToken } : undefined,
  auth: initialToken ? { token: initialToken } : undefined,
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
