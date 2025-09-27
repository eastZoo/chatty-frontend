import React from "react";
import {
  SidebarContainer,
  BadgeList,
  Badge,
  PlusBadge,
  Divider,
} from "./MobileChatSidebar.styles";
import { type Chat } from "@/lib/api/chat"; // Chat 인터페이스 사용
import { useRecoilState } from "recoil";
import { selectedChatState } from "@/store/atoms";

interface MobileChatSidebarProps {
  isOpen: boolean;
  chats: Chat[];
  onNewChat: () => void;
}

const MobileChatSidebar: React.FC<MobileChatSidebarProps> = ({
  isOpen,
  chats,
  onNewChat,
}) => {
  const [selectedChat, setSelectedChat] = useRecoilState(selectedChatState);

  return (
    <SidebarContainer isOpen={isOpen}>
      <PlusBadge onClick={onNewChat}>+</PlusBadge>
      {/* Divider 추가 */}
      <Divider />
      <BadgeList>
        {chats.map((chat) => (
          <Badge
            key={chat.id}
            selected={selectedChat?.id === chat.id}
            onClick={() => setSelectedChat(chat)}
          >
            {chat.title.charAt(0).toUpperCase()}
          </Badge>
        ))}
      </BadgeList>
    </SidebarContainer>
  );
};

export default MobileChatSidebar;
