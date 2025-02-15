// src/components/ChatWindow/ChatWindow.tsx
import React, { useEffect, useState, useRef, useMemo } from "react";
import { useRecoilValue } from "recoil";
import { selectedChatState } from "../../state/atoms";
import MessageInput from "@/components/MessageInput/MessageInput";
import socket from "@/api/socket";
import { Message } from "../../api/message";
import { markChatAsRead } from "../../api/chat";
import {
  ChatWindowContainer,
  MessagesContainer,
  MessageItem,
  DummyDiv,
  Timestamp,
} from "./ChatWindow.styles";

const ChatWindow: React.FC = () => {
  const selectedChat = useRecoilValue(selectedChatState);
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // 안정적인 chatId 추출
  const chatId = useMemo(() => selectedChat?.id, [selectedChat?.id]);

  // 현재 가입한 방을 추적하는 ref
  const joinedRoomRef = useRef<string | null>(null);

  // ISO 날짜 포맷 함수
  const formatTimestamp = (timestamp: string): string => {
    const date = new Date(timestamp);
    date.setHours(date.getHours() + 9); // 한국 시간
    const year = date.getFullYear();
    const month = ("0" + (date.getMonth() + 1)).slice(-2);
    const day = ("0" + date.getDate()).slice(-2);
    const dateStr = `${year}-${month}-${day}`;
    const timeStr = date.toLocaleTimeString(undefined, {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
    return `${dateStr} ${timeStr}`;
  };

  // 자동 스크롤
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  // 소켓 이벤트 관리: 의존성을 chatId만 사용
  useEffect(() => {
    if (!chatId) return;
    setIsLoading(true);
    console.log("ChatWindow: selectedChat", selectedChat);

    // 중복 join 방지
    if (joinedRoomRef.current !== chatId) {
      if (joinedRoomRef.current) {
        console.log("Leaving previous room:", joinedRoomRef.current);
        socket.emit("leaveRoom", joinedRoomRef.current);
      }
      joinedRoomRef.current = chatId;
      try {
        socket.emit("joinRoom", chatId);
        console.log(`Socket joined room ${chatId}`);
      } catch (e) {
        console.error("Error in joinRoom:", e);
      }
    } else {
      console.log(`Already joined room ${chatId}`);
    }

    // 읽지 않은 상태 업데이트: 채팅창이 열리면 현재 시각으로 읽음 상태를 업데이트
    markChatAsRead({ id: chatId, chatType: selectedChat?.type }).catch(
      (error) => {
        console.error("Error marking chat as read:", error);
      }
    );
    const handlePreviousMessages = (previousMessages: Message[]) => {
      setMessages(previousMessages);
      setIsLoading(false);
    };

    const handleNewMessage = (message: Message) => {
      console.log("message", message);
      if (chatId && message.privateChat?.id === chatId) {
        setMessages((prev) => [...prev, message]);
      }
    };

    socket.on("previousMessages", handlePreviousMessages);
    socket.emit("getMessages", {
      roomId: chatId,
      chatType: selectedChat?.type,
    });
    socket.on("newMessage", handleNewMessage);

    return () => {
      console.log("Cleanup: leaving room", chatId);
      if (joinedRoomRef.current === chatId) {
        socket.emit("leaveRoom", chatId);
        joinedRoomRef.current = null;
      }
      socket.off("previousMessages", handlePreviousMessages);
      socket.off("newMessage", handleNewMessage);
    };
  }, [chatId]);

  if (!selectedChat) {
    return (
      <ChatWindowContainer>
        <div style={{ padding: "10px" }}>채팅을 선택해주세요.</div>
      </ChatWindowContainer>
    );
  }

  return (
    <ChatWindowContainer>
      <MessagesContainer>
        <div style={{ flexGrow: 1 }} />
        {messages.map((msg: Message) => (
          <MessageItem key={msg.id}>
            <strong>{msg.sender.username}</strong>: {msg.content}
            <Timestamp>{formatTimestamp(msg.createdAt)}</Timestamp>
          </MessageItem>
        ))}
        <div ref={messagesEndRef} />
      </MessagesContainer>
      <MessageInput chatId={chatId} />
    </ChatWindowContainer>
  );
};

export default ChatWindow;
