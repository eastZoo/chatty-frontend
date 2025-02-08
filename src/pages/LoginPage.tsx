// src/pages/LoginPage.tsx
import React, { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { login, LoginRequest } from "../api/auth";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { setToken } from "../api/axiosInstance";
import useAuthToken from "@/lib/hooks/useAuthToken";

const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const { customLogin } = useAuthToken();

  const mutation = useMutation({
    mutationFn: login,
    onSuccess: async (res: any) => {
      console.log(res);
      if (res.success) {
        // 로그인 성공

        console.log(res.data);
        await customLogin(res.data);
      } else {
        // 로그인 실패
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
    mutation.mutate(credentials);
  };

  return (
    <div
      style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        height: "100vh",
      }}
    >
      <form
        onSubmit={handleSubmit}
        style={{ display: "flex", flexDirection: "column", width: "300px" }}
      >
        <h2>로그인</h2>
        <input
          type="text"
          placeholder="사용자 이름"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          style={{ marginBottom: "10px", padding: "8px" }}
        />
        <input
          type="password"
          placeholder="비밀번호"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          style={{ marginBottom: "10px", padding: "8px" }}
        />
        <button
          type="submit"
          style={{ padding: "8px" }}
          disabled={mutation.isPending}
        >
          로그인
        </button>
        <p>
          계정이 없으신가요? <Link to="/register">회원가입</Link>
        </p>
      </form>
    </div>
  );
};

export default LoginPage;
