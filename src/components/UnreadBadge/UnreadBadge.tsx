// src/components/UnreadBadge/UnreadBadge.tsx
import React from "react";
import styled from "styled-components";

const Badge = styled.div`
  background-color: #ff4757;
  color: white;
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
  if (count <= 0) return null;
  return <Badge>{count}</Badge>;
};

export default UnreadBadge;
