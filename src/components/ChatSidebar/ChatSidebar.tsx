import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getChats, createChat, updateChatTitle, Chat } from "@/api/chat";
import { useRecoilState } from "recoil";
import { selectedChatState } from "@/state/atoms";
import {
  SidebarContainer,
  NewChatButton,
  ChatList,
  ChatItem,
  ChatTitle,
  EditButton,
  TitleInput,
} from "./ChatSidebar.styles";

const ChatSidebar: React.FC = () => {
  const queryClient = useQueryClient();
  const { data: chats, isLoading } = useQuery({
    queryKey: ["chats"],
    queryFn: getChats,
  });
  const [selectedChat, setSelectedChat] = useRecoilState(selectedChatState);
  const [editingChatId, setEditingChatId] = useState<string | null>(null);
  const [newTitle, setNewTitle] = useState("");

  const { mutateAsync: createChatMutation } = useMutation({
    mutationFn: createChat,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["chats"] });
    },
  });

  const updateChatMutation = useMutation({
    mutationFn: ({ chatId, title }: { chatId: string; title: string }) =>
      updateChatTitle(chatId, title),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["chats"] });
    },
  });

  const handleNewChat = async () => {
    const chat = await createChatMutation(newTitle);
    setSelectedChat(chat);
  };

  const handleTitleChange = (chat: Chat) => {
    setEditingChatId(chat.id);
    setNewTitle(chat.title);
  };

  const handleTitleSubmit = (chat: Chat) => {
    updateChatMutation.mutate({ chatId: chat.id, title: newTitle });
    setEditingChatId(null);
  };

  if (isLoading) return <div>Loading chats...</div>;

  return (
    <SidebarContainer>
      <NewChatButton onClick={handleNewChat}>새 채팅</NewChatButton>
      <ChatList>
        {chats &&
          chats.map((chat) => (
            <ChatItem
              key={chat.id}
              active={selectedChat?.id === chat.id}
              onClick={() => {
                if (selectedChat?.id !== chat.id) {
                  setSelectedChat(chat);
                }
              }}
            >
              {editingChatId === chat.id ? (
                <>
                  <TitleInput
                    type="text"
                    value={newTitle}
                    onChange={(e) => setNewTitle(e.target.value)}
                  />
                  <EditButton onClick={() => handleTitleSubmit(chat)}>
                    저장
                  </EditButton>
                </>
              ) : (
                <>
                  <ChatTitle>{chat.title}</ChatTitle>
                  <EditButton onClick={() => handleTitleChange(chat)}>
                    수정
                  </EditButton>
                </>
              )}
            </ChatItem>
          ))}
      </ChatList>
    </SidebarContainer>
  );
};

export default ChatSidebar;
