import React, { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { register, type RegisterRequest } from "@/lib/api/auth";
import { useNavigate, Link } from "react-router-dom";
import { toast } from "react-toastify";
import {
  RegisterContainer,
  RegisterForm,
  Title,
  InputField,
  SubmitButton,
  LinkText,
} from "./RegisterPage.styles";

const RegisterPage: React.FC = () => {
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const mutation = useMutation({
    mutationFn: register,
    onSuccess: (data: any) => {
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
    <RegisterContainer>
      <RegisterForm onSubmit={handleSubmit}>
        <Title>회원가입</Title>
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
        <InputField
          type="password"
          placeholder="비밀번호 확인"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
        />
        <SubmitButton type="submit" disabled={mutation.isPending}>
          회원가입
        </SubmitButton>
        <LinkText>
          이미 계정이 있으신가요? <Link to="/login">로그인</Link>
        </LinkText>
      </RegisterForm>
    </RegisterContainer>
  );
};

export default RegisterPage;
