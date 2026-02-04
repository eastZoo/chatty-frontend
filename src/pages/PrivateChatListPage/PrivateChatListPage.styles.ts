import styled from "styled-components";

export const ChatListContainer = styled.div`
  padding: 20px;
  background: ${({ theme }) => theme.colors.bg};
  color: ${({ theme }) => theme.colors.text};
  min-height: 100%;
  box-sizing: border-box;
  overflow-y: auto;
  -webkit-overflow-scrolling: touch;

  @media (max-width: 768px) {
    padding: 16px;
  }
`;

export const ChatItem = styled.div`
  display: flex;
  align-items: center;
  padding: 16px;
  background: ${({ theme }) => theme.colors.bgSecondary};
  border-radius: ${({ theme }) => theme.radius.lg};
  margin-bottom: 12px;
  cursor: pointer;
  transition: all 0.2s ease;
  border: 1px solid ${({ theme }) => theme.colors.border};
  box-shadow: ${({ theme }) => theme.shadows.sm};

  &:hover {
    background: ${({ theme }) => theme.colors.bgTertiary};
    transform: translateY(-2px);
    box-shadow: ${({ theme }) => theme.shadows.md};
  }

  &:active {
    transform: translateY(-1px);
  }
`;

export const ChatItemAvatar = styled.div`
  width: 56px;
  height: 56px;
  background: ${({ theme }) => theme.colors.primary};
  border-radius: ${({ theme }) => theme.radius.full};
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 20px;
  font-weight: 600;
  color: #ffffff;
  margin-right: 16px;
  flex-shrink: 0;
  box-shadow: ${({ theme }) => theme.shadows.md};
`;

export const ChatItemContent = styled.div`
  display: flex;
  flex-direction: column;
  flex: 1;
  min-width: 0;
`;

export const ChatItemName = styled.div`
  font-size: 16px;
  font-weight: 600;
  margin-bottom: 4px;
  color: ${({ theme }) => theme.colors.text};
`;

export const ChatItemLastMessage = styled.div`
  font-size: 14px;
  color: ${({ theme }) => theme.colors.textSecondary};
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 100%;
  line-height: 1.4;
`;

export const ChatRightContentBox = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-end;

  height: 100%;

  p {
    margin-bottom: auto;
    font-size: 12px;
    color: #86868b;
  }
`;
