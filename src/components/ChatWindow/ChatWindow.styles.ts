import styled from "styled-components";

export const ChatWindowContainer = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  background-color: #36393f;
  color: #fff;
  position: relative;
  height: 100%;
  box-sizing: border-box;
`;

export const MessagesContainer = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow-y: auto;
  padding: 16px;
  padding-bottom: 10px;
  overflow-x: hidden;

  @media (max-width: 768px) {
    padding-bottom: 65px; /* 모바일에서만 입력창 높이 고려 */
  }
`;

export const MessageItem = styled.div`
  position: relative; /* Timestamp의 절대 위치를 위해 추가 */
  padding: 10px 60px 10px 10px; /* 오른쪽에 타임스탬프를 위한 공간 확보 */
  border-radius: 4px;
  background-color: #40444b;
  margin-bottom: 8px;
  font-size: 0.95em;

  & > strong {
    color: #7289da;
    margin-right: 4px;
  }
`;

export const Timestamp = styled.div`
  position: absolute;
  top: 4px;
  right: 8px;
  font-size: 0.7em;
  color: #b9bbbe;
`;

export const DummyDiv = styled.div`
  height: 1px;
`;
