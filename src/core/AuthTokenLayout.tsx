import { useEffect } from "react";
import useAuthToken from "@/lib/hooks/useAuthToken";
import { useState } from "react";
import { useLocation, useNavigate } from "react-router";
import { useRecoilState } from "recoil";
import { adminInfoSelector } from "@/state/adminInfo";
import { request } from "@/api/axiosInstance";
import LoadingSpinner from "@/components/LoadingSpinner";

interface AuthTokenLayoutProps {
  children: React.ReactNode;
}

export default function AuthTokenLayout({ children }: AuthTokenLayoutProps) {
  const navigate = useNavigate();
  const pathname = useLocation();
  const { fetchAdminInfo } = useAuthToken();

  const [authorized, setAuthorized] = useState(false);
  const [adminInfo] = useRecoilState(adminInfoSelector);

  useEffect(() => {
    const publicPaths = ["/login", "/join"];

    const authCheck = async () => {
      // 공개 경로인 경우 즉시 인증 처리
      if (publicPaths.includes(pathname.pathname)) {
        setAuthorized(true);
        return;
      }

      try {
        // 인증 체크와 어드민 정보 동시 요청
        await Promise.all([fetchAdminInfo()]);

        setAuthorized(true);
      } catch (error) {
        console.error("인증 체크 실패:", error);
        setAuthorized(false);
        navigate("/login");
      }
    };

    authCheck();
  }, [pathname, navigate, fetchAdminInfo]);

  if (!authorized) {
    return <LoadingSpinner />;
  }

  return <>{children}</>;
}
