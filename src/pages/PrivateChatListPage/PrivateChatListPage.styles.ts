import styled from "styled-components";

export const ChatListContainer = styled.div`
  padding: 16px;
  background-color: #36393f;
  color: #fff;
  min-height: calc(100vh - 110px); /* 하단 탭바 고려 */
  box-sizing: border-box;

  @media (max-width: 768px) {
    padding: 12px;
  }
`;

export const ChatItem = styled.div`
  display: flex;
  align-items: center;
  padding: 12px;
  background-color: #40444b;
  border-radius: 8px;
  margin-bottom: 12px;
  cursor: pointer;
  transition: background-color 0.2s;

  &:hover {
    background-color: #484e57;
  }
`;

export const ChatItemAvatar = styled.div`
  width: 50px;
  height: 50px;
  background-color: #7289da;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.5em;
  font-weight: bold;
  color: #fff;
  margin-right: 12px;
`;

export const ChatItemContent = styled.div`
  display: flex;
  flex-direction: column;
  flex: 1;
`;

export const ChatItemName = styled.div`
  font-size: 1.1em;
  font-weight: bold;
  margin-bottom: 4px;
`;

export const ChatItemLastMessage = styled.div`
  font-size: 0.9em;
  color: #b9bbbe;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 80%;
`;
