import React from "react";
import { useQuery } from "@tanstack/react-query";
import { getUnreadCount } from "../../api/chat";
import styled from "styled-components";

const BadgeContainer = styled.div`
  background-color: #ff4757;
  color: #fff;
  font-size: 0.7em;
  padding: 2px 6px;
  border-radius: 12px;
  margin-left: 8px;
`;

interface UnreadBadgeProps {
  friendId: string;
}

const UnreadBadge: React.FC<UnreadBadgeProps> = ({ friendId }) => {
  const { data: unreadCount } = useQuery({
    queryKey: ["unreadCount", friendId],
    queryFn: () => getUnreadCount(friendId),
    // refetchInterval: 1000, // 주기적으로 업데이트 (옵션)
  });

  if (!unreadCount || unreadCount === 0) {
    return null;
  }
  return <BadgeContainer>{unreadCount}</BadgeContainer>;
};

export default UnreadBadge;
