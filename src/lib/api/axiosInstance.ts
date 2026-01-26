import axios, { AxiosError, type AxiosRequestConfig } from "axios";
import { updateSocketToken } from "./socket";

// console.log("import.meta.env.VITE_API_BASE_URL", import.meta.env.VITE_API_BASE_URL);

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  headers: {
    "Content-Type": "application/json; charset=utf-8",
  },
  withCredentials: true,
  // 응답 인코딩 설정
  responseEncoding: "utf8",
});

api.interceptors.request.use(
  async (config) => {
    const ip = localStorage.getItem("userIP");
    if (ip) config.headers.ip = ip;

    // Access Token이 있으면 Authorization 헤더에 추가
    const accessToken = localStorage.getItem("chatty_accessToken");
    if (accessToken) {
      config.headers.Authorization = `Bearer ${accessToken}`;
      // console.log(
      //   "📤 요청에 Access Token 추가됨 - 토큰 길이:",
      //   accessToken.length
      // );
    } else {
      // console.log("❌ Access Token이 없습니다");
    }

    // FormData 전송 시 Content-Type 헤더 제거 (axios가 자동으로 설정)
    if (config.data instanceof FormData) {
      delete config.headers["Content-Type"];
      // console.log("FormData 전송 - Content-Type 헤더 제거됨");
    }

    return config;
  },
  (error) => Promise.reject(error)
);

api.interceptors.response.use(
  (response) => {
    // 모든 응답 헤더 로그 출력
    // console.log("📥 응답 헤더:", response.headers);

    // x-access-token 헤더가 있으면 localStorage에 저장하고 소켓 토큰도 업데이트
    const newAccessToken = response.headers["x-access-token"];
    if (newAccessToken) {
      // const currentToken = localStorage.getItem("chatty_accessToken");
      // console.log("🔑 현재 토큰:", currentToken);
      // console.log("🆕 새로운 토큰:", newAccessToken);
      // console.log("토큰 변경 여부:", currentToken !== newAccessToken);

      localStorage.setItem("chatty_accessToken", newAccessToken);
      updateSocketToken(newAccessToken);
      // console.log("✅ 새로운 Access Token 저장됨 (헤더) 및 소켓 토큰 업데이트");
    } else {
      // console.log("❌ x-access-token 헤더가 없습니다");
    }

    return response;
  },
  async (error) => {
    const originalRequest = error.config;

    // 401 에러이고 아직 재시도하지 않은 경우
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      // console.log("401 에러 발생, 토큰 재발급 시도");

      try {
        // Refresh Token으로 새로운 Access Token 발급 요청
        const response = await axios.post(
          `${import.meta.env.VITE_API_BASE_URL}/auth/refresh-token`,
          {},
          { withCredentials: true }
        );

        const newAccessToken = response.headers["x-access-token"];
        if (newAccessToken) {
          localStorage.setItem("chatty_accessToken", newAccessToken);
          updateSocketToken(newAccessToken);
          // console.log("토큰 재발급 성공 및 소켓 토큰 업데이트");

          // 원래 요청의 Authorization 헤더 업데이트
          originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;

          // 원래 요청 재시도
          return api(originalRequest);
        }
      } catch (refreshError) {
        // console.log("토큰 재발급 실패, 로그인 페이지로 이동");
        localStorage.removeItem("chatty_accessToken");
        window.location.href = "/login";
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

const request = async <T>(config: AxiosRequestConfig): Promise<T> => {
  try {
    const { data }: any = await api.request<T>({ ...config });
    // console.log(data);
    return data;
  } catch (error) {
    const { response }: any = error as unknown as AxiosError;
    // console.log("[response]", error);

    if (response) {
      throw response.data;
    }

    throw error;
  }
};

const setUserId = (userId: any) => {
  api.defaults.headers.common["userId"] = userId;
};

const setToken = (token: any) => {
  api.defaults.headers.common["Authorization"] = `Bearer ${token}`;
};

const setIp = (ip: string) => {
  api.defaults.headers.common["ip"] = ip;
};

export { request, setUserId, setToken, setIp };
