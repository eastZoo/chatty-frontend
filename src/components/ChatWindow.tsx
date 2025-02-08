// src/components/ChatWindow.tsx
import React, { useEffect, useState, useRef } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { getMessages, Message } from "../api/message";
import { useRecoilValue } from "recoil";
import { selectedChatState } from "../state/atoms";
import MessageInput from "./MessageInput";
import socket from "@/api/socket";

const ChatWindow: React.FC = () => {
  const selectedChat = useRecoilValue(selectedChatState);
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // 메시지 목록 컨테이너 하단에 위치할 dummy div를 위한 ref 생성
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // messages가 업데이트 될 때마다 자동 스크롤
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  useEffect(() => {
    console.log("selectedChat changed:", selectedChat);
    if (selectedChat) {
      setIsLoading(true);
      // 채팅방 입장
      socket.emit("joinRoom", selectedChat.id);

      // 이전 메시지 수신 이벤트 리스너를 먼저 등록
      socket.on("previousMessages", (previousMessages: Message[]) => {
        setMessages(previousMessages);
        setIsLoading(false);
      });

      // 이전 메시지 요청
      socket.emit("getMessages", selectedChat.id);
    }

    // 새 메시지 수신 이벤트 리스너 등록
    socket.on("newMessage", (message) => {
      if (selectedChat && message.chat?.id === selectedChat.id) {
        setMessages((prev) => [...prev, message]);
      }
    });

    return () => {
      if (selectedChat) {
        socket.emit("leaveRoom", selectedChat.id);
      }
      socket.off("newMessage");
      socket.off("previousMessages");
    };
  }, [selectedChat]);

  if (!selectedChat) {
    return <div style={{ flex: 1, padding: "10px" }}>채팅을 선택해주세요.</div>;
  }

  return (
    <div
      style={{
        flex: 1,
        padding: "10px",
        display: "flex",
        flexDirection: "column",
      }}
    >
      <div style={{ flex: 1, overflowY: "auto", marginBottom: "10px" }}>
        {messages &&
          messages.map((msg: Message) => (
            <div
              key={msg.id}
              style={{
                margin: "5px 0",
                padding: "5px",
                border: "1px solid #ccc",
                borderRadius: "4px",
              }}
            >
              <strong>{msg.sender.username}</strong>: {msg.content}
            </div>
          ))}
        {/* 스크롤 목표가 될 dummy div */}
        <div ref={messagesEndRef} />
      </div>
      <MessageInput chatId={selectedChat.id} />
    </div>
  );
};

export default ChatWindow;
