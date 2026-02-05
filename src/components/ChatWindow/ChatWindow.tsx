/**
 * ChatWindow 컴포넌트
 *
 * 채팅방의 메시지를 표시하고 관리하는 메인 컴포넌트입니다.
 * - 소켓을 통한 실시간 메시지 수신 및 전송
 * - 메시지 표시 및 렌더링 (코드 블록, 파일 첨부 포함)
 * - 읽음 상태 관리
 * - 자동 스크롤 처리
 */
import React, {
  useEffect,
  useState,
  useRef,
  useMemo,
  useCallback,
} from "react";
import { useRecoilValue } from "recoil";
import { selectedChatState } from "@/store/atoms";
import { adminInfoSelector } from "@/store/adminInfo";
import MessageInput from "@/components/MessageInput/MessageInput";
import CodeBlock from "@/components/CodeBlock/CodeBlock";
import FileAttachment from "@/components/FileAttachment/FileAttachment";
import MessageStatus from "@/components/MessageStatus/MessageStatus";
import socket from "@/lib/api/socket";
import { type Message } from "@/lib/api/message";
import { markChatAsRead } from "@/lib/api/chat";
import { formatTimestamp } from "@/utils/dateUtils";
import { parseCodeBlocks } from "@/utils/messageUtils";
import { downloadFile } from "@/utils/fileUtils";
import { IoIosClose } from "react-icons/io";
import { FiDownload } from "react-icons/fi";
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
  ReplyChatContainer,
  ReplayBox,
  ReplyMessageLayout,
  ImageOpenLayout,
  ImageBubbleBox,
} from "./ChatWindow.styles";
import { TransformWrapper, TransformComponent } from "react-zoom-pan-pinch";

// 상수 정의
const INITIAL_MESSAGE_LIMIT = 20; // 초기 로드 시 가져올 메시지 수
const MESSAGE_LOAD_LIMIT = 20; // 스크롤 업 시 추가로 가져올 메시지 수
const SCROLL_THRESHOLD = 100; // 스크롤 감지 임계값 (픽셀)
const MESSAGE_LOAD_TIMEOUT_MS = 10000; // 초기 메시지 응답 대기 시간
const SOCKET_CONNECT_POLL_MS = 500; // 소켓 연결 폴링 간격
const READY_FALLBACK_MS = 3500; // 이 시간 후에도 표시 안 되면 강제 표시 + 재요청
const RETRY_GET_MESSAGES_DELAY_MS = 800; // 재요청 전 대기

interface ChatListUpdateData {
  chatId?: string;
  type?: string;
}

interface SocketErrorMessage {
  error?: string;
}

interface PreviousMessagesResponse {
  messages: Message[];
  hasMore: boolean; // 더 불러올 메시지가 있는지 여부
  cursor?: string; // 다음 페이지를 가져오기 위한 커서
}

