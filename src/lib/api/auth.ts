// src/api/auth.ts
import { type ResponseType } from "@/lib/types/response.types";
import { request } from "./axiosInstance";

export interface LoginResponse {
  access_token: string;
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
): Promise<ResponseType<any>> => {
  return request<ResponseType<any>>({
    url: "/auth/register",
    method: "POST",
    data,
  });
};

export const logout = async (): Promise<ResponseType<any>> => {
  return request<ResponseType<any>>({
    url: "/auth/logout",
    method: "POST",
  });
};
