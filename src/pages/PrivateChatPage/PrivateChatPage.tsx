import React, { useEffect } from "react";
import { useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { getPrivateChat, type Chat } from "@/lib/api/chat";
import ChatWindow from "@/components/ChatWindow/ChatWindow";
import { useRecoilState } from "recoil";
import { selectedChatState } from "@/store/atoms";
import { ChatPageContainer } from "../ChatPage/ChatPage.styles";

const PrivateChatPage: React.FC = () => {
  const { friendId } = useParams<{ friendId: string }>();
  const [, setSelectedChat] = useRecoilState(selectedChatState);

  const { data, isLoading } = useQuery<Chat>({
    queryKey: ["privateChat", friendId],
    queryFn: async () => {
      const targetFriendId = friendId ?? "";
      const data = await getPrivateChat(targetFriendId);
      return data;
    },
    enabled: !!friendId,
  });

  useEffect(() => {
    if (data) {
      console.log("data", data);
      setSelectedChat(data);
    }
  }, [data, setSelectedChat]);

  useEffect(() => {
    return () => {
      setSelectedChat(null);
    };
  }, [setSelectedChat]);

  if (isLoading) return <div>Loading...</div>;

  return (
    <ChatPageContainer>
      <ChatWindow />
    </ChatPageContainer>
  );
};

export default PrivateChatPage;
