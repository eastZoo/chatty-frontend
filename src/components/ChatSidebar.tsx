// src/components/ChatSidebar.tsx
import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getChats, createChat, updateChatTitle, Chat } from "../api/chat";
import { useRecoilState } from "recoil";
import { selectedChatState } from "../state/atoms";

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
    <div
      style={{ width: "250px", borderRight: "1px solid #ccc", padding: "10px" }}
    >
      <button onClick={handleNewChat}>새 채팅</button>
      <ul style={{ listStyle: "none", padding: 0 }}>
        {chats &&
          chats.map((chat) => (
            <li key={chat.id} style={{ margin: "10px 0", cursor: "pointer" }}>
              {editingChatId === chat.id ? (
                <div>
                  <input
                    type="text"
                    value={newTitle}
                    onChange={(e) => setNewTitle(e.target.value)}
                  />
                  <button onClick={() => handleTitleSubmit(chat)}>저장</button>
                </div>
              ) : (
                <div
                  onClick={() => {
                    if (selectedChat?.id !== chat.id) {
                      setSelectedChat(chat);
                    }
                  }}
                >
                  <span>{chat.title}</span>
                  <button onClick={() => handleTitleChange(chat)}>수정</button>
                </div>
              )}
            </li>
          ))}
      </ul>
    </div>
  );
};

export default ChatSidebar;
