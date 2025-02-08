import styled from "styled-components";

export const ChatWindowContainer = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  background-color: #36393f;
  color: #fff;
  padding: 16px;
  height: 100vh;
  box-sizing: border-box;

  @media (max-width: 768px) {
    height: auto;
  }
`;

export const MessagesContainer = styled.div`
  flex: 1;
  overflow-y: auto;
  margin-bottom: 16px;
  padding-right: 8px;
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

export const DummyDiv = styled.div`
  height: 1px;
`;
