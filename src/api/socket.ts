// src/api/socket.ts
import { io } from "socket.io-client";

// autoConnect 옵션을 true로 하여 애플리케이션 시작 시 연결하도록 합니다.
const socket = io(process.env.REACT_APP_API_URL || "http://localhost:3001", {
  path: "/socket.io",
  transports: ["websocket"],
  autoConnect: true,
});

socket.on("connect", () => {
  console.log("Socket connected:", socket.id);
});

export default socket;
