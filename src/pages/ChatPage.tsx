// src/pages/ChatPage.tsx
import React from "react";
import ChatSidebar from "../components/ChatSidebar";
import ChatWindow from "../components/ChatWindow";

const ChatPage: React.FC = () => {
  return (
    <div style={{ display: "flex", height: "100vh" }}>
      <ChatSidebar />
      <ChatWindow />
    </div>
  );
};

export default ChatPage;
