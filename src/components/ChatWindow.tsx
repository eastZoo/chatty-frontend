import React, { useEffect, useState, useRef } from "react";
import { useRecoilValue } from "recoil";
import { selectedChatState } from "../state/atoms";
import MessageInput from "./MessageInput";
import socket from "@/api/socket";
import { Message } from "@/api/message";
import {
  ChatWindowContainer,
  MessagesContainer,
  MessageItem,
  DummyDiv,
} from "./ChatWindow.styles";

const ChatWindow: React.FC = () => {
  const selectedChat = useRecoilValue(selectedChatState);
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // 메시지 업데이트 시 자동 스크롤
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  useEffect(() => {
    console.log("selectedChat changed:", selectedChat);
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
        {messages.map((msg: Message) => (
          <MessageItem key={msg.id}>
            <strong>{msg.sender.username}</strong>: {msg.content}
          </MessageItem>
        ))}
        <DummyDiv ref={messagesEndRef} />
      </MessagesContainer>
      <MessageInput chatId={selectedChat.id} />
    </ChatWindowContainer>
  );
};

export default ChatWindow;
