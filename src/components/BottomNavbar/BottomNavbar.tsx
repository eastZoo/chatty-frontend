import React from "react";
import styled from "styled-components";
import { FiHome, FiMessageSquare, FiSettings } from "react-icons/fi";
import { useNavigate, useLocation } from "react-router-dom";

const NavbarContainer = styled.div`
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  height: 80px;
  background: ${({ theme }) => theme.colors.bgSecondary};
  border-top: 1px solid ${({ theme }) => theme.colors.border};
  display: flex;
  justify-content: space-around;
  align-items: center;
  z-index: 1000;
  /* iOS 안전 영역 대응 */
  padding-bottom: max(0px, env(safe-area-inset-bottom));
  box-shadow: 0 -2px 10px rgba(0, 0, 0, 0.1);
`;

const NavItem = styled.div<{ active: boolean }>`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 8px 12px;
  border-radius: ${({ theme }) => theme.radius.md};
  color: ${({ active, theme }) =>
    active ? theme.colors.primary : theme.colors.textSecondary};
  font-size: 11px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  min-width: 60px;

  &:active {
    transform: scale(0.95);
    background: ${({ theme }) => theme.colors.bgTertiary};
  }

  svg {
    margin-bottom: 4px;
    transition: all 0.2s ease;
  }

  ${({ active, theme }) =>
    active &&
    `
    background: ${theme.colors.bgTertiary};
    svg {
      transform: scale(1.1);
    }
  `}
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
        } else if (tab.path === "/chat") {
          // 대화 탭은 /chat으로 시작하는 경로일 때 활성화
          active = location.pathname.startsWith("/chat");
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
