import React, { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { login, LoginRequest } from "../../api/auth";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { setToken } from "../../api/axiosInstance";
import useAuthToken from "@/lib/hooks/useAuthToken";
import {
  LoginContainer,
  LoginForm,
  Title,
  InputField,
  SubmitButton,
  LinkText,
} from "./LoginPage.styles";

const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const { customLogin } = useAuthToken();

  const loginMutation = useMutation({
    mutationFn: login,
    onSuccess: async (res: any) => {
      console.log(res);
      if (res.success) {
        await customLogin(res.data);
      } else {
        toast.error(res.message);
      }
    },
    onError: () => {
      toast.error("로그인 실패! 올바른 자격 증명을 입력해주세요.");
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!username || !password) {
      toast.error("모든 항목을 입력해주세요.");
      return;
    }
    const credentials: LoginRequest = { username, password };
    loginMutation.mutate(credentials);
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
        <SubmitButton type="submit" disabled={loginMutation.isPending}>
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
