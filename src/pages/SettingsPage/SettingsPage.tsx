import React from "react";
import styled from "styled-components";
import useAuthToken from "@/lib/hooks/useAuthToken";

const SettingsContainer = styled.div`
  padding: 16px;
  background-color: #36393f;
  color: #fff;
  min-height: calc(100vh - 60px); /* 하단 탭바 높이 고려 */
  box-sizing: border-box;

  @media (max-width: 768px) {
    padding: 12px;
  }
`;

const SectionTitle = styled.h2`
  font-size: 1.2em;
  margin-bottom: 8px;
  border-bottom: 1px solid #40444b;
  padding-bottom: 4px;
`;

const SettingList = styled.ul`
  list-style: none;
  padding: 0;
  margin: 0;
`;

const SettingItem = styled.li`
  padding: 12px 8px;
  border-bottom: 1px solid #40444b;
  display: flex;
  align-items: center;
  cursor: pointer;
  transition: background-color 0.2s;

  &:hover {
    background-color: #40444b;
  }
`;

const SettingItemText = styled.span`
  flex: 1;
  font-size: 1em;
`;

const SettingsPage: React.FC = () => {
  const { customLogout } = useAuthToken();

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
