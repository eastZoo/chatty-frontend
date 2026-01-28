import React, { useState } from "react";
import styled from "styled-components";
import { useNavigate } from "react-router-dom";
import { useRecoilValue } from "recoil";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-toastify";
import useAuthToken from "@/lib/hooks/useAuthToken";
import { adminInfoSelector } from "@/store/adminInfo";
import {
  getChatAutoDelete,
  setChatAutoDelete,
  CHAT_AUTO_DELETE_OPTIONS,
} from "@/lib/api/settings";

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

const SettingAlramsToggle = styled.div`
  width: 100%;
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;

  .setting-text {
    text-align: end;
  }
`;

const SettingItemText = styled.span`
  flex: 1;
  font-size: 16px;
  font-weight: 500;
  color: ${({ theme }) => theme.colors.text};
`;

const SettingRow = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 20px;
  border-bottom: 1px solid ${({ theme }) => theme.colors.border};
  gap: 12px;

  &:last-child {
    border-bottom: none;
  }
`;

const SettingLabel = styled.span`
  font-size: 16px;
  font-weight: 500;
  color: ${({ theme }) => theme.colors.text};
`;

const Select = styled.select`
  padding: 8px 12px;
  border-radius: ${({ theme }) => theme.radius.md};
  border: 1px solid ${({ theme }) => theme.colors.border};
  background: ${({ theme }) => theme.colors.bg};
  color: ${({ theme }) => theme.colors.text};
  font-size: 14px;
  min-width: 120px;
  cursor: pointer;
`;

const SettingsPage: React.FC = () => {
  const [alarmSetting, setAlarmSetting] = useState<boolean>(false);
  const { customLogout } = useAuthToken();
  const navigate = useNavigate();
  const user = useRecoilValue(adminInfoSelector);
  const queryClient = useQueryClient();
  const isAdmin = user?.type === "ADMIN";

  const { data: chatAutoDeleteData } = useQuery({
    queryKey: ["settings", "chat-auto-delete"],
    queryFn: getChatAutoDelete,
    enabled: isAdmin,
  });

  const setChatAutoDeleteMutation = useMutation({
    mutationFn: setChatAutoDelete,
    onSuccess: (res) => {
      if (res.success && res.data) {
        queryClient.setQueryData(["settings", "chat-auto-delete"], res);
        toast.success("채팅 자동 삭제 주기가 적용되었습니다.");
      }
    },
    onError: (err: any) => {
      toast.error(err?.message || "설정 저장에 실패했습니다.");
    },
  });

  const handleAlarmSetting = () => {
    setAlarmSetting(!alarmSetting);

    if (localStorage.getItem("alarm_sounds") === "true") {
      localStorage.setItem("alarm_sounds", "false");
    } else {
      localStorage.setItem("alarm_sounds", "true");
    }
  };

  const currentMinutes = chatAutoDeleteData?.data?.minutes ?? 0;

  return (
    <SettingsContainer>
      {isAdmin && (
        <>
          <SectionTitle>관리자 설정</SectionTitle>
          <SettingList>
            <SettingRow>
              <SettingLabel>채팅 자동 삭제 주기</SettingLabel>
              <Select
                value={currentMinutes}
                onChange={(e) => {
                  const minutes = Number(e.target.value);
                  setChatAutoDeleteMutation.mutate(minutes);
                }}
                disabled={setChatAutoDeleteMutation.isPending}
              >
                {CHAT_AUTO_DELETE_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </Select>
            </SettingRow>
          </SettingList>
        </>
      )}
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
        <SettingItem onClick={() => handleAlarmSetting()}>
          <SettingAlramsToggle>
            <SettingItemText>알림 설정</SettingItemText>
            <SettingItemText className="setting-text">
              {alarmSetting ? "끄기" : "켜기"}
            </SettingItemText>
          </SettingAlramsToggle>
        </SettingItem>
      </SettingList>
      {/* 추후 다른 카테고리 추가 가능 */}
    </SettingsContainer>
  );
};

export default SettingsPage;
