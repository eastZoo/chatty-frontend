import React, { useState, useCallback } from "react";
import { useRecoilValue } from "recoil";
import socket from "@/api/socket";
import { adminInfoSelector } from "@/state/adminInfo";

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
        // 소켓을 통해 메시지 전송
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
    <form onSubmit={handleSubmit} style={{ display: "flex" }}>
      <input
        style={{ flex: 1, padding: "10px" }}
        type="text"
        placeholder="메시지를 입력하세요..."
        value={content}
        onChange={handleChange}
      />
      <button type="submit">전송</button>
    </form>
  );
};

// React.memo를 사용해 props가 변경되지 않으면 리렌더링하지 않도록 함
export default React.memo(MessageInput);
