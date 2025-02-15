import React, { useState } from "react";
import styled from "styled-components";
import { useLocation } from "react-router-dom";
import { FiPlus } from "react-icons/fi";
import FriendAddModal from "@/components/FriendAddModal/FriendAddModal";
import { useRecoilValue } from "recoil";
import { adminInfoSelector } from "@/state/adminInfo";

const HeaderContainer = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  height: 50px;
  background-color: #2f3136;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 16px;
  box-sizing: border-box;
  z-index: 1200;
`;

const Title = styled.div`
  font-size: 1.1em;
  font-weight: bold;
  color: #fff;
`;

const IconButton = styled.button`
  background: none;
  border: none;
  color: #fff;
  cursor: pointer;
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
