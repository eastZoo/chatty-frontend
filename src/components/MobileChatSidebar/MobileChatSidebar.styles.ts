import styled from "styled-components";

interface SidebarProps {
  isOpen: boolean;
}

export const SidebarContainer = styled.div<SidebarProps>`
  position: fixed;
  top: 0;
  left: ${({ isOpen }) => (isOpen ? "0" : "-70px")};
  width: 70px;
  height: 100vh;
  background-color: #2f3136;
  transition: left 0.3s ease;
  z-index: 1100;
  display: flex;
  flex-direction: column;
  padding: 8px 0;
  box-sizing: border-box;
`;

export const BadgeList = styled.div`
  flex: 1;
  overflow-y: auto;
  margin-top: 0px;
`;

interface BadgeProps {
  selected?: boolean;
}

export const Badge = styled.button<BadgeProps>`
  width: 50px;
  height: 50px;
  border-radius: 50%;
  background-color: ${({ selected }) => (selected ? "#ff4757" : "#7289da")};
  border: none;
  color: #fff;
  font-size: 1em;
  margin: 10px auto;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: background-color 0.2s;

  &:hover {
    background-color: ${({ selected }) => (selected ? "#ff6b81" : "#5b6eae")};
  }
`;

export const PlusBadge = styled(Badge)`
  background-color: #43b581;
  font-size: 1.2em;
  font-weight: bold;
`;

// Divider 컴포넌트를 추가하여 PlusBadge와 BadgeList 사이에 가로 선을 표시합니다.
export const Divider = styled.div`
  width: 80%;
  height: 1px;
  background-color: #636363ff;
  margin: 8px auto;
`;
