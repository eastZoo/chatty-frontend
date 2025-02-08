import styled from "styled-components";

export const InputContainer = styled.form`
  display: flex;
  border-top: 1px solid #202225;
  padding: 12px;
  background-color: #40444b;
  box-sizing: border-box;
`;

export const TextInput = styled.input`
  flex: 1;
  padding: 10px;
  border: none;
  border-radius: 4px;
  font-size: 1em;
  background-color: #2f3136;
  color: #fff;

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
