import { useEffect, useRef, useState } from "react";
import { useRecoilValue } from "recoil";
import socket from "@/lib/api/socket";
import { adminInfoSelector } from "@/store/adminInfo";
import { selectedChatState } from "@/store/atoms";
import {
  playNotificationSound,
  warmupNotificationSound,
} from "@/utils/notificationSound";

const BASE_TITLE = "chatty";

type ChatListUpdatePayload = {
  type: "private" | "group" | "read";
  chatId?: string;
  message?: {
    id?: string;
    sender?: { id?: string };
    privateChat?: { id?: string };
    chat?: { id?: string };
  };
};

export default function TabNotificationHandler() {
  const user = useRecoilValue(adminInfoSelector);
  const selectedChat = useRecoilValue(selectedChatState);
  const [unreadCount, setUnreadCount] = useState(0);
  const warmupDone = useRef(false);

  // 사용자 첫 클릭 시 알림음 잠금 해제 (브라우저 정책)
  useEffect(() => {
    if (warmupDone.current) return;
    const onFirstInteraction = () => {
      warmupNotificationSound();
      warmupDone.current = true;
    };
    document.addEventListener("click", onFirstInteraction, { once: true });
    document.addEventListener("keydown", onFirstInteraction, { once: true });
    return () => {
      document.removeEventListener("click", onFirstInteraction);
      document.removeEventListener("keydown", onFirstInteraction);
    };
  }, []);

  // 탭 제목 동기화
  useEffect(() => {
    const title = unreadCount > 0 ? `(${unreadCount})${BASE_TITLE}` : BASE_TITLE;
    document.title = title;
    return () => {
      document.title = BASE_TITLE;
    };
  }, [unreadCount]);

  // 포커스/탭 보일 때 카운트 초기화
  useEffect(() => {
    const handleVisibility = () => {
      if (document.visibilityState === "visible") {
        setUnreadCount(0);
      }
    };
    const handleFocus = () => setUnreadCount(0);
    window.addEventListener("focus", handleFocus);
    document.addEventListener("visibilitychange", handleVisibility);
    return () => {
      window.removeEventListener("focus", handleFocus);
      document.removeEventListener("visibilitychange", handleVisibility);
    };
  }, []);

  // 채팅 목록 업데이트 이벤트 = 새 메시지 알림 (방에 있지 않아도 수신됨)
  useEffect(() => {
    if (!user?.id) return;

    const handleChatListUpdate = (data: ChatListUpdatePayload) => {
      if (data.type !== "private" || !data.message) return;
      const message = data.message;
      const isOwn = message.sender?.id === user.id;
      if (isOwn) return;
      // 지금 보고 있는 채팅방으로 온 메시지면 알림 안 함
      const currentChatId = selectedChat?.id;
      if (
        currentChatId &&
        (message.privateChat?.id === currentChatId ||
          message.chat?.id === currentChatId)
      ) {
        return;
      }

      playNotificationSound();
      setUnreadCount((c) => c + 1);
    };

    socket.on("chatListUpdate", handleChatListUpdate);
    return () => {
      socket.off("chatListUpdate", handleChatListUpdate);
    };
  }, [user?.id, selectedChat?.id]);

  return null;
}
