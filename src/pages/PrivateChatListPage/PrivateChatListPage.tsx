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

  const {
    data: chats,
    isLoading,
    isError,
    refetch,
  } = useQuery({
    queryKey: ["privateChats"],
    queryFn: getPrivateChatList,
    enabled: !!adminInfo,
    staleTime: 30000, // 30초간 캐시 유지
    refetchOnMount: false, // 마운트 시 자동 refetch 비활성화
    refetchOnWindowFocus: false, // 탭 전환 시 자동 refetch 비활성화
  });

  // 실시간 메시지 이벤트 처리 (캐시만 갱신, 불필요한 refetch 최소화)
  useEffect(() => {
    if (!adminInfo?.id) return;

    // refetch 디바운싱을 위한 타이머
    let refetchTimeout: NodeJS.Timeout | null = null;
    const REFETCH_DEBOUNCE_MS = 1000; // 1초 디바운스

    const debouncedRefetch = () => {
      if (refetchTimeout) {
        clearTimeout(refetchTimeout);
      }
      refetchTimeout = setTimeout(() => {
        queryClient.refetchQueries({ 
          queryKey: ["privateChats"],
          type: "active", // 활성 쿼리만 refetch
        });
        refetchTimeout = null;
      }, REFETCH_DEBOUNCE_MS);
    };

    const handleNewMessage = (message: any) => {
      const isOwnMessage = message.sender?.id === adminInfo?.id;

      if (!isOwnMessage) {
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
                unreadCount: (chat.unreadCount || 0) + 1,
              };
            }
            return chat;
          });
        });
        // 새 메시지가 있을 때만 디바운스된 refetch
        debouncedRefetch();
      } else {
        // 자신의 메시지는 캐시만 업데이트 (refetch 불필요)
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
    };

    const handleChatListUpdate = (data: any) => {
      if (data.type === "private" || data.type === "read") {
        if (data.type === "read" && data.chatId) {
          queryClient.setQueryData(["privateChats"], (oldData: any) => {
            if (!oldData) return oldData;
            return oldData.map((chat: any) =>
              chat.id === data.chatId ? { ...chat, unreadCount: 0 } : chat
            );
          });
        }
        // 읽음 상태 업데이트는 캐시만 업데이트하고 refetch는 디바운스
        debouncedRefetch();
      }
      if (data.type === "group") {
        queryClient.refetchQueries({ queryKey: ["groupChats"] });
      }
    };

    const handleMessageRead = () => {
      // 읽음 이벤트는 디바운스된 refetch만 수행
      debouncedRefetch();
    };

    socket.on("newMessage", handleNewMessage);
    socket.on("chatListUpdate", handleChatListUpdate);
    socket.on("messageRead", handleMessageRead);

    return () => {
      if (refetchTimeout) {
        clearTimeout(refetchTimeout);
      }
      socket.off("newMessage", handleNewMessage);
      socket.off("chatListUpdate", handleChatListUpdate);
      socket.off("messageRead", handleMessageRead);
    };
  }, [adminInfo?.id, queryClient]);

  if (isLoading && !chats) return <div>로딩중...</div>;

  if (isError) {
    return (
      <ChatListContainer>
        <div style={{ padding: 16, textAlign: "center" }}>
          <p>채팅 목록을 불러오지 못했습니다.</p>
          <button type="button" onClick={() => refetch()}>
            다시 시도
          </button>
        </div>
      </ChatListContainer>
    );
  }

  return (
    <ChatListContainer>
      {chats && chats.length > 0 ? (
        chats.map((chat: any) => {
          const friend = chat.otherUser;
          if (!friend) return null;
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
                {friend.username?.charAt(0).toUpperCase() ?? "?"}
              </ChatItemAvatar>
              <ChatItemContent>
                <ChatItemName>{friend.username ?? ""}</ChatItemName>
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
