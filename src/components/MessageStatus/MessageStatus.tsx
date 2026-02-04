import React from "react";
import styled from "styled-components";
import { FiCheck, FiClock } from "react-icons/fi";

const StatusContainer = styled.div`
  display: flex;
  align-items: center;
  gap: 2px;
  margin-top: 4px;
  font-size: 12px;
  opacity: 0.7;
`;

const StatusIcon = styled.div<{
  status: "sending" | "sent" | "delivered" | "read";
}>`
  color: ${({ theme, status }) => {
    switch (status) {
      case "sending":
        return theme.colors.textSecondary;
      case "sent":
        return theme.colors.textSecondary;
      case "delivered":
        return theme.colors.primary;
      case "read":
        return theme.colors.success;
      default:
        return theme.colors.textSecondary;
    }
  }};
`;

interface MessageStatusProps {
  status: "sending" | "sent" | "delivered" | "read";
  timestamp?: string;
}

const MessageStatus: React.FC<MessageStatusProps> = ({ status, timestamp }) => {
  const getStatusIcon = () => {
    switch (status) {
      case "sending":
        return <FiClock size={12} />;
      default:
        return <></>;
    }
  };

  const getStatusText = () => {
    switch (status) {
      case "sending":
        return "전송 중";
      case "sent":
        return "전송됨";
      case "delivered":
        return "전달됨";
      case "read":
        return "읽음";
      default:
        return "";
    }
  };

  return (
    <StatusContainer>
      <StatusIcon status={status}>{getStatusIcon()}</StatusIcon>
      <span>{getStatusText()}</span>
      {timestamp && <span> • {timestamp}</span>}
    </StatusContainer>
  );
};

export default MessageStatus;
