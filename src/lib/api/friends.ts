// src/api/friends.ts
import { request } from "./axiosInstance";

// 이제 receiverId, requestId는 string 타입으로 처리합니다.
export const getFriends = async () => {
  return request<any[]>({ url: "/friends", method: "GET" });
};

export const getFriendRequests = async () => {
  return request<any[]>({ url: "/friends/requests", method: "GET" });
};

export const sendFriendRequest = async (receiverId: string) => {
  return request({
    url: "/friends/request",
    method: "POST",
    data: { receiverId },
  });
};

export const acceptFriendRequest = async (requestId: string) => {
  return request({ url: `/friends/accept/${requestId}`, method: "POST" });
};

export const rejectFriendRequest = async (requestId: string) => {
  return request({ url: `/friends/reject/${requestId}`, method: "POST" });
};
