import { useSetRecoilState } from "recoil";
import { useCallback } from "react";
import { request } from "@/lib/api/axiosInstance";
import { useNavigate } from "react-router";
import { adminInfoSelector } from "@/store/adminInfo";
import { useQueryClient } from "@tanstack/react-query";
import socket from "@/lib/api/socket";
import { removeAccessToken, clearAllAuthData } from "@/lib/utils/authFunctions";

export default function useAuthToken() {
  const setAdminInfo = useSetRecoilState(adminInfoSelector);
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const customLogin = async (adminInfo: any) => {
    try {
      // 로그인 시 이전 데이터 완전 초기화
      queryClient.clear();
      console.log("로그인 시 캐시 초기화");

      setAdminInfo(adminInfo);
      navigate("/");
    } catch (e: any) {
      console.error("로그인 실패:", e.message);
    }
  };

  const customLogout = async () => {
    try {
      await request({ method: "POST", url: "/auth/logout" });
    } catch (error) {
      console.error("로그아웃 API 호출 실패:", error);
    }

    // 1. 소켓 연결 완전 해제
    if (socket.connected) {
      socket.disconnect();
      console.log("소켓 연결 해제");
    }

    // 2. React Query 캐시 완전 초기화
    queryClient.clear();
    console.log("React Query 캐시 초기화");

    // 3. Recoil 상태 초기화
    setAdminInfo(null);

    // 4. localStorage 모든 인증 데이터 제거
    clearAllAuthData();

    // 5. 로그인 페이지로 이동
    navigate("/login");
  };

  // fetchAdminInfo 함수를 useCallback으로 감싸서 메모이제이션합니다.
  const fetchAdminInfo = useCallback(async () => {
    try {
      const response: any = await request({
        method: "GET",
        url: "/auth/info",
      });
      setAdminInfo(response.data);
      return true;
    } catch (error) {
      setAdminInfo(null);
      throw error;
    }
  }, [setAdminInfo]);

  // 이미 AuthTokenLayout에서 fetchAdminInfo를 호출하므로,
  // 여기서는 중복 호출을 피하기 위해 아래 useEffect는 제거하거나 주석 처리합니다.
  /*
  useEffect(() => {
    const publicPaths = ["/login", "/join"];
    if (!publicPaths.includes(location.pathname)) {
      fetchAdminInfo();
    }
  }, [location, fetchAdminInfo]);
  */

  return { customLogin, customLogout, fetchAdminInfo };
}
