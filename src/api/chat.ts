// src/api/chat.ts
import { request } from "./axiosInstance";

export interface Chat {
  id: string;
  title: string;
  type: string;
  createdAt: string;
  updatedAt: string;
  participants: any[]; // 배열 안에 두 명의 유저 정보가 있음
  messages: Message[];
  // 채팅방을 생성한 사용자의 정보 (optional)
  user?: {
    id: number;
    username: string;
  };
}
export interface Message {
  id: string;
  content: string;
  sender: {
    id: string;
    username: string;
  };
  createdAt: string;
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

export const getPrivateChatList = async (): Promise<Chat[]> => {
  return request<Chat[]>({ url: "/chats/private/list", method: "GET" });
};

// Private chat: 요청 시 friendId를 보내어 1:1 채팅을 조회하거나 생성
export const getPrivateChat = async (friendId: string): Promise<Chat> => {
  return request<Chat>({
    url: `/chats/private`,
    method: "POST",
    data: { friendId },
  });
};

export const getUnreadCount = async (friendId: string): Promise<number> => {
  const response = await request<{ unreadCount: number }>({
    url: `/chats/private/unread/${friendId}`,
    method: "GET",
  });
  return response.unreadCount;
};
