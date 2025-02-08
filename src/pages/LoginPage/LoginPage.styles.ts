import styled from "styled-components";

export const LoginContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh;
  background-color: #36393f;
`;

export const LoginForm = styled.form`
  display: flex;
  flex-direction: column;
  width: 300px;
  background-color: #2f3136;
  padding: 24px;
  border-radius: 8px;
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.3);
`;

export const Title = styled.h2`
  color: #fff;
  margin-bottom: 16px;
  text-align: center;
`;

export const InputField = styled.input`
  padding: 10px;
  margin-bottom: 12px;
  border: none;
  border-radius: 4px;
  font-size: 1em;
  background-color: #40444b;
  color: #fff;

  &::placeholder {
    color: #b9bbbe;
  }
`;

export const SubmitButton = styled.button`
  padding: 10px;
  border: none;
  border-radius: 4px;
  background-color: #7289da;
  color: #fff;
  font-size: 1em;
  cursor: pointer;
  transition: background-color 0.2s;

  &:hover {
    background-color: #5b6eae;
  }
`;

export const LinkText = styled.p`
  color: #b9bbbe;
  text-align: center;
  margin-top: 16px;

  a {
    color: #7289da;
    text-decoration: none;

    &:hover {
      text-decoration: underline;
    }
  }
`;
