import { request } from "./axiosInstance";

export interface FileData {
  id: string;
  originalName: string;
  filename: string;
  mimetype: string;
  size: string;
  url: string;
}

export interface Message {
  id?: string;
  content?: string;
  fileIds?: string[] | null;
  createdAt?: string;
  privateChat?: {
    id: string;
  };
  chat?: {
    id?: string;
  };
  // sender 객체를 추가하여 작성자 정보(예?: id, username)를 포함
  sender?: {
    id?: string;
    username?: string;
    password?: string;
  };
  replyTarget?: Message;
  files?: FileData[];
}

export const getMessages = async (chatId: string): Promise<Message[]> => {
  return request<Message[]>({
    url: `/chats/${chatId}/messages`,
    method: "GET",
  });
};

export const sendMessage = async (
  chatId: string,
  content: string,
): Promise<Message> => {
  return request<Message>({
    url: `/chats/${chatId}/messages`,
    method: "POST",
    data: { content },
  });
};
