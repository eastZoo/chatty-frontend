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
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        await axios.post(
          `${import.meta.env.VITE_API_BASE_URL}/auth/refresh-token`,
          {},
          {
            withCredentials: true,
          }
        );

        // 토큰이 재발급되었으므로, 원래의 요청을 다시 보냅니다.
        return api(originalRequest);
      } catch (e) {
        // 리프레시 토큰이 만료되었거나 유효하지 않은 경우 로그아웃 처리
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
