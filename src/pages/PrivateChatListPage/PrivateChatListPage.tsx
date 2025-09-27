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
      // 채팅 목록을 다시 가져와서 최신 메시지와 읽지 않은 메시지 수 업데이트
      queryClient.invalidateQueries({ queryKey: ["privateChats"] });
    };

    const handleChatListUpdate = (data: any) => {
      console.log("채팅방 목록 업데이트 이벤트:", data);

      if (data.type === "private" || data.type === "read") {
        // 프라이빗 채팅 관련 업데이트
        queryClient.invalidateQueries({ queryKey: ["privateChats"] });
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
