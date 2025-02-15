import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { RecoilRoot } from "recoil";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import LoginPage from "@/pages/LoginPage/LoginPage";
import RegisterPage from "@/pages/RegisterPage/RegisterPage";
import ProtectedRoute from "@/components/ProtectedRoute";
import AuthTokenLayout from "@/core/AuthTokenLayout";

import FriendsPage from "@/pages/FriendsPage/FriendsPage";
import PrivateChatPage from "@/pages/PrivateChatPage/PrivateChatPage";
import SettingsPage from "@/pages/SettingsPage/SettingsPage";
import MainLayout from "./layout/MainLayout";
import PrivateChatListPage from "./pages/PrivateChatListPage/PrivateChatListPage";

const queryClient = new QueryClient();

const App: React.FC = () => {
  return (
    <RecoilRoot>
      <QueryClientProvider client={queryClient}>
        <Router>
          <AuthTokenLayout>
            <Routes>
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />
              <Route
                element={
                  <ProtectedRoute>
                    <MainLayout />
                  </ProtectedRoute>
                }
              >
                <Route path="/" element={<FriendsPage />} />
                <Route path="/chat" element={<PrivateChatListPage />} />
                <Route
                  path="/chat/private/:friendId"
                  element={<PrivateChatPage />}
                />
                <Route path="/settings" element={<SettingsPage />} />
              </Route>
            </Routes>
          </AuthTokenLayout>
        </Router>
        <ToastContainer
          className="custom-toast-container"
          toastClassName="custom-toast"
          position="top-center" // 필요에 따라 위치 변경
          autoClose={1000}
          hideProgressBar
          newestOnTop
          closeOnClick
          rtl={false}
          pauseOnFocusLoss
          draggable
          pauseOnHover
        />
      </QueryClientProvider>
    </RecoilRoot>
  );
};

export default App;
