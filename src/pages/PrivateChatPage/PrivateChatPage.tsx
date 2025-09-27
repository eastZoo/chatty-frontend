import React from "react";
import { useParams } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { getPrivateChat } from "@/lib/api/chat";
import ChatWindow from "@/components/ChatWindow/ChatWindow";
import { useRecoilState } from "recoil";
import { selectedChatState } from "@/store/atoms";
import { ChatPageContainer } from "../ChatPage/ChatPage.styles";

const PrivateChatPage: React.FC = () => {
  const { friendId } = useParams<{ friendId: string }>();
  const [, setSelectedChat] = useRecoilState(selectedChatState);

  const { data: privateChat, isLoading } = useQuery({
    queryKey: ["privateChat", friendId],
    queryFn: () =>
      getPrivateChat(friendId || "").then((data) => {
        console.log("data", data);
        setSelectedChat(data);
      }),
    enabled: !!friendId,
  });

  if (isLoading) return <div>Loading...</div>;

  return (
    <ChatPageContainer>
      <ChatWindow />
    </ChatPageContainer>
  );
};

export default PrivateChatPage;
