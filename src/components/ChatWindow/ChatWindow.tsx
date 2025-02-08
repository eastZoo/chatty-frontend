import React, { useEffect, useState, useRef } from "react";
import { useRecoilValue } from "recoil";
import { selectedChatState } from "../../state/atoms";
import MessageInput from "@/components/MessageInput/MessageInput";
import socket from "@/api/socket";
import { Message } from "../../api/message";
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

  // 헬퍼 함수: ISO 날짜 문자열을 "YYYY-MM-DD 오후 HH:MM" 형식으로 포맷합니다.
  const formatTimestamp = (timestamp: string): string => {
    const date = new Date(timestamp);
    // 9시간 추가
    date.setHours(date.getHours() + 9);
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

  // 새로운 메시지가 추가될 때 스크롤을 하단으로 이동
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  useEffect(() => {
    if (selectedChat) {
      setIsLoading(true);
      socket.emit("joinRoom", selectedChat.id);
      socket.on("previousMessages", (previousMessages: Message[]) => {
        setMessages(previousMessages);
        setIsLoading(false);
      });
      socket.emit("getMessages", selectedChat.id);
    }
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
    return (
      <ChatWindowContainer>
        <div style={{ padding: "10px" }}>채팅을 선택해주세요.</div>
      </ChatWindowContainer>
    );
  }

  return (
    <ChatWindowContainer>
      <MessagesContainer>
        {/* 플렉스 푸셔: 내용이 적을 경우 하단에 고정 */}
        <div style={{ flexGrow: 1 }} />
        {messages.map((msg: Message) => (
          <MessageItem key={msg.id}>
            <strong>{msg.sender.username}</strong>: {msg.content}
            <Timestamp>{formatTimestamp(msg.createdAt)}</Timestamp>
          </MessageItem>
        ))}
        <div ref={messagesEndRef} />
      </MessagesContainer>
      <MessageInput chatId={selectedChat.id} />
    </ChatWindowContainer>
  );
};

export default ChatWindow;
