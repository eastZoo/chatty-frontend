import { request } from "./axiosInstance";

export interface Message {
  id: string;
  content: string;
  createdAt: string;
  chat: {
    id: string;
  };
  // sender 객체를 추가하여 작성자 정보(예: id, username)를 포함
  sender: {
    id: number;
    username: string;
  };
}

export const getMessages = async (chatId: string): Promise<Message[]> => {
  return request<Message[]>({
    url: `/chats/${chatId}/messages`,
    method: "GET",
  });
};

export const sendMessage = async (
  chatId: string,
  content: string
): Promise<Message> => {
  return request<Message>({
    url: `/chats/${chatId}/messages`,
    method: "POST",
    data: { content },
  });
};
