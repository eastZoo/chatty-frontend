import React, { useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { getPrivateChat, type Chat } from "@/lib/api/chat";
import ChatWindow from "@/components/ChatWindow/ChatWindow";
import { useRecoilState } from "recoil";
import { selectedChatState } from "@/store/atoms";
import { ChatPageContainer } from "../ChatPage/ChatPage.styles";

const PrivateChatPage: React.FC = () => {
  const { friendId } = useParams<{ friendId: string }>();
  const navigate = useNavigate();
  const [, setSelectedChat] = useRecoilState(selectedChatState);

  const { data, isLoading, isError, refetch } = useQuery<Chat>({
    queryKey: ["privateChat", friendId],
    queryFn: async () => {
      const targetFriendId = friendId ?? "";
      const res = await getPrivateChat(targetFriendId);
      return res;
    },
    enabled: !!friendId,
    staleTime: 0,
  });

  useEffect(() => {
    if (data) {
      setSelectedChat(data);
    }
  }, [data, setSelectedChat]);

  useEffect(() => {
    return () => {
      setSelectedChat(null);
    };
  }, [setSelectedChat]);

  if (isLoading && !data) {
    return (
      <ChatPageContainer>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100%", padding: 24 }}>
          로딩중...
        </div>
      </ChatPageContainer>
    );
  }

  if (isError) {
    return (
      <ChatPageContainer>
        <div style={{ padding: 24, textAlign: "center" }}>
          <p>채팅방을 불러올 수 없습니다.</p>
          <button type="button" onClick={() => refetch()}>다시 시도</button>
          <button type="button" onClick={() => navigate("/chat")}>목록으로</button>
        </div>
      </ChatPageContainer>
    );
  }

  if (!data) return null;

  return (
    <ChatPageContainer>
      <ChatWindow />
    </ChatPageContainer>
  );
};

export default PrivateChatPage;
