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
  justify-content: flex-end; /* 메시지를 하단에 정렬 */
  overflow-y: auto;
  padding: 16px;
  /* 하단 고정 MessageInput 영역 높이 고려 (예: 80px) */
  padding-bottom: 80px;
`;

export const MessageItem = styled.div`
  padding: 10px;
  border-radius: 4px;
  background-color: #40444b;
  margin-bottom: 8px;
  font-size: 0.95em;

  & > strong {
    color: #7289da;
    margin-right: 4px;
  }
`;

// 더미 엘리먼트는 하단 정렬 시 필요 없을 수도 있으나, 만약 자동 스크롤을 위해 사용한다면 그대로 둡니다.
export const DummyDiv = styled.div`
  height: 1px;
`;
