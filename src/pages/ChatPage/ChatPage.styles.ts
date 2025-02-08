import styled from "styled-components";

export const ChatPageContainer = styled.div`
  display: flex;
  height: 100vh;
  background-color: #36393f;
  box-sizing: border-box;

  @media (max-width: 768px) {
    flex-direction: column;
    height: auto;
  }
`;
