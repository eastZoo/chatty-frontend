import React from "react";
import ChatSidebar from "@/components/ChatSidebar";
import ChatWindow from "@/components/ChatWindow";
import { ChatPageContainer } from "./ChatPage.styles";

const ChatPage: React.FC = () => {
  return (
    <ChatPageContainer>
      <ChatSidebar />
      <ChatWindow />
    </ChatPageContainer>
  );
};

export default ChatPage;
