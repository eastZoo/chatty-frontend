import React from "react";
import {
  HeaderContainer,
  LeftContainer,
  RightContainer,
  MenuButton,
} from "./MobileHeader.styles";
import { FiMenu } from "react-icons/fi";
import { useRecoilValue } from "recoil";
import { selectedChatState } from "@/store/atoms";

interface MobileHeaderProps {
  onHamburgerClick: () => void;
  isSidebarOpen: boolean;
}

const MobileHeader: React.FC<MobileHeaderProps> = ({
  onHamburgerClick,
  isSidebarOpen,
}) => {
  const selectedChat = useRecoilValue(selectedChatState);

  return (
    <HeaderContainer>
      {/* 좌측 영역: 항상 35px 고정 */}
      <LeftContainer>
        {!isSidebarOpen && (
          <MenuButton onClick={onHamburgerClick}>
            <FiMenu size={28} />
          </MenuButton>
        )}
      </LeftContainer>
      {/* 중앙 영역: 선택된 채팅방의 제목을 중앙 정렬 */}
      <div
        style={{
          flex: 1,
          textAlign: "center",
          fontSize: "1.2em",
          fontWeight: "bold",
        }}
      >
        {selectedChat ? selectedChat.title : "Chat"}
      </div>
      {/* 우측 영역: 고정 35px (빈 영역으로 유지) */}
      <RightContainer />
    </HeaderContainer>
  );
};

export default MobileHeader;
