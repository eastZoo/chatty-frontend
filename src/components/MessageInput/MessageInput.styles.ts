import styled from "styled-components";

export const InputContainer = styled.form`
  display: flex;
  align-items: center;
  background-color: #40444b;
  padding: 12px 16px;
  box-sizing: border-box;
  width: 100%;

  /* 데스크탑: 일반 흐름 내에 위치 */
  @media (min-width: 769px) {
    position: relative;
  }

  /* 모바일: 화면 하단에 고정 */
  @media (max-width: 768px) {
    position: fixed;
    bottom: 0;
    left: 0;
    right: 0;
    z-index: 1000;
  }
`;

export const TextInput = styled.input`
  flex: 1;
  padding: 10px;
  border: none;
  border-radius: 4px;
  font-size: 1em;
  background-color: #2f3136;
  color: #fff;
  box-sizing: border-box;

  &:focus {
    outline: none;
    box-shadow: 0 0 0 2px #7289da;
  }

  &::placeholder {
    color: #b9bbbe;
  }
`;

export const SendButton = styled.button`
  background-color: #7289da;
  border: none;
  border-radius: 4px;
  color: #fff;
  padding: 10px 16px;
  margin-left: 8px;
  cursor: pointer;
  font-size: 1em;
  transition: background-color 0.2s;

  &:hover {
    background-color: #5b6eae;
  }
`;
