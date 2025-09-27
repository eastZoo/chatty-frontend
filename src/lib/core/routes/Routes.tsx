import { lazy, Suspense } from "react";
import { useRoutes, Navigate } from "react-router-dom";
import AuthTokenLayout from "@/lib/core/AuthTokenLayout";
import MainLayout from "@/components/MainLayout";

// lazy 로딩 페이지들
const LoginPage = lazy(() => import("@/pages/LoginPage/LoginPage"));
const RegisterPage = lazy(() => import("@/pages/RegisterPage/RegisterPage"));
const FriendsPage = lazy(() => import("@/pages/FriendsPage/FriendsPage"));
const PrivateChatPage = lazy(
  () => import("@/pages/PrivateChatPage/PrivateChatPage")
);
const PrivateChatListPage = lazy(
  () => import("@/pages/PrivateChatListPage/PrivateChatListPage")
);
const SettingsPage = lazy(() => import("@/pages/SettingsPage/SettingsPage"));
const DisplaySettingsPage = lazy(
  () => import("@/pages/DisplaySettingsPage/DisplaySettingsPage")
);
const NotFoundPage = lazy(() => import("@/pages/404/NotFoundPage"));

export default function AppRoutes() {
  const routes = [
    // 인증 관련 라우트
    { path: "/login", element: <LoginPage /> },
    { path: "/register", element: <RegisterPage /> },

    // 보호된 라우트 (MainLayout으로 감싸진 중첩 라우트)
    {
      path: "/",
      element: (
        // <ProtectedRoute>
        <MainLayout />
        // </ProtectedRoute>
      ),
      children: [
        { index: true, element: <FriendsPage /> },
        { path: "chat", element: <PrivateChatListPage /> },
        { path: "chat/private/:friendId", element: <PrivateChatPage /> },
        { path: "settings", element: <SettingsPage /> },
        { path: "settings/display", element: <DisplaySettingsPage /> },
      ],
    },

    // 404 페이지
    { path: "/404", element: <NotFoundPage /> },
    { path: "*", element: <Navigate to="/404" replace /> },
  ];

  const element = useRoutes(routes);

  return (
    <AuthTokenLayout>
      <Suspense fallback={<div style={{ padding: 24 }}>로딩중…</div>}>
        {element}
      </Suspense>
    </AuthTokenLayout>
  );
}
