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
const MAX_RECENT_NOTIFICATION_IDS = 200;
const SHARED_NOTIFICATION_KEY = "chatty_recent_notification_ids";

function claimSharedNotification(messageId: string): boolean {
  try {
    const stored = JSON.parse(
      localStorage.getItem(SHARED_NOTIFICATION_KEY) ?? "[]",
    ) as string[];
    if (stored.includes(messageId)) return false;
    localStorage.setItem(
      SHARED_NOTIFICATION_KEY,
      JSON.stringify([...stored.slice(-(MAX_RECENT_NOTIFICATION_IDS - 1)), messageId]),
    );
    return true;
  } catch {
    return true;
  }
}

async function claimNotification(messageId: string): Promise<boolean> {
  if (typeof navigator !== "undefined" && navigator.locks) {
    return navigator.locks.request("chatty-notification-sound", () =>
      claimSharedNotification(messageId),
    );
  }
  return claimSharedNotification(messageId);
}

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
  const recentMessageIds = useRef(new Set<string>());
  const recentMessageIdOrder = useRef<string[]>([]);

  // 사용자 제스처 시 알림음 잠금 해제 (클릭·키·터치·포커스) — 백그라운드 재생을 위해 필수
  useEffect(() => {
    const onFirstInteraction = () => {
      if (warmupDone.current) return;
      warmupNotificationSound();
      warmupDone.current = true;
    };
    document.addEventListener("click", onFirstInteraction, { once: true });
    document.addEventListener("keydown", onFirstInteraction, { once: true });
    document.addEventListener("touchstart", onFirstInteraction, { once: true });
    const onFirstFocus = () => {
      if (!warmupDone.current) {
        warmupNotificationSound();
        warmupDone.current = true;
      }
    };
    window.addEventListener("focus", onFirstFocus, { once: true });
    return () => {
      document.removeEventListener("click", onFirstInteraction);
      document.removeEventListener("keydown", onFirstInteraction);
      document.removeEventListener("touchstart", onFirstInteraction);
      window.removeEventListener("focus", onFirstFocus);
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

    const handleChatListUpdate = async (data: ChatListUpdatePayload) => {
      if (data.type !== "private" || !data.message) return;
      const message = data.message;
      const isOwn = message.sender?.id === user.id;
      if (isOwn) return;

      // Socket reconnects or duplicate server broadcasts must not produce
      // another audible notification for the same persisted message.
      if (message.id) {
        if (recentMessageIds.current.has(message.id)) return;

        if (!(await claimNotification(message.id))) return;

        recentMessageIds.current.add(message.id);
        recentMessageIdOrder.current.push(message.id);
        if (
          recentMessageIdOrder.current.length > MAX_RECENT_NOTIFICATION_IDS
        ) {
          const oldestId = recentMessageIdOrder.current.shift();
          if (oldestId) recentMessageIds.current.delete(oldestId);
        }
      }
      // 탭이 보일 때만 "현재 채팅"으로 오면 알림 생략 (다른 탭/창/최소화 시에는 항상 알림)
      const isTabVisible =
        typeof document !== "undefined" &&
        document.visibilityState === "visible";
      // Background notifications are handled by FCM/service worker only.
      // Playing socket audio here too creates a duplicate system + page alert.
      if (!isTabVisible) return;
      const currentChatId = selectedChat?.id;
      if (
        isTabVisible &&
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
