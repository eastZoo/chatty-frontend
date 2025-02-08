import styled from "styled-components";

export const SidebarContainer = styled.div`
  background-color: #2f3136;
  color: #fff;
  padding: 16px;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  height: 100%;

  /* 데스크탑: 사이드바로 고정 폭 */
  @media (min-width: 769px) {
    width: 25%;
    min-width: 250px;
    max-width: 350px;
  }

  /* 모바일: 상단 바 (높이 고정) */
  @media (max-width: 768px) {
    width: 100%;
    height: 60px;
    flex-direction: row;
    align-items: center;
    justify-content: space-between;
    padding: 8px 16px;
  }
`;

export const NewChatButton = styled.button`
  background-color: #7289da;
  color: #fff;
  border: none;
  border-radius: 4px;
  padding: 10px;
  margin-bottom: 16px;
  font-size: 1em;
  cursor: pointer;
  transition: background-color 0.2s;

  &:hover {
    background-color: #5b6eae;
  }

  /* 모바일: 버튼 크기 조정 */
  @media (max-width: 768px) {
    margin-bottom: 0;
    padding: 8px;
    font-size: 0.9em;
  }
`;

export const ChatList = styled.ul`
  list-style: none;
  padding: 0;
  flex: 1;
  overflow-y: auto;

  /* 모바일: 숨기거나 스크롤 처리 (필요시) */
  @media (max-width: 768px) {
    display: none;
  }
`;

interface ChatItemProps {
  active: boolean;
}

export const ChatItem = styled.li<ChatItemProps>`
  padding: 10px;
  border-radius: 4px;
  margin-bottom: 8px;
  cursor: pointer;
  display: flex;
  justify-content: space-between;
  align-items: center;
  background-color: ${({ active }) => (active ? "#40444b" : "transparent")};
  transition: background-color 0.2s;

  &:hover {
    background-color: #40444b;
  }
`;

export const ChatTitle = styled.span`
  flex: 1;
  font-size: 0.95em;
`;

export const EditButton = styled.button`
  background: none;
  border: none;
  color: #b9bbbe;
  cursor: pointer;
  font-size: 0.8em;
  margin-left: 8px;

  &:hover {
    color: #fff;
  }
`;

export const TitleInput = styled.input`
  padding: 8px;
  margin-bottom: 8px;
  border: none;
  border-radius: 4px;
  font-size: 0.9em;
  background-color: #40444b;
  color: #fff;

  &::placeholder {
    color: #b9bbbe;
  }
`;
