// src/api/auth.ts
import { type ResponseType } from "@/lib/types/response.types";
import { request } from "./axiosInstance";

export interface LoginResponse {
  success: boolean;
  data: {
    accessToken: string;
    refreshToken?: string;
    id: string;
    username: string;
    type?: string;
  };
  message?: string;
}

export interface LoginRequest {
  username: string;
  password: string;
  fcmToken: string;
}

export interface RegisterRequest {
  username: string;
  password: string;
}

export interface RegisterResponse {
  access_token: string;
}

export const login = async (data: LoginRequest): Promise<LoginResponse> => {
  return request<LoginResponse>({ url: "/auth/sign-in", method: "POST", data });
};

export const register = async (
  data: RegisterRequest,
): Promise<ResponseType<unknown>> => {
  return request<ResponseType<unknown>>({
    url: "/auth/register",
    method: "POST",
    data,
  });
};

export const logout = async (): Promise<ResponseType<unknown>> => {
  return request<ResponseType<unknown>>({
    url: "/auth/logout",
    method: "POST",
  });
};
