import React from "react";
import styled from "styled-components";
import { FiHome, FiMessageSquare, FiSettings } from "react-icons/fi";
import { useNavigate, useLocation } from "react-router-dom";

const NavbarContainer = styled.div`
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  height: 60px;
  background-color: #2f3136;
  display: flex;
  justify-content: space-around;
  align-items: center;
  border-top: 1px solid #40444b;
  z-index: 1000;
`;

const NavItem = styled.div<{ active: boolean }>`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  color: ${({ active }) => (active ? "#7289da" : "#b9bbbe")};
  font-size: 0.5em;
  cursor: pointer;
`;

const BottomNavbar: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const tabs = [
    { label: "홈", icon: <FiHome size={20} />, path: "/" },
    {
      label: "대화",
      icon: <FiMessageSquare size={20} />,
      path: "/chat",
    },
    { label: "설정", icon: <FiSettings size={20} />, path: "/settings" },
  ];

  return (
    <NavbarContainer>
      {tabs.map((tab) => {
        // 정확한 경로 매칭을 위한 조건 수정
        let active = false;
        if (tab.path === "/") {
          // 홈 탭은 정확히 "/" 경로일 때만 활성화
          active = location.pathname === "/";
        } else if (tab.path === "/chat/private") {
          // 대화 탭은 /chat/private로 시작하는 경로일 때 활성화
          active = location.pathname.startsWith("/chat/private");
        } else {
          // 나머지 탭은 정확한 경로 매칭
          active = location.pathname === tab.path;
        }

        return (
          <NavItem
            key={tab.path}
            active={active}
            onClick={() => navigate(tab.path)}
          >
            {tab.icon}
            <div>{tab.label}</div>
          </NavItem>
        );
      })}
    </NavbarContainer>
  );
};

export default BottomNavbar;
