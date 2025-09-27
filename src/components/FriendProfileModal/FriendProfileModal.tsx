import React from "react";
import styled, { keyframes } from "styled-components";
import { FiMessageSquare, FiX, FiUser } from "react-icons/fi";
import { useNavigate } from "react-router-dom";

const slideUp = keyframes`
  from { 
    transform: translateY(100%); 
    opacity: 0;
  }
  to { 
    transform: translateY(0); 
    opacity: 1;
  }
`;

const fadeIn = keyframes`
  from { opacity: 0; }
  to { opacity: 1; }
`;

const ModalOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.6);
  backdrop-filter: blur(4px);
  z-index: 1200;
  animation: ${fadeIn} 0.3s ease-out;
`;

const ModalContainer = styled.div`
  position: fixed;
  left: 0;
  right: 0;
  bottom: 0;
  background: ${({ theme }) => theme.colors.bgSecondary};
  border-top-left-radius: ${({ theme }) => theme.radius.xl};
  border-top-right-radius: ${({ theme }) => theme.radius.xl};
  padding: 24px 20px;
  padding-bottom: max(24px, env(safe-area-inset-bottom));
  z-index: 1300;
  animation: ${slideUp} 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94);
  box-shadow: ${({ theme }) => theme.shadows.lg};
  border-top: 1px solid ${({ theme }) => theme.colors.border};
`;

const ModalHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
  padding-bottom: 16px;
  border-bottom: 1px solid ${({ theme }) => theme.colors.border};
`;

const HeaderTitle = styled.div`
  font-size: 18px;
  font-weight: 600;
  color: ${({ theme }) => theme.colors.text};
`;

const CloseButton = styled.button`
  background: ${({ theme }) => theme.colors.bgTertiary};
  border: none;
  color: ${({ theme }) => theme.colors.text};
  width: 36px;
  height: 36px;
  border-radius: ${({ theme }) => theme.radius.md};
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s ease;
  font-size: 18px;

  &:hover {
    background: ${({ theme }) => theme.colors.border};
    transform: scale(1.05);
  }

  &:active {
    transform: scale(0.95);
  }
`;

const ModalContent = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
`;

const FriendAvatar = styled.div`
  width: 100px;
  height: 100px;
  background: linear-gradient(
    135deg,
    ${({ theme }) => theme.colors.primary},
    ${({ theme }) => theme.colors.secondary}
  );
  border-radius: ${({ theme }) => theme.radius.full};
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 36px;
  font-weight: 600;
  color: #ffffff;
  margin-bottom: 20px;
  box-shadow: ${({ theme }) => theme.shadows.md};
  position: relative;
  overflow: hidden;

  &::before {
    content: "";
    position: absolute;
    top: -50%;
    left: -50%;
    width: 200%;
    height: 200%;
    background: linear-gradient(
      45deg,
      transparent,
      rgba(255, 255, 255, 0.1),
      transparent
    );
    transform: rotate(45deg);
    transition: all 0.6s;
  }

  &:hover::before {
    animation: shimmer 1.5s ease-in-out;
  }

  @keyframes shimmer {
    0% {
      transform: translateX(-100%) translateY(-100%) rotate(45deg);
    }
    100% {
      transform: translateX(100%) translateY(100%) rotate(45deg);
    }
  }
`;

const FriendName = styled.div`
  font-size: 20px;
  font-weight: 600;
  color: ${({ theme }) => theme.colors.text};
  margin-bottom: 8px;
`;

const FriendStatus = styled.div`
  font-size: 14px;
  color: ${({ theme }) => theme.colors.textSecondary};
  margin-bottom: 32px;
  padding: 6px 12px;
  background: ${({ theme }) => theme.colors.bgTertiary};
  border-radius: ${({ theme }) => theme.radius.md};
  border: 1px solid ${({ theme }) => theme.colors.border};
`;

const ActionButtons = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
  width: 100%;
  max-width: 280px;
`;

const ChatButton = styled.button`
  background: ${({ theme }) => theme.colors.primary};
  border: none;
  color: #ffffff;
  padding: 16px 24px;
  border-radius: ${({ theme }) => theme.radius.lg};
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  transition: all 0.2s ease;
  box-shadow: ${({ theme }) => theme.shadows.sm};

  &:hover {
    background: ${({ theme }) => theme.colors.secondary};
    transform: translateY(-2px);
    box-shadow: ${({ theme }) => theme.shadows.md};
  }

  &:active {
    transform: translateY(0);
    box-shadow: ${({ theme }) => theme.shadows.sm};
  }
`;

const InfoButton = styled.button`
  background: ${({ theme }) => theme.colors.bgTertiary};
  border: 1px solid ${({ theme }) => theme.colors.border};
  color: ${({ theme }) => theme.colors.text};
  padding: 12px 24px;
  border-radius: ${({ theme }) => theme.radius.lg};
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  transition: all 0.2s ease;

  &:hover {
    background: ${({ theme }) => theme.colors.border};
    transform: translateY(-1px);
  }

  &:active {
    transform: translateY(0);
  }
`;

interface Friend {
  id: string;
  username: string;
}

interface FriendProfileModalProps {
  friend: Friend;
  onClose: () => void;
}

const FriendProfileModal: React.FC<FriendProfileModalProps> = ({
  friend,
  onClose,
}) => {
  const navigate = useNavigate();

  const handleChat = () => {
    onClose();
    navigate(`/chat/private/${friend.id}`);
  };

  const handleProfileInfo = () => {
    // 추후 프로필 정보 페이지로 이동할 수 있도록 준비
    console.log("프로필 정보 보기:", friend.username);
  };

  return (
    <>
      <ModalOverlay onClick={onClose} />
      <ModalContainer>
        <ModalHeader>
          <HeaderTitle>친구 프로필</HeaderTitle>
          <CloseButton onClick={onClose}>
            <FiX />
          </CloseButton>
        </ModalHeader>
        <ModalContent>
          <FriendAvatar>{friend.username.charAt(0).toUpperCase()}</FriendAvatar>
          <FriendName>{friend.username}</FriendName>
          <FriendStatus>온라인</FriendStatus>

          <ActionButtons>
            <ChatButton onClick={handleChat}>
              <FiMessageSquare size={20} />
              대화 시작
            </ChatButton>
            <InfoButton onClick={handleProfileInfo}>
              <FiUser size={16} />
              프로필 정보
            </InfoButton>
          </ActionButtons>
        </ModalContent>
      </ModalContainer>
    </>
  );
};

export default FriendProfileModal;
