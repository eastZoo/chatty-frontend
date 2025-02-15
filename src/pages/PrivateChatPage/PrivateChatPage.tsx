import React, { useState, useMemo } from "react";
import { useParams } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { getPrivateChat, getPrivateChatList } from "../../api/chat";
import ChatWindow from "@/components/ChatWindow/ChatWindow";
import { useRecoilState } from "recoil";
import { selectedChatState } from "@/state/atoms";
import { ChatPageContainer } from "../ChatPage/ChatPage.styles";

const PrivateChatPage: React.FC = () => {
  const queryClient = useQueryClient();
  const { friendId } = useParams<{ friendId: string }>();
  const [selectedChat, setSelectedChat] = useRecoilState(selectedChatState);

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
