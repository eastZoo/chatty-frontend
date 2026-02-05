import styled from "styled-components";

export const ChatWindowContainer = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  height: 100%;
  background: ${({ theme }) => theme.colors.bg};
  position: relative;
  box-sizing: border-box;
  overflow: hidden;
  --keyboard-offset: 0px;
`;

export const MessagesContainer = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow-y: auto;
  overflow-x: hidden;
  padding: 5px 20px;
  padding-bottom: calc(20px + var(--keyboard-offset, 0px));
  /* 모바일에서 스크롤 최적화 */
  -webkit-overflow-scrolling: touch;
  min-height: 0; /* flex 아이템이 축소될 수 있도록 */
  transition: padding-bottom 0.2s ease;

  /* 스크롤바 숨기기 (모바일에서) */
  &::-webkit-scrollbar {
    display: none;
  }
  -ms-overflow-style: none;
  scrollbar-width: none;
`;

export const MessageItem = styled.div<{ isOwn?: boolean }>`
  display: flex;
  flex-direction: column;
  align-items: ${({ isOwn }) => (isOwn ? "flex-end" : "flex-start")};
  margin-bottom: 16px;
  width: 100%;
  max-width: 100%;
  box-sizing: border-box;

  ${({ isOwn }) =>
    isOwn &&
    `
    align-self: flex-end;
  `}
`;

export const MessageBubble = styled.div<{ isOwn?: boolean }>`
  position: relative;
  padding: 12px 16px;
  border-radius: ${({ theme, isOwn }) =>
    isOwn
      ? `${theme.radius.lg} ${theme.radius.lg} 4px ${theme.radius.lg}`
      : `${theme.radius.lg} ${theme.radius.lg} ${theme.radius.lg} 4px`};
  background: ${({ theme, isOwn }) =>
    isOwn ? theme.colors.messageOwn : theme.colors.messageOther};
  color: ${({ theme, isOwn }) =>
    isOwn ? theme.colors.messageOwnText : theme.colors.messageOtherText};
  font-size: 16px;
  line-height: 1.4;
  word-wrap: break-word;
  word-break: break-word;
  box-shadow: ${({ theme }) => theme.shadows.sm};
  max-width: ${({ isOwn }) => (isOwn ? "70%" : "70%")};
  min-width: 60px;
  box-sizing: border-box;

  /* 메시지 말풍선 꼬리 */
  &::before {
    content: "";
    position: absolute;
    bottom: 0;
    width: 0;
    height: 0;
    border: 8px solid transparent;

    ${({ isOwn, theme }) =>
      isOwn
        ? `
      right: -8px;
      border-left-color: ${theme.colors.messageOwn};
    `
        : `
      left: -8px;
      border-right-color: ${theme.colors.messageOther};
    `}
  }
`;

export const MessageHeader = styled.div`
  display: flex;
  align-items: center;
  margin-bottom: 4px;
  gap: 8px;
  max-width: 70%;
`;

export const ReplyMessageLayout = styled.div<{ isOwn?: boolean }>`
  position: relative;
  padding: 6px 12px;
  border-radius: ${({ theme, isOwn }) =>
    isOwn
      ? `${theme.radius.lg} ${theme.radius.lg} 4px ${theme.radius.lg}`
      : `${theme.radius.lg} ${theme.radius.lg} ${theme.radius.lg} 4px`};
  background: ${({ theme, isOwn }) =>
    isOwn ? theme.colors.messageOwn : theme.colors.messageOther};
  color: ${({ theme, isOwn }) =>
    isOwn ? theme.colors.messageOwnText : theme.colors.messageOtherText};
  font-size: 16px;
  line-height: 1.4;
  word-wrap: break-word;
  word-break: break-word;
  box-shadow: ${({ theme }) => theme.shadows.sm};
  max-width: ${({ isOwn }) => (isOwn ? "70%" : "70%")};
  min-width: 60px;
  box-sizing: border-box;

  p {
    margin: 6px;
  }

  .reply-user,
  .reply-content {
    font-size: 12px;
  }

  .reply-content {
    color: ${({ isOwn }) => (isOwn ? "#ffffffc8" : "#000000c8")};
    padding-bottom: 6px;
    border-bottom: 1px solid
      ${({ isOwn }) => (isOwn ? "#ffffff4c" : "#00000026")};
  }

  /* 메시지 말풍선 꼬리 */
  &::before {
    content: "";
    position: absolute;
    bottom: 0;
    width: 0;
    height: 0;
    border: 8px solid transparent;

    ${({ isOwn, theme }) =>
      isOwn
        ? `
      right: -8px;
      border-left-color: ${theme.colors.messageOwn};
    `
        : `
      left: -8px;
      border-right-color: ${theme.colors.messageOther};
    `}
  }
`;

export const SenderName = styled.span`
  font-weight: 600;
  font-size: 14px;
  color: ${({ theme }) => theme.colors.textSecondary};
`;

export const Timestamp = styled.div<{ isOwn?: boolean }>`
  font-size: 12px;
  color: ${({ theme }) => theme.colors.textSecondary};
  margin-top: 4px;
  opacity: 0.7;
  text-align: ${({ isOwn }) => (isOwn ? "right" : "left")};
  max-width: 70%;
  align-self: ${({ isOwn }) => (isOwn ? "flex-end" : "flex-start")};
`;

export const DummyDiv = styled.div`
  height: 1px;
`;

// 빈 채팅 상태 스타일
export const EmptyChatContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  padding: 40px 20px;
  text-align: center;
`;

export const EmptyChatIcon = styled.div`
  width: 80px;
  height: 80px;
  background: ${({ theme }) => theme.colors.bgTertiary};
  border-radius: ${({ theme }) => theme.radius.full};
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 16px;
  opacity: 0.6;
`;

export const EmptyChatText = styled.p`
  font-size: 16px;
  color: ${({ theme }) => theme.colors.textSecondary};
  margin: 0;
  line-height: 1.5;
`;

export const ReplyChatContainer = styled.div`
  width: 100%;
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: start;

  padding: 6px 12px 6px 12px;
`;

export const ReplayBox = styled.div`
  display: flex;
  flex-direction: column;
  gap: 6px;

  p {
    margin: 0px;
  }

  .title-reply {
    color: #5d5c5cff;
  }

  .content-reply {
    color: #a3a3a3;
  }
`;

export const ImageBubbleBox = styled.div<{ isOwn: boolean }>`
  display: flex;
  flex-direction: ${(props) => (props.isOwn ? "row" : "row-reverse")};
  justify-content: end;
  align-items: end;
  gap: 10px;

  border-radius: 16px;

  img {
    border-radius: 16px;
    object-fit: cover;
  }
`;

export const ImageOpenLayout = styled.div`
  position: absolute;
  inset: 0; /* top, left, right, bottom: 0 */

  display: flex;
  justify-content: center;
  align-items: center;

  background-color: rgba(0, 0, 0, 0.6);
  z-index: 999;

  padding: 24px;

  img {
    max-width: 100%;
    max-height: 100%;

    width: auto;
    height: auto;

    object-fit: contain;

    border-radius: 8px;
  }
`;
