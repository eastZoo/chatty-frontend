import styled from "styled-components";

export const FriendsContainer = styled.div`
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

/* 프로필 카드 */
export const ProfileCard = styled.div`
  display: flex;
  align-items: center;
  padding: 20px;
  background: ${({ theme }) => theme.colors.bgSecondary};
  border-radius: ${({ theme }) => theme.radius.lg};
  margin-bottom: 20px;
  box-shadow: ${({ theme }) => theme.shadows.sm};
  border: 1px solid ${({ theme }) => theme.colors.border};
`;

export const ProfileAvatar = styled.div`
  width: 60px;
  height: 60px;
  background: ${({ theme }) => theme.colors.primary};
  border-radius: ${({ theme }) => theme.radius.full};
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24px;
  font-weight: 600;
  color: #ffffff;
  margin-right: 16px;
  box-shadow: ${({ theme }) => theme.shadows.md};
`;

export const ProfileInfo = styled.div`
  display: flex;
  flex-direction: column;
  flex: 1;
`;

export const ProfileName = styled.div`
  font-size: 18px;
  font-weight: 600;
  margin-bottom: 4px;
  color: ${({ theme }) => theme.colors.text};
`;

export const ProfileStatus = styled.div`
  font-size: 14px;
  color: ${({ theme }) => theme.colors.textSecondary};
`;

/* 구분선 */
export const Divider = styled.div`
  height: 1px;
  background: ${({ theme }) => theme.colors.border};
  margin: 20px 0;
`;

export const Section = styled.div`
  margin-bottom: 32px;
`;

export const SectionTitle = styled.h3`
  font-size: 18px;
  font-weight: 600;
  margin-bottom: 16px;
  padding-bottom: 8px;
  border-bottom: 1px solid ${({ theme }) => theme.colors.border};
  color: ${({ theme }) => theme.colors.text};
`;

export const FriendList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
  height: auto;
  overflow-y: auto;
`;

export const FriendItem = styled.div`
  display: flex;
  align-items: center;
  padding: 16px;
  background: ${({ theme }) => theme.colors.bgSecondary};
  border-radius: ${({ theme }) => theme.radius.md};
  border: 1px solid ${({ theme }) => theme.colors.border};
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    background: ${({ theme }) => theme.colors.bgTertiary};
    transform: translateY(-1px);
    box-shadow: ${({ theme }) => theme.shadows.md};
  }

  &:active {
    transform: translateY(0);
  }
`;

export const FriendAvatar = styled.div`
  width: 48px;
  height: 48px;
  background: ${({ theme }) => theme.colors.secondary};
  border-radius: ${({ theme }) => theme.radius.full};
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 18px;
  font-weight: 600;
  color: #ffffff;
  margin-right: 16px;
  flex-shrink: 0;
  box-shadow: ${({ theme }) => theme.shadows.sm};
`;

export const FriendName = styled.div`
  flex: 1;
  font-size: 16px;
  font-weight: 500;
  color: ${({ theme }) => theme.colors.text};
`;

export const ActionButton = styled.button`
  background: ${({ theme }) => theme.colors.primary};
  border: none;
  color: #ffffff;
  padding: 8px 16px;
  border-radius: ${({ theme }) => theme.radius.md};
  cursor: pointer;
  font-size: 14px;
  font-weight: 500;
  margin-left: 8px;
  transition: all 0.2s ease;
  min-height: 32px;

  &:hover {
    background: ${({ theme }) => theme.colors.primary};
    opacity: 0.9;
    transform: translateY(-1px);
  }

  &:active {
    transform: translateY(0);
  }
`;

export const InputContainer = styled.div`
  display: flex;
  align-items: center;
  margin-top: 12px;
  gap: 8px;
`;

export const SearchInput = styled.input`
  flex: 1;
  padding: 12px 16px;
  border-radius: ${({ theme }) => theme.radius.md};
  border: 1px solid ${({ theme }) => theme.colors.border};
  font-size: 16px;
  background: ${({ theme }) => theme.colors.bgSecondary};
  color: ${({ theme }) => theme.colors.text};
  transition: all 0.2s ease;

  &:focus {
    outline: none;
    border-color: ${({ theme }) => theme.colors.primary};
    box-shadow: 0 0 0 3px rgba(0, 122, 255, 0.1);
  }

  &::placeholder {
    color: ${({ theme }) => theme.colors.textSecondary};
  }
`;

export const SearchButton = styled.button`
  background: ${({ theme }) => theme.colors.secondary};
  border: none;
  color: #ffffff;
  padding: 12px 20px;
  border-radius: ${({ theme }) => theme.radius.md};
  cursor: pointer;
  font-size: 16px;
  font-weight: 500;
  transition: all 0.2s ease;
  min-height: 44px;

  &:hover {
    background: ${({ theme }) => theme.colors.secondary};
    opacity: 0.9;
    transform: translateY(-1px);
  }

  &:active {
    transform: translateY(0);
  }
`;
