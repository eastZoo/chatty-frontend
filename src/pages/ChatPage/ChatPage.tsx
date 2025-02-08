import React, { useState } from "react";
import ChatSidebar from "@/components/ChatSidebar/ChatSidebar";
import ChatWindow from "@/components/ChatWindow/ChatWindow";
import MobileHeader from "@/components/MobileHeader/MobileHeader";
import MobileChatSidebar from "@/components/MobileChatSidebar/MobileChatSidebar";
import { ChatPageContainer, Overlay } from "./ChatPage.styles";
import { useMediaQuery } from "react-responsive";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useRecoilState } from "recoil";
import { selectedChatState } from "@/state/atoms";
import { createChat, getChats } from "../../api/chat";

const ChatPage: React.FC = () => {
  const isMobile = useMediaQuery({ maxWidth: 768 });
  const [selectedChat, setSelectedChat] = useRecoilState(selectedChatState);
  const [newTitle, setNewTitle] = useState("");

  const queryClient = useQueryClient();
  const [isSidebarOpen, setSidebarOpen] = useState(false);
  const { data: chats } = useQuery({ queryKey: ["chats"], queryFn: getChats });

  const { mutateAsync: createChatMutation } = useMutation({
    mutationFn: createChat,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["chats"] });
    },
  });

  const handleHamburgerClick = () => {
    setSidebarOpen(true);
  };

  const handleNewChat = async () => {
    const chat = await createChatMutation(newTitle);
    setSelectedChat(chat);
    setSidebarOpen(false);
  };

  // 오버레이 클릭 시 사이드바 닫기
  const handleOverlayClick = () => {
    setSidebarOpen(false);
  };

  return (
    <ChatPageContainer>
      {isMobile ? (
        <>
          <MobileHeader
            onHamburgerClick={handleHamburgerClick}
            isSidebarOpen={isSidebarOpen}
          />
          <MobileChatSidebar
            isOpen={isSidebarOpen}
            chats={chats || []}
            onNewChat={handleNewChat}
          />
          {isSidebarOpen && <Overlay onClick={handleOverlayClick} />}
          <ChatWindow />
        </>
      ) : (
        <>
          <ChatSidebar />
          <ChatWindow />
        </>
      )}
    </ChatPageContainer>
  );
};

export default ChatPage;
