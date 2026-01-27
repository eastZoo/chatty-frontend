import React, { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { login, type LoginRequest } from "@/lib/api/auth";
import { Link } from "react-router-dom";
import { toast } from "react-toastify";
import useAuthToken from "@/lib/hooks/useAuthToken";
import { updateSocketToken } from "@/lib/api/socket";
import { getToken } from "firebase/messaging";
import { messaging } from "@/lib/settingFCM";
import {
  LoginContainer,
  LoginForm,
  Title,
  InputField,
  SubmitButton,
  LinkText,
} from "./LoginPage.styles";

const LoginPage: React.FC = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const { customLogin } = useAuthToken();

  const handlePermission = async () => {
    try {
      await Notification.requestPermission();
      registerServiceWorker();
    } catch (error) {
      console.log("!! PERMISSION ERROR: ", error);
    }
  };

  // 서비스 워커 실행 함수
  const registerServiceWorker = () => {
    navigator.serviceWorker
      .register("firebase-messaging-sw.js")
      .then(function (registration) {
        console.log("Service Worker 등록 성공:", registration);
      })
      .catch(function (error) {
        console.log("Service Worker 등록 실패:", error);
        alert(`Service Worker 등록 실패:, ${error}`);
      });
  };

  const getDeviceToken = async () => {
    // 권한이 허용된 후에 토큰을 가져옴
    await getToken(messaging, {
      vapidKey:
        "BI_Wyp2W3KQbrrGTywEZfdew85e11SliE5Y9jkZk_xeBCN8E9WNQ-Sm8dDb6Yf7aov5UKcg6HjSEcq889B8f00k",
    })
      .then((currentToken) => {
        if (currentToken) {
          // 토큰을 서버로 전송하거나 UI 업데이트
          console.log("토큰: ", currentToken);
          localStorage.setItem("chatty_fcmToken", currentToken);
        } else {
          console.log("토큰을 가져오지 못했습니다. 권한을 다시 요청하세요.");
        }
      })
      .catch((err) => {
        alert(err);
        console.log("토큰을 가져오는 중 에러 발생: ", err);
      });
  };

  const mutation = useMutation({
    mutationFn: login,
    onSuccess: async (res: any) => {
      console.log(res);
      if (res.success) {
        // Access Token을 localStorage에 저장
        if (res.data.accessToken) {
          localStorage.setItem("chatty_accessToken", res.data.accessToken);
          updateSocketToken(res.data.accessToken);
        }
        await customLogin(res.data);
      } else {
        toast.error(res.message);
      }
    },
    onError: () => {
      toast.error("로그인 실패! 올바른 자격 증명을 입력해주세요.");
    },
  });

  const handleSubmit = async (e: React.FormEvent) => {
    try {
      e.preventDefault();
      if (!username || !password) {
        toast.error("모든 항목을 입력해주세요.");
        return;
      }

      handlePermission();

      await getDeviceToken();

      const credentials: LoginRequest = {
        username,
        password,
        fcmToken: localStorage.getItem("chatty_fcmToken")!,
      };

      mutation.mutate(credentials);
    } catch (error) {
      console.log("!! LOGIN ERROR: ", error);
    }
  };

  return (
    <LoginContainer>
      <LoginForm onSubmit={handleSubmit}>
        <Title>로그인</Title>
        <InputField
          type="text"
          placeholder="사용자 이름"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
        />
        <InputField
          type="password"
          placeholder="비밀번호"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <SubmitButton type="submit" disabled={mutation.isPending}>
          로그인
        </SubmitButton>
        <LinkText>
          계정이 없으신가요? <Link to="/register">회원가입</Link>
        </LinkText>
      </LoginForm>
    </LoginContainer>
  );
};

export default LoginPage;
