import axios, { AxiosError, type AxiosRequestConfig } from "axios";

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
    }

    // FormData 전송 시 Content-Type 헤더 제거 (axios가 자동으로 설정)
    if (config.data instanceof FormData) {
      delete config.headers["Content-Type"];
      console.log("FormData 전송 - Content-Type 헤더 제거됨");
    }

    return config;
  },
  (error) => Promise.reject(error)
);
api.interceptors.response.use(
  (response) => {
    // x-access-token 헤더가 있으면 localStorage에 저장
    const newAccessToken = response.headers["x-access-token"];
    if (newAccessToken) {
      localStorage.setItem("access_token", newAccessToken);
      console.log("새로운 Access Token 저장됨");
    }
    return response;
  },
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const response = await axios.post(
          `${import.meta.env.VITE_API_BASE_URL}/auth/refresh-token`,
          {},
          {
            withCredentials: true,
          }
        );

        // x-access-token 헤더에서 새로운 토큰 추출
        const newAccessToken = response.headers["x-access-token"];
        if (newAccessToken) {
          localStorage.setItem("access_token", newAccessToken);
          console.log("토큰 재발급 성공, 새로운 Access Token 저장됨");
        }

        // 원래의 요청을 다시 보냅니다.
        return api(originalRequest);
      } catch (e) {
        // 리프레시 토큰이 만료되었거나 유효하지 않은 경우 로그아웃 처리
        localStorage.removeItem("access_token");
        console.log("토큰 재발급 실패, 로그아웃 처리");
        // RecoilLogout();
        return Promise.reject(e);
      }
    }

    return Promise.reject(error);
  }
);

const request = async <T>(config: AxiosRequestConfig): Promise<T> => {
  try {
    const { data }: any = await api.request<T>({ ...config });
    console.log(data);
    return data;
  } catch (error) {
    const { response }: any = error as unknown as AxiosError;
    console.log("[response]", error);

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
