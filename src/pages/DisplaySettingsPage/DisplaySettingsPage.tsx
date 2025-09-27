import React from "react";
import styled from "styled-components";
import { useRecoilState } from "recoil";
import { darkModeState } from "@/store/theme";

const DisplaySettingsContainer = styled.div`
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
  justify-content: space-between;
  min-height: 56px;

  &:last-child {
    border-bottom: none;
  }
`;

const SettingItemContent = styled.div`
  display: flex;
  flex-direction: column;
  flex: 1;
`;

const SettingItemTitle = styled.span`
  font-size: 16px;
  font-weight: 500;
  color: ${({ theme }) => theme.colors.text};
  margin-bottom: 2px;
`;

const SettingItemDescription = styled.span`
  font-size: 14px;
  color: ${({ theme }) => theme.colors.textSecondary};
`;

const ToggleSwitch = styled.div<{ isActive: boolean }>`
  position: relative;
  width: 50px;
  height: 30px;
  background: ${({ theme, isActive }) =>
    isActive ? theme.colors.primary : theme.colors.border};
  border-radius: 15px;
  cursor: pointer;
  transition: all 0.3s ease;
  flex-shrink: 0;

  &::before {
    content: "";
    position: absolute;
    top: 3px;
    left: ${({ isActive }) => (isActive ? "23px" : "3px")};
    width: 24px;
    height: 24px;
    background: #ffffff;
    border-radius: 50%;
    transition: all 0.3s ease;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
  }

  &:active {
    transform: scale(0.95);
  }
`;

const DisplaySettingsPage: React.FC = () => {
  const [isDarkMode, setIsDarkMode] = useRecoilState(darkModeState);

  const toggleDarkMode = () => {
    const newValue = !isDarkMode;
    setIsDarkMode(newValue);

    // localStorage에 저장
    if (typeof window !== "undefined") {
      try {
        localStorage.setItem("darkMode", JSON.stringify(newValue));
      } catch (error) {
        console.warn("Failed to save darkMode to localStorage:", error);
      }
    }
  };

  return (
    <DisplaySettingsContainer>
      <SectionTitle>화면 설정</SectionTitle>
      <SettingList>
        <SettingItem>
          <SettingItemContent>
            <SettingItemTitle>다크 모드</SettingItemTitle>
            <SettingItemDescription>
              어두운 테마로 화면을 표시합니다
            </SettingItemDescription>
          </SettingItemContent>
          <ToggleSwitch isActive={isDarkMode} onClick={toggleDarkMode} />
        </SettingItem>
      </SettingList>

      <SectionTitle>추가 설정</SectionTitle>
      <SettingList>
        <SettingItem>
          <SettingItemContent>
            <SettingItemTitle>폰트 크기</SettingItemTitle>
            <SettingItemDescription>
              텍스트 크기를 조정합니다 (준비 중)
            </SettingItemDescription>
          </SettingItemContent>
        </SettingItem>
        <SettingItem>
          <SettingItemContent>
            <SettingItemTitle>애니메이션</SettingItemTitle>
            <SettingItemDescription>
              앱 내 애니메이션을 제어합니다 (준비 중)
            </SettingItemDescription>
          </SettingItemContent>
        </SettingItem>
      </SettingList>
    </DisplaySettingsContainer>
  );
};

export default DisplaySettingsPage;
