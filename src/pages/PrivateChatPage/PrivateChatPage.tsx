import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { getPrivateChat, type Chat } from "@/lib/api/chat";
import ChatWindow from "@/components/ChatWindow/ChatWindow";
import { useRecoilState, useRecoilValue } from "recoil";
import { selectedChatState } from "@/store/atoms";
import { ChatPageContainer } from "../ChatPage/ChatPage.styles";
import {
  HeaderContainer,
  IconButton,
  Title,
} from "@/components/GlobalHeader/GlobalHeader";
import { IoIosArrowBack } from "react-icons/io";
import { FiPlus } from "react-icons/fi";
import FriendAddModal from "@/components/FriendAddModal/FriendAddModal";
import { adminInfoSelector } from "@/store/adminInfo";

const PrivateChatPage: React.FC = () => {
  const { friendId } = useParams<{ friendId: string }>();
  const navigate = useNavigate();
  const [, setSelectedChat] = useRecoilState(selectedChatState);
  const adminInfo = useRecoilValue(adminInfoSelector);

  const [isModalOpen, setModalOpen] = useState(false);

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
      // selectedChat을 동기적으로 설정하여 ChatWindow가 올바른 데이터로 초기화되도록 보장
      setSelectedChat({
        ...data,
        type: data.type || "private", // type이 없으면 기본값 설정
      });
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
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            height: "100%",
            padding: 24,
          }}
        >
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
          <button type="button" onClick={() => refetch()}>
            다시 시도
          </button>
          <button type="button" onClick={() => navigate("/chat")}>
            목록으로
          </button>
        </div>
      </ChatPageContainer>
    );
  }

  // data가 없거나 selectedChat이 설정되지 않았으면 ChatWindow를 렌더링하지 않음
  if (!data) return null;

  return (
    <ChatPageContainer>
      <HeaderContainer>
        <IconButton onClick={() => navigate(-1)}>
          <IoIosArrowBack size={20} />
        </IconButton>
        <Title>{data.friendName}</Title>
        <IconButton onClick={() => setModalOpen(true)}>
          <FiPlus size={20} />
        </IconButton>
      </HeaderContainer>
      <ChatWindow />
      {isModalOpen && (
        <FriendAddModal
          onClose={() => setModalOpen(false)}
          adminId={adminInfo?.id}
        />
      )}
    </ChatPageContainer>
  );
};

export default PrivateChatPage;
