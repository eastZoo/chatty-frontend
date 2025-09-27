import axios from "axios";

// .env 파일에서 가져옵니다. (Vite: VITE_ 접두사)
const baseURL = import.meta.env.VITE_API_BASE_URL || "/api";

export const api = axios.create({ baseURL, withCredentials: true });

// 요청 인터셉터 (예: 토큰)
api.interceptors.request.use((config) => {
  // const token = localStorage.getItem('access_token');
  // if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// 응답 인터셉터 (예: 401 처리)
api.interceptors.response.use(
  (res) => res,
  async (error) => {
    // if (error?.response?.status === 401) { ... }
    return Promise.reject(error);
  }
);
