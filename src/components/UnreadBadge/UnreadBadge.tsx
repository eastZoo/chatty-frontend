// src/components/UnreadBadge/UnreadBadge.tsx
import React from "react";
import styled from "styled-components";

const Badge = styled.div<{ count: number }>`
  background-color: ${(props) => (props.count > 0 ? "#ff4757" : "transparent")};
  color: ${(props) => (props.count > 0 ? "white" : "transparent")};
  border-radius: 50%;
  padding: 3px 7px;
  font-size: 0.7em;
  min-width: 6px;
  text-align: center;
`;

interface UnreadBadgeProps {
  count: number;
}

const UnreadBadge: React.FC<UnreadBadgeProps> = ({ count }) => {
  return <Badge count={count}>{count}</Badge>;
};

export default UnreadBadge;
