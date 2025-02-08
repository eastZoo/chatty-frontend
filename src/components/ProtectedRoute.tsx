// src/components/ProtectedRoute.tsx
import { adminInfoSelector } from "@/state/adminInfo";

import React from "react";
import { Navigate } from "react-router-dom";
import { useRecoilValue } from "recoil";

interface ProtectedRouteProps {
  children: JSX.Element;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  // 로그인 여부 확인
  const adminInfo = useRecoilValue(adminInfoSelector);
  if (!adminInfo) {
    return <Navigate to="/login" replace />;
  }
  return children;
};

export default ProtectedRoute;
