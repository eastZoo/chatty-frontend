import React, { useState, useCallback, useRef, useEffect } from "react";
import { useRecoilState, useRecoilValue } from "recoil";
import socket from "@/lib/api/socket";
import { adminInfoSelector } from "@/store/adminInfo";
import { InputContainer, TextInput, SendButton } from "./MessageInput.styles";
import { selectedChatState } from "@/store/atoms";

interface MessageInputProps {
  chatId?: string;
}

const MessageInput: React.FC<MessageInputProps> = ({ chatId }) => {
  const [content, setContent] = useState("");
  const [selectedChat, setSelectedChat] = useRecoilState(selectedChatState);
  const adminInfo = useRecoilValue(adminInfoSelector);
  // 입력 필드에 대한 ref 생성
  const inputRef = useRef<HTMLInputElement>(null);

  // 메시지 전송 후 입력 필드에 포커스를 유지
  const handleSubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      if (content.trim()) {
        socket.emit("sendMessage", {
          chatId,
          content,
          userId: adminInfo.id,
          username: adminInfo.username,
          chatType: selectedChat?.type,
        });
        setContent("");
        // 메시지 전송 후 입력 필드에 다시 포커스 설정
        if (inputRef.current) {
          inputRef.current.focus();
        }
      }
    },
    [content, chatId, adminInfo]
  );

  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setContent(e.target.value);
  }, []);

  // 컴포넌트 마운트 시 포커스를 설정하여 키보드가 바로 올라오도록 할 수도 있습니다.
  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, []);

  return (
    <InputContainer onSubmit={handleSubmit}>
      <TextInput
        ref={inputRef}
        type="text"
        placeholder="메시지를 입력하세요..."
        value={content}
        onChange={handleChange}
        maxLength={1000}
      />
      <SendButton type="submit" disabled={!content.trim()}></SendButton>
    </InputContainer>
  );
};

export default React.memo(MessageInput);
