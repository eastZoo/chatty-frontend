import React from "react";
import styled, { keyframes } from "styled-components";
import { FiMessageSquare, FiX } from "react-icons/fi";
import { useNavigate } from "react-router-dom";

const slideUp = keyframes`
  from { transform: translateY(100%); }
  to { transform: translateY(0); }
`;

const ModalOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  z-index: 1200;
`;

const ModalContainer = styled.div`
  position: fixed;
  left: 0;
  right: 0;
  bottom: 0;
  background: #2f3136;
  border-top-left-radius: 16px;
  border-top-right-radius: 16px;
  padding: 16px;
  z-index: 1300;
  animation: ${slideUp} 0.3s ease-out;
`;

const ModalHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
`;

const HeaderTitle = styled.div`
  font-size: 1.2em;
  font-weight: bold;
  color: #fff;
`;

const CloseButton = styled.button`
  background: none;
  border: none;
  color: #fff;
  font-size: 1.5em;
  cursor: pointer;
`;

const ModalContent = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
`;

const FriendAvatar = styled.div`
  width: 80px;
  height: 80px;
  background-color: #7289da;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 2em;
  font-weight: bold;
  color: #fff;
  margin-bottom: 12px;
`;

const FriendName = styled.div`
  font-size: 1.1em;
  font-weight: bold;
  color: #fff;
  margin-bottom: 16px;
`;

const ChatButton = styled.button`
  background-color: #43b581;
  border: none;
  color: #fff;
  padding: 10px 16px;
  border-radius: 8px;
  font-size: 1em;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 8px;
  transition: background-color 0.2s;

  &:hover {
    background-color: #3aa67c;
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

  return (
    <>
      <ModalOverlay onClick={onClose} />
      <ModalContainer>
        <ModalHeader>
          <HeaderTitle>{friend.username}</HeaderTitle>
          <CloseButton onClick={onClose}>
            <FiX />
          </CloseButton>
        </ModalHeader>
        <ModalContent>
          <FriendAvatar>{friend.username.charAt(0).toUpperCase()}</FriendAvatar>
          <FriendName>{friend.username}</FriendName>
          <ChatButton onClick={handleChat}>
            <FiMessageSquare size={20} /> 대화 시작
          </ChatButton>
        </ModalContent>
      </ModalContainer>
    </>
  );
};

export default FriendProfileModal;
