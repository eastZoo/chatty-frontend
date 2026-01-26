import type { ResponseType } from "@/lib/types/response.types";
import { request } from "./axiosInstance";

export const CHAT_AUTO_DELETE_OPTIONS = [
  { value: 0, label: "비활성화" },
  { value: 1, label: "1분" },
  { value: 10, label: "10분" },
  { value: 60, label: "1시간" },
  { value: 180, label: "3시간" },
  { value: 360, label: "6시간" },
  { value: 720, label: "12시간" },
  { value: 1440, label: "24시간" },
] as const;

export interface ChatAutoDeleteResponse {
  minutes: number;
}

export const getChatAutoDelete = async (): Promise<
  ResponseType<ChatAutoDeleteResponse>
> => {
  return request<ResponseType<ChatAutoDeleteResponse>>({
    method: "GET",
    url: "/settings/chat-auto-delete",
  });
};

export const setChatAutoDelete = async (
  minutes: number
): Promise<ResponseType<ChatAutoDeleteResponse>> => {
  return request<ResponseType<ChatAutoDeleteResponse>>({
    method: "PUT",
    url: "/settings/chat-auto-delete",
    data: { minutes },
  });
};
