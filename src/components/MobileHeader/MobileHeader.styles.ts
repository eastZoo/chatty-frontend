import styled from "styled-components";

export const HeaderContainer = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  height: 60px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 16px;
  background-color: #2f3136;
  color: #fff;
  box-sizing: border-box;
  z-index: 1100;
`;

// 좌측 영역은 항상 35px의 고정 폭을 갖습니다.
export const LeftContainer = styled.div`
  width: 35px;
  display: flex;
  align-items: center;
  justify-content: center;
`;

// 우측 영역도 동일하게 35px (필요시 아이콘을 넣거나 빈 공간 유지)
export const RightContainer = styled.div`
  width: 35px;
`;

export const MenuButton = styled.button`
  width: 35px;
  height: 35px;
  border: none;
  background: none;
  cursor: pointer;
  color: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
`;
