import React from "react";
import { Outlet, useLocation } from "react-router-dom";
import BottomNavbar from "@/components/BottomNavbar/BottomNavbar";
import GlobalHeader from "@/components/GlobalHeader/GlobalHeader";
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
  // 경로가 /chat/private로 시작하면 BottomNavbar 숨김
  const hideNavbar = location.pathname.startsWith("/chat/private");

  return (
    <LayoutContainer>
      <GlobalHeader />
      <ContentContainer hideNavbar={hideNavbar}>
        <Outlet />
      </ContentContainer>
      {!hideNavbar && <BottomNavbar />}
    </LayoutContainer>
  );
};

export default MainLayout;
