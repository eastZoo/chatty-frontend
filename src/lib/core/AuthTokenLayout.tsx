import { useEffect } from "react";
import useAuthToken from "@/lib/hooks/useAuthToken";
import { useState } from "react";
import { useLocation, useNavigate } from "react-router";
import LoadingSpinner from "@/components/LoadingSpinner";
import socket from "@/lib/api/socket";

interface AuthTokenLayoutProps {
  children: React.ReactNode;
}

export default function AuthTokenLayout({ children }: AuthTokenLayoutProps) {
  const navigate = useNavigate();
  const pathname = useLocation();
  const { fetchAdminInfo } = useAuthToken();

  const [authorized, setAuthorized] = useState(false);

  useEffect(() => {
    const publicPaths = ["/login", "/register"];

    const authCheck = async () => {
      // 공개 경로인 경우 즉시 인증 처리
      if (publicPaths.includes(pathname.pathname)) {
        setAuthorized(true);
        return;
      }

      // 토큰이 없으면 바로 로그인 페이지로
      const token = localStorage.getItem("chatty_accessToken");
      if (!token) {
        console.log("토큰이 없어서 로그인 페이지로 이동");
        navigate("/login");
        return;
      }

      try {
        // 토큰이 있으면 유효성 검사 (첫 번째 요청에서만)
        await fetchAdminInfo();
        setAuthorized(true);
      } catch (error) {
        console.error("인증 체크 실패:", error);
        // 토큰이 유효하지 않으면 제거하고 로그인 페이지로
        localStorage.removeItem("chatty_accessToken");
        navigate("/login");
      }
    };

    authCheck();
  }, [pathname.pathname, navigate, fetchAdminInfo]);

  // 컴포넌트 언마운트 시 소켓 연결 해제
  useEffect(() => {
    return () => {
      if (socket.connected) {
        socket.disconnect();
        console.log("소켓 연결 해제");
      }
    };
  }, []);

  if (!authorized) {
    return <LoadingSpinner />;
  }

  return <>{children}</>;
}
