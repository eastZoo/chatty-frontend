// src/components/FriendAddModal/FriendAddModal.tsx
import React, { useState } from "react";
import styled from "styled-components";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { sendFriendRequest } from "../../api/friends";
import { toast } from "react-toastify";
import { FiCopy } from "react-icons/fi";

const ModalOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.6);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1100;
`;

const ModalContent = styled.div`
  background: #2f3136;
  padding: 24px;
  border-radius: 8px;
  width: 90%;
  max-width: 400px;
  color: #fff;
  box-sizing: border-box;
  text-align: center;
`;

const ModalHeader = styled.div`
  font-size: 1.4em;
  margin-bottom: 16px;
  font-weight: bold;
`;

const ProfileContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 16px;
`;

const MyUUIDText = styled.span`
  font-size: 0.9em;
  color: #b9bbbe;
`;

const CopyButton = styled.button`
  background: none;
  border: none;
  margin-left: 8px;
  cursor: pointer;
  color: #7289da;
  display: flex;
  align-items: center;
  justify-content: center;

  &:hover {
    color: #5b6eae;
  }
`;

const InputField = styled.input`
  width: 100%;
  padding: 10px;
  margin-bottom: 16px;
  border-radius: 4px;
  border: none;
  background: #40444b;
  color: #fff;
  box-sizing: border-box;
`;

const ModalButton = styled.button`
  width: 100%;
  padding: 12px;
  background: #43b581;
  border: none;
  border-radius: 4px;
  color: #fff;
  font-size: 1em;
  cursor: pointer;
  transition: background-color 0.2s;

  &:hover {
    background: #3aa67c;
  }
`;

interface FriendAddModalProps {
  onClose: () => void;
  adminId?: string;
}

const FriendAddModal: React.FC<FriendAddModalProps> = ({
  onClose,
  adminId,
}) => {
  const queryClient = useQueryClient();
  const [friendUuid, setFriendUuid] = useState("");

  const mutation = useMutation({
    mutationFn: (receiverId: string) => sendFriendRequest(receiverId),
    onSuccess: () => {
      toast.success("친구 요청을 보냈습니다.");
      queryClient.invalidateQueries({ queryKey: ["friendRequests"] });
      onClose();
    },
    onError: () => {
      toast.error("친구 요청에 실패했습니다.");
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!friendUuid.trim()) {
      toast.error("유효한 사용자 UUID를 입력하세요.");
      return;
    }
    mutation.mutate(friendUuid.trim());
  };

  const handleCopyUUID = () => {
    if (adminId) {
      navigator.clipboard
        .writeText(adminId)
        .then(() => {
          toast.success("UUID가 복사되었습니다.");
        })
        .catch(() => {
          toast.error("복사에 실패했습니다.");
        });
    }
  };

  return (
    <ModalOverlay onClick={onClose}>
      <ModalContent onClick={(e) => e.stopPropagation()}>
        <ModalHeader>친구 추가</ModalHeader>
        <ProfileContainer>
          <MyUUIDText>내 UUID: {adminId}</MyUUIDText>
          <CopyButton onClick={handleCopyUUID} title="UUID 복사">
            <FiCopy size={18} />
          </CopyButton>
        </ProfileContainer>
        <form onSubmit={handleSubmit}>
          <InputField
            type="text"
            placeholder="친구의 UUID 입력"
            value={friendUuid}
            onChange={(e) => setFriendUuid(e.target.value)}
          />
          <ModalButton type="submit">요청 보내기</ModalButton>
        </form>
      </ModalContent>
    </ModalOverlay>
  );
};

export default FriendAddModal;
