// src/api/chat.ts
import { request } from "./axiosInstance";

export interface Chat {
  id: string;
  title: string;
  createdAt: string;
  updatedAt: string;
  // 채팅방을 생성한 사용자의 정보 (optional)
  user?: {
    id: number;
    username: string;
  };
}

export const getChats = async (): Promise<Chat[]> => {
  return request<Chat[]>({ url: "/chats", method: "GET" });
};

export const createChat = async (title?: string): Promise<Chat> => {
  return request<Chat>({ url: "/chats", method: "POST", data: { title } });
};

export const updateChatTitle = async (
  chatId: string,
  title: string
): Promise<Chat> => {
  return request<Chat>({
    url: `/chats/${chatId}`,
    method: "PATCH",
    data: { title },
  });
};