const ChatWindow: React.FC = () => {
  // Recoil 상태 관리
  const selectedChat = useRecoilValue(selectedChatState);
  const adminInfo = useRecoilValue(adminInfoSelector);

  // 로컬 상태 관리
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false); // 이전 메시지 로딩 중
  const [hasMoreMessages, setHasMoreMessages] = useState(true); // 더 불러올 메시지가 있는지
  const [isUserAtBottom, setIsUserAtBottom] = useState(true); // 사용자가 맨 아래에 있는지
  const [cursor, setCursor] = useState<string | undefined>(undefined); // 페이지네이션 커서
  const [isReadyToShow, setIsReadyToShow] = useState(false); // 초기 로드 완료 후 표시 준비 여부
  const [keyboardOffset, setKeyboardOffset] = useState(0);
  const [replyTarget, setReplyTarget] = useState<{
    messageId: string;
    content: string;
    senderId: string;
    senderName: string;
  } | null>(null); // 답장 메세지 상태
  const [isImgOpen, setIsImgOpen] = useState<boolean>(false); // 이미지 파일 확대 모달
  const [isImgUrl, setIsImgUrl] = useState<string | null>(null);
  const [activeMessageId, setActiveMessageId] = useState<string | null>(null); // 스와이프한 메세지 id 상태 관리

  // Refs
  const messagesEndRef = useRef<HTMLDivElement>(null); // 메시지 끝 지점 참조 (자동 스크롤용)
  const messagesStartRef = useRef<HTMLDivElement>(null); // 메시지 시작 지점 참조 (스크롤 위치 유지용)
  const messagesContainerRef = useRef<HTMLDivElement>(null); // 메시지 컨테이너 참조
  const joinedRoomRef = useRef<string | null>(null); // 현재 가입한 소켓 방 추적
  const isInitialLoadRef = useRef(true); // 초기 로드 여부
  const messageLoadTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(
    null,
  ); // 초기 메시지 응답 타임아웃
  const syncOnVisibilityRef = useRef(false); // 탭 복귀/재연결 시 수신 메시지를 교체할지 여부
  const retryGetMessagesRef = useRef(false); // 안전 타이머에서 getMessages 재요청 1회만 하기 위함
  const moveReplyMessageRef = useRef<Record<string, HTMLDivElement | null>>({}); // 답장했던 메세지로 이동하는 Ref
  const swipeStartX = useRef(0); // 메세지 스와이프하는 동작

  // 메모이제이션된 값들
  const chatId = useMemo(() => selectedChat?.id, [selectedChat?.id]);
  const currentUserId = adminInfo?.id;
  const containerStyle = useMemo(
    () =>
      ({
        "--keyboard-offset": `${keyboardOffset}px`,
      }) as React.CSSProperties,
    [keyboardOffset],
  );

  /**
   * 모바일 웹뷰에서 가상 키보드 높이에 따라 하단 여백을 조정
   */
  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    const viewport = window.visualViewport;

    if (!viewport) {
      const handleFocusIn = () => {
        setKeyboardOffset(0);
        setTimeout(() => {
          messagesEndRef.current?.scrollIntoView({
            behavior: "smooth",
            block: "end",
          });
        }, 120);
      };

      const handleFocusOut = () => {
        setKeyboardOffset(0);
      };

      window.addEventListener("focusin", handleFocusIn);
      window.addEventListener("focusout", handleFocusOut);

      return () => {
        window.removeEventListener("focusin", handleFocusIn);
        window.removeEventListener("focusout", handleFocusOut);
      };
    }

    let rafId = 0;

    const updateOffset = () => {
      if (rafId) {
        cancelAnimationFrame(rafId);
      }
      rafId = window.requestAnimationFrame(() => {
        const offset =
          window.innerHeight - viewport.height - viewport.offsetTop;
        setKeyboardOffset(offset > 0 ? offset : 0);
      });
    };

    viewport.addEventListener("resize", updateOffset);
    viewport.addEventListener("scroll", updateOffset);
    window.addEventListener("orientationchange", updateOffset);
    window.addEventListener("focusin", updateOffset);
    window.addEventListener("focusout", updateOffset);

    updateOffset();

    return () => {
      if (rafId) {
        cancelAnimationFrame(rafId);
      }
      viewport.removeEventListener("resize", updateOffset);
      viewport.removeEventListener("scroll", updateOffset);
      window.removeEventListener("orientationchange", updateOffset);
      window.removeEventListener("focusin", updateOffset);
      window.removeEventListener("focusout", updateOffset);
    };
  }, []);

  /**
   * 스크롤 위치 감지 및 자동 스크롤 처리
   * - 새 메시지가 추가될 때 사용자가 맨 아래에 있으면 자동 스크롤
   * - 초기 로드 시에는 스크롤 없이 최신 메시지가 보이도록 처리
   */
  useEffect(() => {
    if (!messagesContainerRef.current) return;
    if (isInitialLoadRef.current) return; // 초기 로드 중에는 스크롤 감지 안 함

    const container = messagesContainerRef.current;
    const isNearBottom =
      container.scrollHeight - container.scrollTop - container.clientHeight <
      SCROLL_THRESHOLD;

    setIsUserAtBottom(isNearBottom);

    // 사용자가 맨 아래에 있을 때만 자동 스크롤
    if (isNearBottom && messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages.length]);

  /**
   * 초기 로드 시 스크롤을 맨 아래로 이동 (최신 메시지 표시)
   * 메시지가 준비되고 DOM이 업데이트된 후 스크롤 위치를 설정하여 깜빡임 방지
   */
  useEffect(() => {
    if (
      !isLoading &&
      isInitialLoadRef.current &&
      messages.length > 0 &&
      !isReadyToShow
    ) {
      // DOM 업데이트 완료를 기다린 후 스크롤 위치 설정
      // requestAnimationFrame을 두 번 사용하여 DOM 렌더링 완료 보장
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          if (messagesContainerRef.current && messagesEndRef.current) {
            // 스크롤을 맨 아래로 즉시 이동 (애니메이션 없이)
            const container = messagesContainerRef.current;
            container.scrollTop = container.scrollHeight;

            // 스크롤 위치 설정 완료 후 메시지 표시
            setIsReadyToShow(true);
            isInitialLoadRef.current = false;
          }
        });
      });
    }
    // 메시지 0건인 빈 채팅도 메시지 영역 표시 (스크롤 없이 바로 준비 완료)
    if (
      !isLoading &&
      isInitialLoadRef.current &&
      !isReadyToShow &&
      messages.length === 0
    ) {
      setIsReadyToShow(true);
      isInitialLoadRef.current = false;
    }
  }, [isLoading, messages.length, isReadyToShow]);

  /**
   * 이전 메시지를 로드하는 함수
   */
  const loadPreviousMessages = useCallback(() => {
    if (!chatId || !selectedChat?.type || isLoadingMore || !hasMoreMessages) {
      return;
    }

    setIsLoadingMore(true);

    socket.emit("getMessages", {
      roomId: chatId,
      chatType: selectedChat.type,
      limit: MESSAGE_LOAD_LIMIT,
      cursor: cursor, // 이전 커서 사용
      direction: "before", // 이전 메시지 방향
    });
  }, [chatId, selectedChat?.type, isLoadingMore, hasMoreMessages, cursor]);

  /**
   * 스크롤 감지: 위로 스크롤하면 이전 메시지 로드
   */
  useEffect(() => {
    const container = messagesContainerRef.current;
    if (!container) return;

    const handleScroll = () => {
      // 스크롤이 위로 올라갔을 때 (맨 위 근처)
      if (
        container.scrollTop < SCROLL_THRESHOLD &&
        hasMoreMessages &&
        !isLoadingMore
      ) {
        loadPreviousMessages();
      }

      // 사용자가 맨 아래에 있는지 확인
      const isNearBottom =
        container.scrollHeight - container.scrollTop - container.clientHeight <
        SCROLL_THRESHOLD;
      setIsUserAtBottom(isNearBottom);
    };

    container.addEventListener("scroll", handleScroll);
    return () => container.removeEventListener("scroll", handleScroll);
  }, [hasMoreMessages, isLoadingMore, loadPreviousMessages]);

  /**
   * 소켓 연결 및 채팅방 초기화를 관리하는 메인 useEffect
   * chatId가 변경될 때마다 실행되며, 소켓 연결 상태를 확인하고 메시지를 불러옵니다.
   */
  useEffect(() => {
    // chatId와 selectedChat이 모두 있어야 초기화 진행
    if (!chatId || !selectedChat?.type) {
      console.log("초기화 대기 중:", { chatId, chatType: selectedChat?.type });
      setIsLoading(false);
      return;
    }
    setIsLoading(true);

    /**
     * 소켓 연결 상태를 확인하고 연결되지 않은 경우 연결을 시도합니다.
     * @returns 연결되어 있으면 true, 연결 중이면 false
     */
    const ensureSocketConnected = (): Promise<boolean> => {
      return new Promise((resolve) => {
        if (socket.connected) {
          resolve(true);
          return;
        }
        console.log("소켓이 연결되지 않음. 연결 시도...");
        socket.connect();

        // 소켓 연결 대기 (최대 3초)
        const checkInterval = setInterval(() => {
          if (socket.connected) {
            clearInterval(checkInterval);
            resolve(true);
          }
        }, 100);

        setTimeout(() => {
          clearInterval(checkInterval);
          resolve(socket.connected);
        }, 3000);
      });
    };

    /**
     * 읽음 상태를 업데이트하는 함수
     * API 호출과 소켓 브로드캐스트를 모두 수행합니다.
     * 재시도 로직 포함
     */
    const markAsRead = async (retryCount = 0): Promise<void> => {
      const maxRetries = 3;
      const retryDelay = 500;

      try {
        // selectedChat이 없으면 재시도
        if (!selectedChat?.type && retryCount < maxRetries) {
          console.log(
            `markAsRead: selectedChat이 아직 설정되지 않음. 재시도 ${retryCount + 1}/${maxRetries}`,
          );
          setTimeout(() => markAsRead(retryCount + 1), retryDelay);
          return;
        }

        const chatType = selectedChat?.type || "private";

        // API 호출로 읽음 상태 업데이트
        await markChatAsRead({
          id: chatId || "",
          chatType: chatType,
        });

        // 소켓을 통해 읽음 상태 브로드캐스트
        if (socket.connected && adminInfo?.id) {
          socket.emit("markAsRead", {
            chatId: chatId,
            chatType: chatType,
            userId: adminInfo.id,
          });
        }

        console.log(`✅ Marked chat ${chatId} as read (type: ${chatType})`);
      } catch (error) {
        console.error("❌ Error marking chat as read:", error);
        // 재시도
        if (retryCount < maxRetries) {
          console.log(`markAsRead 재시도 ${retryCount + 1}/${maxRetries}`);
          setTimeout(() => markAsRead(retryCount + 1), retryDelay);
        }
      }
    };

    /**
     * 채팅방 초기화 함수
     * 소켓 방에 참여하고, 이벤트 리스너를 등록하며, 메시지를 요청합니다.
     * @returns cleanup 함수 (이벤트 리스너 제거용)
     */
    async function initializeChat(): Promise<(() => void) | undefined> {
      // selectedChat이 없으면 초기화하지 않음
      if (!selectedChat?.type) {
        console.error("selectedChat.type이 없어 초기화를 중단합니다.");
        setIsLoading(false);
        return;
      }

      // 소켓 연결 확인 및 대기
      const isConnected = await ensureSocketConnected();
      if (!isConnected) {
        console.error("소켓 연결 실패. 메시지를 가져올 수 없습니다.");
        setIsLoading(false);
        return;
      }

      // 1. 소켓 방 참여 처리 (중복 join 방지)
      if (joinedRoomRef.current !== chatId) {
        // 이전 방이 있으면 나가기
        if (joinedRoomRef.current) {
          console.log("Leaving previous room:", joinedRoomRef.current);
          socket.emit("leaveRoom", joinedRoomRef.current);
        }
        joinedRoomRef.current = chatId || null;
        try {
          socket.emit("joinRoom", chatId);
          console.log(`Socket joined room ${chatId}`);
        } catch (e) {
          console.error("Error in joinRoom:", e);
        }
      } else {
        console.log(`Already joined room ${chatId}`);
      }

      // 채팅방 진입 시 읽음 처리 (selectedChat이 설정된 후에 호출되도록 보장)
      if (selectedChat?.type) {
        markAsRead();
      } else {
        // selectedChat이 아직 설정되지 않았으면 약간의 지연 후 재시도
        const checkSelectedChat = setInterval(() => {
          if (selectedChat?.type) {
            clearInterval(checkSelectedChat);
            markAsRead();
          }
        }, 100);

        // 3초 후에도 selectedChat이 설정되지 않으면 강제로 호출
        setTimeout(() => {
          clearInterval(checkSelectedChat);
          if (!selectedChat?.type) {
            console.warn("selectedChat이 설정되지 않았지만 markAsRead 호출");
            markAsRead();
          }
        }, 3000);
      }

      /**
       * 이전 메시지들을 받아서 상태에 저장하는 핸들러
       * 초기 로드와 추가 로드를 구분하여 처리
       */
      const handlePreviousMessages = (
        response: PreviousMessagesResponse | Message[],
      ): void => {
        if (messageLoadTimeoutRef.current) {
          clearTimeout(messageLoadTimeoutRef.current);
          messageLoadTimeoutRef.current = null;
        }
        const isLegacyFormat = Array.isArray(response);
        const messagesData = isLegacyFormat
          ? (response as Message[])
          : (response as PreviousMessagesResponse).messages;
        const hasMore = isLegacyFormat
          ? false
          : (response as PreviousMessagesResponse).hasMore;
        const newCursor = isLegacyFormat
          ? undefined
          : (response as PreviousMessagesResponse).cursor;

        console.log(
          "previousMessages 수신:",
          messagesData?.length || 0,
          "개",
          hasMore ? "(더 있음)" : "(마지막)",
        );

        // 탭 복귀 또는 소켓 재연결 후 동기화: 수신 메시지로 전체 교체
        if (syncOnVisibilityRef.current) {
          syncOnVisibilityRef.current = false;
          setMessages(messagesData ?? []);
          setIsLoading(false);
          setIsReadyToShow(false);
          setHasMoreMessages(hasMore);
          setCursor(newCursor);
          requestAnimationFrame(() => {
            requestAnimationFrame(() => {
              if (messagesContainerRef.current && messagesEndRef.current) {
                messagesContainerRef.current.scrollTop =
                  messagesContainerRef.current.scrollHeight;
              }
              setIsReadyToShow(true);
            });
          });
          // RAF/DOM 타이밍과 무관하게 한 번은 표시 확정 (간헐적 빈 화면 방지)
          setTimeout(() => setIsReadyToShow(true), 150);
          return;
        }

        if (isInitialLoadRef.current) {
          // 초기 로드: 메시지 교체 (아직 표시하지 않음)
          const list = messagesData ?? [];
          setMessages(list);
          setIsLoading(false);
          setIsReadyToShow(false); // 스크롤 위치 설정 전까지 숨김
          setHasMoreMessages(hasMore);
          setCursor(newCursor);
          // 메시지 0건이면 스크롤 대기 없이 바로 표시 (빈 채팅방도 영역 노출)
          if (list.length === 0) {
            setIsReadyToShow(true);
            isInitialLoadRef.current = false;
          }
        } else {
          // 추가 로드: 이전 메시지 앞에 추가하고 스크롤 위치 유지
          if (messagesStartRef.current && messagesContainerRef.current) {
            const container = messagesContainerRef.current;
            const previousScrollHeight = container.scrollHeight;
            const previousScrollTop = container.scrollTop;

            setMessages((prev) => {
              // 중복 메시지 제거
              const existingIds = new Set(prev.map((msg) => msg.id));
              const newMessages = messagesData.filter(
                (msg) => msg.id && !existingIds.has(msg.id),
              );
              return [...newMessages, ...prev];
            });

            setHasMoreMessages(hasMore);
            setCursor(newCursor);

            // 스크롤 위치 유지
            setTimeout(() => {
              if (messagesContainerRef.current) {
                const newScrollHeight =
                  messagesContainerRef.current.scrollHeight;
                const heightDiff = newScrollHeight - previousScrollHeight;
                messagesContainerRef.current.scrollTop =
                  previousScrollTop + heightDiff;
              }
            }, 0);
          }
          setIsLoadingMore(false);
        }
      };

      /**
       * 새 메시지를 받아서 상태에 추가하는 핸들러
       * 중복 메시지 방지 로직 포함
       * 사용자가 맨 아래에 있을 때만 자동 스크롤
       */
      const handleNewMessage = (message: Message): void => {
        console.log("새 메시지 수신:", message);

        // 현재 채팅방의 메시지인지 확인
        const isMessageForCurrentChat =
          chatId &&
          (message.privateChat?.id === chatId || message.chat?.id === chatId);

        if (!isMessageForCurrentChat) {
          return;
        }

        setMessages((prev) => {
          // 중복 메시지 방지 (같은 ID가 있는지 확인)
          const messageExists = prev.some((msg) => msg.id === message.id);
          if (messageExists) {
            console.log("중복 메시지 무시:", message.id);
            return prev;
          }
          console.log("메시지 추가:", message.id);
          return [...prev, message];
        });

        // 사용자가 맨 아래에 있을 때만 자동 스크롤
        if (isUserAtBottom && messagesEndRef.current) {
          setTimeout(() => {
            messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
          }, 100);
        }

        if (
          message.sender?.id !== currentUserId &&
          chatId &&
          socket.connected
        ) {
          socket.emit("markAsRead", {
            chatId,
            chatType: selectedChat.type,
          });
        }
      };

      /**
       * 채팅방 목록 업데이트 이벤트 핸들러
       */
      const handleChatListUpdate = (data: ChatListUpdateData): void => {
        console.log("채팅방 목록 업데이트:", data);

        // 현재 채팅방과 관련된 업데이트인지 확인
        if (data.chatId === chatId || data.type === "read") {
          console.log("현재 채팅방 업데이트 필요");
          // 필요시 채팅방 정보 갱신 로직 추가 가능
        }
      };

      /**
       * 소켓 에러 메시지 핸들러
       */
      const handleErrorMessage = (data: SocketErrorMessage): void => {
        console.error("소켓 에러 메시지 수신:", data);
        if (messageLoadTimeoutRef.current) {
          clearTimeout(messageLoadTimeoutRef.current);
          messageLoadTimeoutRef.current = null;
        }
        setIsLoading(false);
        if (isInitialLoadRef.current) {
          isInitialLoadRef.current = false;
          setIsReadyToShow(true);
        }
      };

      // 소켓 이벤트 리스너 등록
      socket.on("previousMessages", handlePreviousMessages);
      socket.on("newMessage", handleNewMessage);
      socket.on("chatListUpdate", handleChatListUpdate);
      socket.on("errorMessage", handleErrorMessage);
      socket.on("messagesRead", ({ chatId: readChatId, userId }) => {
        if (readChatId !== chatId) return; // ✅ 다른 채팅방 이벤트 무시

        setMessages((prev) =>
          prev.map((msg) =>
            msg.sender?.id === currentUserId
              ? {
                  ...msg,
                  readByUserIds: Array.from(
                    new Set([...(msg.readByUserIds ?? []), userId]),
                  ),
                }
              : msg,
          ),
        );
      });

      // 메시지 요청 전에 파라미터 재검증 (비동기 처리 후 상태 변경 가능성 대비)
      if (!chatId || !selectedChat?.type) {
        console.error("필수 파라미터가 없습니다:", {
          chatId,
          chatType: selectedChat?.type,
        });
        setIsLoading(false);
        return;
      }

      // 서버에 초기 메시지 요청 (최신 메시지만)
      console.log("📤 getMessages emit 시작 (초기 로드):", {
        roomId: chatId,
        chatType: selectedChat.type,
        limit: INITIAL_MESSAGE_LIMIT,
      });

      // 초기 로드 상태 리셋
      isInitialLoadRef.current = true;
      setIsLoading(true);
      setMessages([]);
      setHasMoreMessages(true);
      setCursor(undefined);

      socket.emit("getMessages", {
        roomId: chatId,
        chatType: selectedChat.type,
        limit: INITIAL_MESSAGE_LIMIT,
        direction: "latest", // 최신 메시지부터
      });

      // 초기 로드 시 응답이 없으면 타임아웃 후 로딩 해제 (깜빡임/멈춤 방지)
      if (messageLoadTimeoutRef.current) {
        clearTimeout(messageLoadTimeoutRef.current);
      }
      messageLoadTimeoutRef.current = setTimeout(() => {
        if (!isInitialLoadRef.current) return;
        messageLoadTimeoutRef.current = null;
        setIsLoading(false);
        setMessages([]);
        setIsReadyToShow(true);
        isInitialLoadRef.current = false;
      }, MESSAGE_LOAD_TIMEOUT_MS);

      // cleanup 함수 반환 (이벤트 리스너 제거)
      return () => {
        if (messageLoadTimeoutRef.current) {
          clearTimeout(messageLoadTimeoutRef.current);
          messageLoadTimeoutRef.current = null;
        }
        socket.off("previousMessages", handlePreviousMessages);
        socket.off("newMessage", handleNewMessage);
        socket.off("chatListUpdate", handleChatListUpdate);
        socket.off("errorMessage", handleErrorMessage);
        socket.off("messagesRead");
      };
    }

    // 소켓 재연결 시 방 재입장 + 메시지 재요청 (두 branch에서 공통으로 등록)
    const onReconnect = () => {
      if (!chatId || !selectedChat?.type || joinedRoomRef.current !== chatId) {
        return;
      }
      console.log("🔄 소켓 재연결됨. 채팅방 재입장 및 메시지 재요청");
      syncOnVisibilityRef.current = true;
      socket.emit("joinRoom", chatId);
      socket.emit("getMessages", {
        roomId: chatId,
        chatType: selectedChat.type,
        limit: INITIAL_MESSAGE_LIMIT,
        direction: "latest",
      });
      // 읽음 상태도 다시 업데이트
      markAsRead();
    };

    // 탭 전환 이벤트 디바운싱
    let visibilityTimeout: NodeJS.Timeout | null = null;
    let lastVisibilityAction = 0;
    const VISIBILITY_DEBOUNCE_MS = 2000; // 2초 디바운스

    // Page Visibility API: 탭이 다시 활성화될 때 소켓 재연결 및 채팅방 재입장
    const handleVisibilityChange = () => {
      if (!document.hidden && chatId && selectedChat?.type) {
        const now = Date.now();
        // 마지막 액션으로부터 2초가 지났는지 확인
        if (now - lastVisibilityAction < VISIBILITY_DEBOUNCE_MS) {
          return;
        }

        if (visibilityTimeout) {
          clearTimeout(visibilityTimeout);
        }

        visibilityTimeout = setTimeout(() => {
          console.log("👁️ 탭이 다시 활성화됨. 소켓 상태 확인 및 재연결");
          if (!socket.connected) {
            console.log("소켓이 끊어져 있음. 재연결 시도...");
            socket.connect();
          } else if (joinedRoomRef.current !== chatId) {
            console.log("채팅방에 재입장 필요");
            lastVisibilityAction = Date.now();
            onReconnect();
          }
          visibilityTimeout = null;
        }, 500); // 500ms 지연
      }
    };

    // Window focus 이벤트도 처리 (visibilitychange와 중복 방지)
    const handleWindowFocus = () => {
      // visibilitychange와 중복 방지
      if (document.hidden) return;

      if (chatId && selectedChat?.type && socket.connected) {
        const now = Date.now();
        if (now - lastVisibilityAction < VISIBILITY_DEBOUNCE_MS) {
          return;
        }

        if (visibilityTimeout) {
          clearTimeout(visibilityTimeout);
        }

        visibilityTimeout = setTimeout(() => {
          console.log("🪟 창이 포커스됨. 채팅방 상태 확인");
          if (joinedRoomRef.current !== chatId) {
            lastVisibilityAction = Date.now();
            onReconnect();
          }
          visibilityTimeout = null;
        }, 500);
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    window.addEventListener("focus", handleWindowFocus);

    // 소켓이 연결되지 않았으면 연결 대기 (connect 이벤트 + 폴링으로 누락 방지)
    let cleanupChat: (() => void) | undefined;
    let connectPoll: NodeJS.Timeout | null = null;
    let connectHandler: (() => void) | null = null;

    ensureSocketConnected().then((isConnected) => {
      if (isConnected) {
        // 소켓이 이미 연결된 경우 바로 초기화
        initializeChat().then((cleanup) => {
          cleanupChat = cleanup;
        });
        connectHandler = onReconnect;
        socket.on("connect", onReconnect);
      } else {
        // 연결 대기 중
        const onConnect = async () => {
          console.log("소켓 연결 완료:", socket.id);
          if (!cleanupChat) {
            const cleanup = await initializeChat();
            cleanupChat = cleanup;
          }
          connectHandler = onReconnect;
          socket.on("connect", onReconnect);
        };
        connectHandler = onConnect;
        socket.on("connect", onConnect);

        connectPoll = setInterval(async () => {
          if (socket.connected) {
            clearInterval(connectPoll!);
            connectPoll = null;
            if (!cleanupChat) {
              const cleanup = await initializeChat();
              cleanupChat = cleanup;
            }
            connectHandler = onReconnect;
            socket.on("connect", onReconnect);
          }
        }, SOCKET_CONNECT_POLL_MS);
      }
    });

    // 최종 cleanup 함수 반환
    return () => {
      if (connectPoll) {
        clearInterval(connectPoll);
      }
      if (visibilityTimeout) {
        clearTimeout(visibilityTimeout);
      }
      if (connectHandler) {
        socket.off("connect", connectHandler);
      }
      socket.off("connect", onReconnect);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      window.removeEventListener("focus", handleWindowFocus);
      console.log("Cleanup: leaving room", chatId);

      // 채팅 초기화 함수의 cleanup 실행
      if (cleanupChat) {
        cleanupChat();
      }

      // 소켓 방 나가기
      if (joinedRoomRef.current === chatId) {
        socket.emit("leaveRoom", chatId);
        joinedRoomRef.current = null;
      }

      // 모든 이벤트 리스너 제거 (안전하게)
      socket.off("previousMessages");
      socket.off("newMessage");
      socket.off("chatListUpdate");
      socket.off("errorMessage");

      if (chatId && adminInfo?.id) {
        socket.emit("markAsRead", {
          chatId: chatId,
          chatType: selectedChat?.type || "private",
          userId: adminInfo.id,
        });
      }
    };
  }, [chatId, selectedChat?.type, adminInfo?.id]);

  /**
   * 탭 복귀 시 메시지 재동기화 (다른 탭/최소화 후 돌아왔을 때 소켓이 끊겼거나 메시지 누락 방지)
   */
  useEffect(() => {
    if (!chatId || !selectedChat?.type) return;

    const handleVisibility = () => {
      if (document.visibilityState !== "visible") return;
      if (!socket.connected) return;

      syncOnVisibilityRef.current = true;
      joinedRoomRef.current = chatId;
      socket.emit("joinRoom", chatId);
      socket.emit("getMessages", {
        roomId: chatId,
        chatType: selectedChat.type,
        limit: INITIAL_MESSAGE_LIMIT,
        direction: "latest",
      });
    };

    document.addEventListener("visibilitychange", handleVisibility);
    return () =>
      document.removeEventListener("visibilitychange", handleVisibility);
  }, [chatId, selectedChat?.type]);

  /**
   * 안전 코드: 지정 시간 후에도 메시지 영역이 안 보이면 강제 표시 + getMessages 1회 재시도
   */
  useEffect(() => {
    if (!chatId || !selectedChat?.type) return;

    const timer = setTimeout(() => {
      const stillLoading = isLoading;
      const stillInitial = isInitialLoadRef.current && !isReadyToShow;
      if (!stillLoading && !stillInitial) return;

      setIsLoading(false);
      setIsReadyToShow(true);
      isInitialLoadRef.current = false;

      if (!retryGetMessagesRef.current) {
        retryGetMessagesRef.current = true;
        setTimeout(() => {
          socket.emit("getMessages", {
            roomId: chatId,
            chatType: selectedChat.type,
            limit: INITIAL_MESSAGE_LIMIT,
            direction: "latest",
          });
        }, RETRY_GET_MESSAGES_DELAY_MS);
      }
    }, READY_FALLBACK_MS);

    return () => clearTimeout(timer);
  }, [chatId, selectedChat?.type, isLoading, isReadyToShow]);

  /**
   * 답장한 메세지 클릭시 이동하는 함수
   */
  const scrollToMessage = (messageId: string) => {
    const el = moveReplyMessageRef.current[messageId];
    if (!el || !messagesContainerRef.current) return;

    el.scrollIntoView({
      behavior: "smooth",
      block: "center", // 메시지를 화면 중앙으로
    });
  };

  /**
   * 채팅방이 선택되지 않은 경우 빈 상태 화면 표시
   */
  const handleInputFocus = useCallback(() => {
    setTimeout(() => {
      messagesEndRef.current?.scrollIntoView({
        behavior: "smooth",
        block: "end",
      });
    }, 100);
  }, []);

  const handleInputBlur = useCallback(() => {
    if (typeof window !== "undefined" && window.visualViewport) {
      return;
    }
    setKeyboardOffset(0);
  }, []);

  /**
   * 메세지 답장 상태 함수
   */
  const handleReplyMessage = (message: any) => {
    setReplyTarget({
      messageId: message.id,
      content: message.content,
      senderId: message.sender.id,
      senderName: message.sender.username,
    });
  };

  const isReadByOther = (msg: Message, myId: string) => {
    if (!msg.readByUserIds || msg.readByUserIds.length === 0) return false;

    // 내가 보낸 메시지를, 다른 누군가가 읽었는지
    return msg.readByUserIds.some((uid) => uid !== myId);
  };

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

  /**
   * 메시지 렌더링 헬퍼 함수
   * 메시지 내용을 파싱하여 텍스트와 코드 블록을 렌더링합니다.
   */
  const renderMessageContent = (
    content: string,
    isOwn: boolean,
  ): React.ReactNode[] => {
    return parseCodeBlocks(content).map((part, index) => {
      if (part.type === "code") {
        return (
          <CodeBlock
            key={`code-${index}`}
            code={part.content}
            language={part.language}
            isOwn={isOwn}
          />
        );
      } else {
        const urlRegex = /(https?:\/\/[^\s]+)/;

        if (urlRegex.test(part.content)) {
          return (
            <MessageBubble key={`text-${index}`} isOwn={isOwn}>
              <a
                href={part.content}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  color: "#4da3ff",
                  textDecoration: "underline",
                  wordBreak: "break-all",
                }}
                onClick={(e) => e.stopPropagation()}
              >
                {part.content}
              </a>
            </MessageBubble>
          );
        } else {
          return (
            <MessageBubble key={`text-${index}`} isOwn={isOwn}>
              {part.content}
            </MessageBubble>
          );
        }
      }
    });
  };

  /**
   * 파일 다운로드 핸들러
   */
  const handleFileDownload = async (file: {
    id: string;
    originalName: string;
  }): Promise<void> => {
    try {
      await downloadFile(file);
    } catch (error) {
      // 에러는 downloadFile 내부에서 처리됨
      console.error("파일 다운로드 실패:", error);
    }
  };

  return (
    <ChatWindowContainer style={containerStyle}>
      <MessagesContainer
        ref={messagesContainerRef}
        style={{
          position: "relative",
          // 초기 로드 중에는 메시지를 숨겨서 깜빡임 방지
          opacity:
            isLoading || (isInitialLoadRef.current && !isReadyToShow) ? 0 : 1,
          transition:
            isLoading || (isInitialLoadRef.current && !isReadyToShow)
              ? "none"
              : "opacity 0.15s ease-in",
        }}
      >
        {/* 로딩 오버레이 - 초기 로드 시에만 표시 */}
        {isLoading || (isInitialLoadRef.current && !isReadyToShow) ? (
          <div
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              backgroundColor: "inherit",
              zIndex: 10,
            }}
          >
            <div>메시지를 불러오는 중...</div>
          </div>
        ) : null}

        {/* 메시지 목록 - 항상 렌더링하되 초기 로드 시에는 투명 */}
        <>
          {/* 이전 메시지 로딩 중 표시 */}
          {isLoadingMore && (
            <div
              style={{
                padding: "10px",
                textAlign: "center",
                color: "#666",
                fontSize: "14px",
              }}
            >
              이전 메시지 불러오는 중...
            </div>
          )}

          {/* 더 이상 불러올 메시지가 없을 때 표시 */}
          {!hasMoreMessages && messages.length > 0 && (
            <div
              style={{
                padding: "10px",
                textAlign: "center",
                color: "#999",
                fontSize: "12px",
              }}
            >
              더 이상 메시지가 없습니다.
            </div>
          )}

          {/* 메시지 시작 지점 참조 */}
          <div ref={messagesStartRef} />

          {messages.map((msg: Message) => {
            const isOwn = msg.sender?.id === currentUserId;

            return (
              <MessageItem
                key={msg.id}
                isOwn={isOwn}
                onDoubleClick={() => handleReplyMessage(msg)}
                ref={(el) => {
                  if (el) {
                    moveReplyMessageRef.current[msg.id!] = el;
                  }
                }}
                onPointerEnter={(e) => {
                  if (e.pointerType === "mouse") {
                    setActiveMessageId(msg.id!);
                  }
                }}
                onPointerLeave={(e) => {
                  if (e.pointerType === "mouse") {
                    setActiveMessageId(null);
                  }
                }}
                onPointerDown={(e) => {
                  if (e.pointerType === "touch") {
                    swipeStartX.current = e.clientX;
                  }
                }}
                onPointerMove={(e) => {
                  if (e.pointerType !== "touch") return;

                  const deltaX = swipeStartX.current - e.clientX;

                  if (deltaX > 30) {
                    setActiveMessageId(msg.id!);
                  }
                }}
                onPointerUp={() => {
                  setActiveMessageId(null);
                }}
                onPointerCancel={() => {
                  setActiveMessageId(null);
                }}
              >
                {/* 송신자가 아닌 경우 발신자 이름 표시 */}
                {!isOwn && (
                  <MessageHeader>
                    <SenderName>{msg.sender?.username}</SenderName>
                  </MessageHeader>
                )}

                {/* 메시지 내용 렌더링 (코드 블록 포함) */}
                {/** 메시지 답장 내용이 있는 경우 */}
                {msg.replyTarget ? (
                  <ReplyMessageLayout
                    isOwn={isOwn}
                    onClick={() => scrollToMessage(msg.replyTarget!.id!)}
                  >
                    <p className="reply-user">
                      {msg.replyTarget.sender?.username}님에게 답장
                    </p>
                    <p className="reply-content">{msg.replyTarget.content}</p>
                    <p className="send-content">{msg.content}</p>
                  </ReplyMessageLayout>
                ) : (
                  /** 메시지 답장 내용이 없는 경우 */
                  msg.content &&
                  msg.content.trim() &&
                  renderMessageContent(msg.content, isOwn)
                )}

                {/* 파일 첨부 렌더링 */}
                {msg.files &&
                  msg.files.length > 0 &&
                  msg.files.map((file) => {
                    if (file.mimetype.includes("image")) {
                      return (
                        <ImageBubbleBox isOwn={isOwn}>
                          <FiDownload
                            size={20}
                            color="rgb(153, 153, 153)"
                            onClick={() => handleFileDownload(file)}
                          />
                          <img
                            src={`${import.meta.env.VITE_API_BASE_URL}/files/${file.id}`}
                            onClick={() => {
                              if (file.mimetype.includes("image")) {
                                setIsImgOpen(!isImgOpen);
                                setIsImgUrl(file.id);
                              }
                            }}
                          />
                        </ImageBubbleBox>
                      );
                    } else {
                      return (
                        <FileAttachment
                          key={file.id}
                          file={{
                            id: file.id,
                            originalName: file.originalName,
                            filename: file.filename,
                            size: parseInt(file.size),
                            mimetype: file.mimetype,
                            url: file.url,
                          }}
                          isOwn={isOwn}
                          onDownload={handleFileDownload}
                        />
                      );
                    }
                  })}

                {/* 송신자 메시지: 상태 표시 */}
                {isOwn && (
                  <MessageStatus
                    status={
                      isReadByOther(msg, currentUserId!) ? "read" : "sent"
                    }
                    // timestamp={formatTimestamp(msg.createdAt || "")}
                  />
                )}

                {activeMessageId === msg.id && (
                  <Timestamp isOwn={isOwn}>
                    {formatTimestamp(msg.createdAt || "")}
                  </Timestamp>
                )}
              </MessageItem>
            );
          })}

          {/* 자동 스크롤을 위한 참조 요소 */}
          <div ref={messagesEndRef} />
        </>
      </MessagesContainer>

      {/** 메세지에 대해서 답장할 때 */}
      {replyTarget && (
        <ReplyChatContainer>
          <ReplayBox>
            <p className="title-reply">
              {replyTarget.senderName} 님에게 답장하기
            </p>
            <p className="content-reply">{replyTarget.content}</p>
          </ReplayBox>
          <IoIosClose size={30} onClick={() => setReplyTarget(null)} />
        </ReplyChatContainer>
      )}
      {/* 메시지 입력 컴포넌트 */}
      <MessageInput
        chatId={chatId}
        replyTargetId={replyTarget?.messageId}
        setReplyTarget={setReplyTarget}
        keyboardOffset={keyboardOffset}
        onInputFocus={handleInputFocus}
        onInputBlur={handleInputBlur}
      />

      {/** 이미지 크게 보기 위한 모달 */}
      {isImgOpen && (
        <ImageOpenLayout
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              setIsImgOpen(false);
            }
          }}
        >
          <TransformWrapper
            doubleClick={{ mode: "toggle" }}
            wheel={{ disabled: true }}
            pinch={{ disabled: true }}
            maxScale={3}
            minScale={1}
            panning={{ velocityDisabled: true }}
          >
            <TransformComponent>
              <img
                src={`${import.meta.env.VITE_API_BASE_URL}/files/${isImgUrl}`}
                onClick={(e) => e.stopPropagation()}
              />
            </TransformComponent>
          </TransformWrapper>
        </ImageOpenLayout>
      )}
    </ChatWindowContainer>
  );
};

export default ChatWindow;
