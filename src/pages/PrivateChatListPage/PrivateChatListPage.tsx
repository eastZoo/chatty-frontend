// src/pages/PrivateChatListPage/PrivateChatListPage.tsx
import React from "react";
import { useQuery } from "@tanstack/react-query";
import { getPrivateChatList, Chat } from "@/api/chat";
import { useRecoilValue } from "recoil";
import { adminInfoSelector } from "@/state/adminInfo";
import { useNavigate } from "react-router-dom";
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

  const { data: chats, isLoading } = useQuery({
    queryKey: ["privateChats"],
    queryFn: getPrivateChatList,
    enabled: !!adminInfo,
  });

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
