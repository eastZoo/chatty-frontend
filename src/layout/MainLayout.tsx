import React from "react";
import { Outlet, useLocation } from "react-router-dom";
import BottomNavbar from "@/components/BottomNavbar/BottomNavbar";
import GlobalHeader from "@/layout/GlobalHeader/GlobalHeader";
import styled from "styled-components";

const ContentContainer = styled.div`
  padding-top: 50px; /* Space for GlobalHeader */
  height: calc(
    100vh - 110px
  ); /* Full height minus GlobalHeader and BottomNavbar */
  overflow: hidden; /* Prevent double scroll */
  display: flex;
  flex-direction: column;
`;

const MainLayout: React.FC = () => {
  const location = useLocation();
  // 경로가 /chat/private로 시작하면 BottomNavbar 숨김
  const hideNavbar = location.pathname.startsWith("/chat/private");

  return (
    <>
      <GlobalHeader />
      <ContentContainer>
        <Outlet />
      </ContentContainer>
      {!hideNavbar && <BottomNavbar />}
    </>
  );
};

export default MainLayout;
