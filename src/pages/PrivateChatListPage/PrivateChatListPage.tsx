// src/pages/PrivateChatListPage/PrivateChatListPage.tsx
import React, { useEffect } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { getPrivateChatList } from "@/lib/api/chat";
import { useRecoilValue } from "recoil";
import { adminInfoSelector } from "@/store/adminInfo";
import { useNavigate } from "react-router-dom";
import socket from "@/lib/api/socket";
import {
  ChatListContainer,
  ChatItem,
  ChatItemAvatar,
  ChatItemContent,
  ChatItemName,
  ChatItemLastMessage,
} from "./PrivateChatListPage.styles";
import UnreadBadge from "@/components/UnreadBadge/UnreadBadge";

const PrivateChatListPage: React.FC = () => {
  const adminInfo = useRecoilValue(adminInfoSelector);
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const { data: chats, isLoading } = useQuery({
    queryKey: ["privateChats"],
    queryFn: getPrivateChatList,
    enabled: !!adminInfo,
  });

  // 실시간 메시지 이벤트 처리
  useEffect(() => {
    const handleNewMessage = (message: any) => {
      console.log("채팅 목록 업데이트 - 새 메시지:", message);

      // 현재 사용자가 보낸 메시지가 아닌 경우에만 읽지 않은 카운트 증가
      const isOwnMessage = message.sender?.id === adminInfo?.id;

      if (!isOwnMessage) {
        // 캐시된 데이터를 즉시 업데이트
        queryClient.setQueryData(["privateChats"], (oldData: any) => {
          if (!oldData) return oldData;

          return oldData.map((chat: any) => {
            // 메시지가 해당 채팅방에 속하는지 확인
            const isMessageForThisChat =
              message.privateChat?.id === chat.id ||
              message.chat?.id === chat.id;

            if (isMessageForThisChat) {
              return {
                ...chat,
                lastMessage: message.content || "파일을 보냈습니다",
                unreadCount: (chat.unreadCount || 0) + 1,
              };
            }
            return chat;
          });
        });
      } else {
        // 자신이 보낸 메시지인 경우 마지막 메시지만 업데이트
        queryClient.setQueryData(["privateChats"], (oldData: any) => {
          if (!oldData) return oldData;

          return oldData.map((chat: any) => {
            const isMessageForThisChat =
              message.privateChat?.id === chat.id ||
              message.chat?.id === chat.id;

            if (isMessageForThisChat) {
              return {
                ...chat,
                lastMessage: message.content || "파일을 보냈습니다",
              };
            }
            return chat;
          });
        });
      }

      // 백그라운드에서 서버 데이터와 동기화
      queryClient.invalidateQueries({ queryKey: ["privateChats"] });
    };

    const handleChatListUpdate = (data: any) => {
      console.log("채팅방 목록 업데이트 이벤트:", data);

      if (data.type === "private" || data.type === "read") {
        // 프라이빗 채팅 관련 업데이트 - 즉시 리페치
        queryClient.invalidateQueries({ queryKey: ["privateChats"] });

        // 읽음 상태 업데이트인 경우 추가 처리
        if (data.type === "read" && data.chatId) {
          console.log(`채팅 ${data.chatId} 읽음 상태 업데이트`);
          // 캐시된 데이터를 즉시 업데이트
          queryClient.setQueryData(["privateChats"], (oldData: any) => {
            if (!oldData) return oldData;

            return oldData.map((chat: any) => {
              if (chat.id === data.chatId) {
                return { ...chat, unreadCount: 0 };
              }
              return chat;
            });
          });
        }
      }

      if (data.type === "group") {
        // 그룹 채팅 관련 업데이트 (필요시)
        queryClient.invalidateQueries({ queryKey: ["groupChats"] });
      }
    };

    const handleMessageRead = (data: any) => {
      console.log("메시지 읽음 처리:", data);
      // 읽음 상태 업데이트
      queryClient.invalidateQueries({ queryKey: ["privateChats"] });
    };

    // 소켓 이벤트 리스너 등록
    socket.on("newMessage", handleNewMessage);
    socket.on("chatListUpdate", handleChatListUpdate);
    socket.on("messageRead", handleMessageRead);

    return () => {
      socket.off("newMessage", handleNewMessage);
      socket.off("chatListUpdate", handleChatListUpdate);
      socket.off("messageRead", handleMessageRead);
    };
  }, [queryClient]);

  if (isLoading) return <div>로딩중...</div>;

  return (
    <ChatListContainer>
      {chats && chats.length > 0 ? (
        chats.map((chat: any) => {
          const friend = chat.otherUser;
          let lastMessage = chat.lastMessage || "";
          if (lastMessage.length > 20) {
            lastMessage = lastMessage.slice(0, 20) + "...";
          }
          return (
            <ChatItem
              key={chat.id}
              onClick={() => navigate(`/chat/private/${friend.id}`)}
            >
              <ChatItemAvatar>
                {friend.username.charAt(0).toUpperCase()}
              </ChatItemAvatar>
              <ChatItemContent>
                <ChatItemName>{friend.username}</ChatItemName>
                <ChatItemLastMessage>{lastMessage}</ChatItemLastMessage>
              </ChatItemContent>
              <UnreadBadge count={chat.unreadCount} />
            </ChatItem>
          );
        })
      ) : (
        <div>참여 중인 채팅방이 없습니다.</div>
      )}
    </ChatListContainer>
  );
};

export default PrivateChatListPage;
