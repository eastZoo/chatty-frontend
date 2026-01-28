import React, { useState } from "react";
import styled from "styled-components";
import { useLocation } from "react-router-dom";
import { FiPlus } from "react-icons/fi";
import FriendAddModal from "@/components/FriendAddModal/FriendAddModal";
import { useRecoilValue } from "recoil";
import { adminInfoSelector } from "@/store/adminInfo";

const HeaderContainer = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  height: 60px;
  background: ${({ theme }) => theme.colors.bgSecondary};
  border-bottom: 1px solid ${({ theme }) => theme.colors.border};
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 20px;
  box-sizing: border-box;
  z-index: 1000;
  /* iOS 안전 영역 대응 */
  padding-top: max(0px, env(safe-area-inset-top));
  box-shadow: ${({ theme }) => theme.shadows.sm};
`;

const Title = styled.div`
  font-size: 18px;
  font-weight: 600;
  color: ${({ theme }) => theme.colors.text};
  letter-spacing: -0.02em;
`;

const IconButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  background: ${({ theme }) => theme.colors.bgTertiary};
  border-radius: ${({ theme }) => theme.radius.md};
  color: ${({ theme }) => theme.colors.text};
  cursor: pointer;
  transition: all 0.2s ease;

  &:active {
    background: ${({ theme }) => theme.colors.border};
    transform: scale(0.95);
  }

  &:hover {
    background: ${({ theme }) => theme.colors.border};
  }
`;

const GlobalHeader: React.FC = () => {
  const location = useLocation();
  const adminInfo = useRecoilValue(adminInfoSelector);
  const [isModalOpen, setModalOpen] = useState(false);

  // 현재 라우트를 기반으로 탭 이름 결정 (예시)
  let currentTab = "홈";
  if (location.pathname.startsWith("/chat/private")) {
    currentTab = "대화";
  } else if (location.pathname.startsWith("/settings")) {
    currentTab = "설정";
  }

  return (
    <>
      <HeaderContainer>
        <Title>{currentTab}</Title>
        <IconButton onClick={() => setModalOpen(true)}>
          <FiPlus size={20} />
        </IconButton>
      </HeaderContainer>
      {isModalOpen && (
        <FriendAddModal
          onClose={() => setModalOpen(false)}
          adminId={adminInfo?.id}
        />
      )}
    </>
  );
};

export default GlobalHeader;
