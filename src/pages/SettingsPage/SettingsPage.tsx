import React from "react";
import styled from "styled-components";
import { useNavigate } from "react-router-dom";
import useAuthToken from "@/lib/hooks/useAuthToken";

const SettingsContainer = styled.div`
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

const SectionTitle = styled.h2`
  font-size: 18px;
  font-weight: 600;
  margin-bottom: 16px;
  padding-bottom: 8px;
  border-bottom: 1px solid ${({ theme }) => theme.colors.border};
  color: ${({ theme }) => theme.colors.text};
`;

const SettingList = styled.ul`
  list-style: none;
  padding: 0;
  margin: 0 0 32px 0;
  background: ${({ theme }) => theme.colors.bgSecondary};
  border-radius: ${({ theme }) => theme.radius.lg};
  border: 1px solid ${({ theme }) => theme.colors.border};
  box-shadow: ${({ theme }) => theme.shadows.sm};
  overflow: hidden;
`;

const SettingItem = styled.li`
  padding: 16px 20px;
  border-bottom: 1px solid ${({ theme }) => theme.colors.border};
  display: flex;
  align-items: center;
  cursor: pointer;
  transition: all 0.2s ease;
  min-height: 56px;

  &:last-child {
    border-bottom: none;
  }

  &:hover {
    background: ${({ theme }) => theme.colors.bgTertiary};
  }

  &:active {
    background: ${({ theme }) => theme.colors.border};
  }
`;

const SettingItemText = styled.span`
  flex: 1;
  font-size: 16px;
  font-weight: 500;
  color: ${({ theme }) => theme.colors.text};
`;

const SettingsPage: React.FC = () => {
  const { customLogout } = useAuthToken();
  const navigate = useNavigate();

  return (
    <SettingsContainer>
      <SectionTitle>계정 설정</SectionTitle>
      <SettingList>
        <SettingItem onClick={() => console.log("프로필 설정 페이지 이동")}>
          <SettingItemText>프로필 설정</SettingItemText>
        </SettingItem>
        <SettingItem onClick={customLogout}>
          <SettingItemText>로그아웃</SettingItemText>
        </SettingItem>
      </SettingList>

      <SectionTitle>화면 설정</SectionTitle>
      <SettingList>
        <SettingItem onClick={() => navigate("/settings/display")}>
          <SettingItemText>화면 설정</SettingItemText>
        </SettingItem>
      </SettingList>

      <SectionTitle>알림</SectionTitle>
      <SettingList>
        <SettingItem onClick={() => console.log("알림 설정 페이지 이동")}>
          <SettingItemText>알림 설정</SettingItemText>
        </SettingItem>
      </SettingList>
      {/* 추후 다른 카테고리 추가 가능 */}
    </SettingsContainer>
  );
};

export default SettingsPage;
