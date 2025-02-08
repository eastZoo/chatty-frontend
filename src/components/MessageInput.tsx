import React, { useState, useCallback } from "react";
import { useRecoilValue } from "recoil";
import socket from "@/api/socket";
import { adminInfoSelector } from "@/state/adminInfo";
import { InputContainer, TextInput, SendButton } from "./MessageInput.styles";

interface MessageInputProps {
  chatId: string;
}

const MessageInput: React.FC<MessageInputProps> = ({ chatId }) => {
  const [content, setContent] = useState("");
  const adminInfo = useRecoilValue(adminInfoSelector);

  const handleSubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      if (content.trim()) {
        socket.emit("sendMessage", {
          chatId,
          content,
          userId: adminInfo.id,
          username: adminInfo.username,
        });
        setContent("");
      }
    },
    [content, chatId, adminInfo]
  );

  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setContent(e.target.value);
  }, []);

  return (
    <InputContainer onSubmit={handleSubmit}>
      <TextInput
        type="text"
        placeholder="메시지를 입력하세요..."
        value={content}
        onChange={handleChange}
      />
      <SendButton type="submit">전송</SendButton>
    </InputContainer>
  );
};

export default React.memo(MessageInput);
