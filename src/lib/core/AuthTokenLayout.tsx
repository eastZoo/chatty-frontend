import { useEffect } from "react";
import useAuthToken from "@/lib/hooks/useAuthToken";
import { useState } from "react";
import { useLocation, useNavigate } from "react-router";
import LoadingSpinner from "@/components/LoadingSpinner";
import socket, { updateSocketAuth } from "@/lib/api/socket";

interface AuthTokenLayoutProps {
  children: React.ReactNode;
}

export default function AuthTokenLayout({ children }: AuthTokenLayoutProps) {
  const navigate = useNavigate();
  const pathname = useLocation();
  const { fetchAdminInfo } = useAuthToken();

  const [authorized, setAuthorized] = useState(false);

  useEffect(() => {
    // 공개 경로
    const publicPaths = ["/login", "/register"];

    const authCheck = async () => {
      // 공개 경로인 경우 즉시 인증 처리
      if (publicPaths.includes(pathname.pathname)) {
        setAuthorized(true);
        return;
      }

      try {
        // 인증 체크와 어드민 정보 동시 요청
        await Promise.all([fetchAdminInfo()]);

        // 인증 성공 시 소켓 연결
        const token = localStorage.getItem("accessToken");
        if (token) {
          updateSocketAuth(token);
          console.log("소켓 연결 시도");
        }

        setAuthorized(true);
      } catch (error) {
        console.error("인증 체크 실패:", error);
        setAuthorized(false);
        navigate("/login");
      }
    };

    authCheck();
  }, [pathname, navigate, fetchAdminInfo]);

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
