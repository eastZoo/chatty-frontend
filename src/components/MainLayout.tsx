import React, { useEffect } from "react";
import { Outlet, useLocation } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";
import { useRecoilValue } from "recoil";
import BottomNavbar from "@/components/BottomNavbar/BottomNavbar";
import GlobalHeader from "@/components/GlobalHeader/GlobalHeader";
import TabNotificationHandler from "@/components/TabNotificationHandler/TabNotificationHandler";
import { adminInfoSelector } from "@/store/adminInfo";
import { getPrivateChatList } from "@/lib/api/chat";
import styled from "styled-components";

const LayoutContainer = styled.div`
  display: flex;
  flex-direction: column;
  height: 100vh;
  height: -webkit-fill-available; /* iOS Safari 대응 */
  background: ${({ theme }) => theme.colors.bg};
  position: relative;
`;

const ContentContainer = styled.div<{ hideNavbar: boolean }>`
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  /* 헤더와 푸터 높이를 정확히 계산하여 콘텐츠가 가려지지 않도록 */
  margin-top: 60px; /* GlobalHeader 높이 */
  margin-bottom: ${({ hideNavbar }) => (hideNavbar ? "0" : "80px")};
  min-height: calc(
    100vh - 60px - ${({ hideNavbar }) => (hideNavbar ? "0" : "80px")}
  );

  /* iOS Safari 주소창 높이 변화 대응 */
  min-height: -webkit-fill-available;
`;

const MainLayout: React.FC = () => {
  const location = useLocation();
  const queryClient = useQueryClient();
  const adminInfo = useRecoilValue(adminInfoSelector);
  const hideNavbar = location.pathname.startsWith("/chat/private");

  // 진입 시 채팅 목록 프리페치 (목록 페이지 진입 시 즉시 표시)
  useEffect(() => {
    if (!adminInfo?.id) return;
    queryClient.prefetchQuery({
      queryKey: ["privateChats"],
      queryFn: getPrivateChatList,
    });
  }, [adminInfo?.id, queryClient]);

  return (
    <LayoutContainer>
      {localStorage.getItem("alarm_sounds") === "true" && (
        <TabNotificationHandler />
      )}
      <GlobalHeader />
      <ContentContainer hideNavbar={hideNavbar}>
        <Outlet />
      </ContentContainer>
      {!hideNavbar && <BottomNavbar />}
    </LayoutContainer>
  );
};

export default MainLayout;
