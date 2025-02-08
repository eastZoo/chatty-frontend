// src/pages/RegisterPage.tsx
import React, { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { register, RegisterRequest, RegisterResponse } from "../api/auth";
import { useNavigate, Link } from "react-router-dom";
import { toast } from "react-toastify";
import { setToken } from "../api/axiosInstance";
import { saveAccessToken } from "../utils/authFunctions";
import { ResponseType } from "@/types/response.types";

const RegisterPage: React.FC = () => {
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const mutation = useMutation({
    mutationFn: register,
    onSuccess: (data: ResponseType<any>) => {
      console.log(data.success);
      // 회원가입 성공 후 JWT 토큰을 저장하고 채팅 화면으로 이동
      if (data.success) {
        navigate("/");
      } else {
        toast.error(data.message);
      }
    },
    onError: (error: any) => {
      toast.error("회원가입 실패: " + (error.response?.data?.message || ""));
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      toast.error("비밀번호와 확인 비밀번호가 일치하지 않습니다.");
      return;
    }
    const request: RegisterRequest = { username, password };
    mutation.mutate(request);
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
        <h2>회원가입</h2>
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
        <input
          type="password"
          placeholder="비밀번호 확인"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          style={{ marginBottom: "10px", padding: "8px" }}
        />
        <button
          type="submit"
          disabled={mutation.isPending}
          style={{ padding: "8px" }}
        >
          회원가입
        </button>
        <p>
          이미 계정이 있으신가요? <Link to="/login">로그인</Link>
        </p>
      </form>
    </div>
  );
};

export default RegisterPage;
