// src/components/ChatWindow/ChatWindow.tsx
import React, { useEffect, useState, useRef, useMemo } from "react";
import { useRecoilValue } from "recoil";
import { selectedChatState } from "@/store/atoms";
import { adminInfoSelector } from "@/store/adminInfo";
import MessageInput from "@/components/MessageInput/MessageInput";
import CodeBlock from "@/components/CodeBlock/CodeBlock";
import FileAttachment from "@/components/FileAttachment/FileAttachment";
import socket from "@/lib/api/socket";
import { type Message } from "@/lib/api/message";
import { markChatAsRead } from "@/lib/api/chat";
import {
  ChatWindowContainer,
  MessagesContainer,
  MessageItem,
  MessageBubble,
  MessageHeader,
  SenderName,
  Timestamp,
  EmptyChatContainer,
  EmptyChatIcon,
  EmptyChatText,
} from "./ChatWindow.styles";

const ChatWindow: React.FC = () => {
  const selectedChat = useRecoilValue(selectedChatState);
  const adminInfo = useRecoilValue(adminInfoSelector);
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

  // 코드 블록 파싱 함수
  const parseCodeBlocks = (content: string) => {
    const codeBlockRegex = /```(\w+)?\n([\s\S]*?)```/g;
    const parts = [];
    let lastIndex = 0;
    let match;

    while ((match = codeBlockRegex.exec(content)) !== null) {
      // 코드 블록 이전의 텍스트 추가
      if (match.index > lastIndex) {
        const textContent = content.slice(lastIndex, match.index).trim();
        if (textContent) {
          parts.push({ type: "text", content: textContent });
        }
      }

      // 코드 블록 추가
      const language = match[1] || "text";
      const code = match[2].trim();
      parts.push({ type: "code", content: code, language });

      lastIndex = match.index + match[0].length;
    }

    // 마지막 텍스트 추가
    if (lastIndex < content.length) {
      const textContent = content.slice(lastIndex).trim();
      if (textContent) {
        parts.push({ type: "text", content: textContent });
      }
    }

    return parts.length > 0 ? parts : [{ type: "text", content }];
  };

  // 자동 스크롤 - 메시지가 추가될 때만 아래로 스크롤
  useEffect(() => {
    if (messagesEndRef.current && messages.length > 0) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages.length]); // messages.length만 의존성으로 사용

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
    markChatAsRead({
      id: chatId || "",
      chatType: selectedChat?.type || "",
    }).catch((error) => {
      console.error("Error marking chat as read:", error);
    });
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

  console.log("messages", messages);
  // 현재 사용자 ID
  const currentUserId = adminInfo?.id;

  if (!selectedChat) {
    return (
      <ChatWindowContainer>
        <EmptyChatContainer>
          <EmptyChatIcon>
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none">
              <path
                d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </EmptyChatIcon>
          <EmptyChatText>
            채팅을 선택해주세요
            <br />
            대화를 시작하려면 친구 목록에서
            <br />
            친구를 선택하세요
          </EmptyChatText>
        </EmptyChatContainer>
      </ChatWindowContainer>
    );
  }

  return (
    <ChatWindowContainer>
      <MessagesContainer>
        {isLoading ? (
          <div
            style={{
              flex: 1,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <div>메시지를 불러오는 중...</div>
          </div>
        ) : (
          <>
            {/* 메시지가 적을 때 상단에 빈 공간 추가하여 메시지가 하단에 정렬되도록 함 */}
            {messages.length <= 5 && <div style={{ flex: 1 }} />}
            {messages.map((msg: Message) => {
              const isOwn = msg.sender?.id === currentUserId;

              return (
                <MessageItem key={msg.id} isOwn={isOwn}>
                  {!isOwn && (
                    <MessageHeader>
                      <SenderName>{msg.sender?.username}</SenderName>
                    </MessageHeader>
                  )}

                  {/* 메시지 내용 파싱 및 렌더링 */}
                  {msg.content &&
                    parseCodeBlocks(msg.content).map((part, index) => {
                      if (part.type === "code") {
                        return (
                          <CodeBlock
                            key={index}
                            code={part.content}
                            language={part.language}
                            isOwn={isOwn}
                          />
                        );
                      } else {
                        return (
                          <MessageBubble key={index} isOwn={isOwn}>
                            {part.content}
                          </MessageBubble>
                        );
                      }
                    })}

                  {/* 파일 첨부들 */}
                  {/* TODO: 서버에서 fileAttachments 필드 지원 필요 */}
                  {(msg as any).fileAttachments?.map((file: any) => (
                    <FileAttachment
                      key={file.id}
                      file={file}
                      isOwn={isOwn}
                      onDownload={(file) => {
                        // TODO: 파일 다운로드 기능 구현
                        console.log("Download file:", file.name);
                      }}
                    />
                  ))}

                  <Timestamp isOwn={isOwn}>
                    {formatTimestamp(msg.createdAt || "")}
                  </Timestamp>
                </MessageItem>
              );
            })}
            <div ref={messagesEndRef} />
          </>
        )}
      </MessagesContainer>
      <MessageInput chatId={chatId} />
    </ChatWindowContainer>
  );
};

export default ChatWindow;
