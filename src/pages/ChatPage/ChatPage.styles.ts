import styled from "styled-components";

export const ChatPageContainer = styled.div`
  display: flex;
  width: 100vw;
  height: 100vh;
  background-color: #36393f;
  overflow: hidden;

  @media (min-width: 769px) {
    flex-direction: row;
  }

  @media (max-width: 768px) {
    flex-direction: column;
    padding-top: 60px; /* 고정 헤더 높이 */
    padding-bottom: 10px; /* 고정 MessageInput 높이 + 여유 */
  }
`;

export const Overlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background-color: rgba(0, 0, 0, 0.5);
  backdrop-filter: blur(1px);
  z-index: 1050;
  animation: fadeIn 0.3s ease;

  @keyframes fadeIn {
    from {
      opacity: 0;
    }
    to {
      opacity: 1;
    }
  }
`;
