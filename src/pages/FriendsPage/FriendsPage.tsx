import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getFriends,
  getFriendRequests,
  acceptFriendRequest,
  rejectFriendRequest,
} from "@/lib/api/friends";
import {
  FriendsContainer,
  ProfileCard,
  ProfileAvatar,
  ProfileInfo,
  ProfileName,
  ProfileStatus,
  Divider,
  Section,
  SectionTitle,
  FriendList,
  FriendItem,
  FriendAvatar as FriendItemAvatar,
  FriendName as FriendItemName,
  ActionButton,
} from "./FriendsPage.styles";
import { toast } from "react-toastify";
import { useRecoilValue } from "recoil";
import { adminInfoSelector } from "@/store/adminInfo";
import FriendProfileModal from "@/components/FriendProfileModal/FriendProfileModal";

interface Friend {
  id: string;
  username: string;
}

interface FriendRequest {
  id: string;
  requester: {
    id: string;
    username: string;
  };
}

const FriendsPage: React.FC = () => {
  const queryClient = useQueryClient();
  const adminInfo = useRecoilValue(adminInfoSelector);
  const [selectedFriend, setSelectedFriend] = useState<Friend | null>(null);

  const { data: friends = [], isLoading: friendsLoading } = useQuery({
    queryKey: ["friends"],
    queryFn: getFriends,
    enabled: !!adminInfo,
  });

  const { data: friendRequests = [], isLoading: requestsLoading } = useQuery({
    queryKey: ["friendRequests"],
    queryFn: getFriendRequests,
    enabled: !!adminInfo,
  });

  // const sendRequestMutation = useMutation({
  //   mutationFn: (receiverId: string) => sendFriendRequest(receiverId),
  //   onSuccess: () => {
  //     toast.success("친구 요청을 보냈습니다.");
  //     queryClient.invalidateQueries({ queryKey: ["friendRequests"] });
  //   },
  //   onError: () => {
  //     toast.error("친구 요청에 실패했습니다.");
  //   },
  // });

  const acceptRequestMutation = useMutation({
    mutationFn: (requestId: string) => acceptFriendRequest(requestId),
    onSuccess: () => {
      toast.success("친구 요청을 수락했습니다.");
      queryClient.invalidateQueries({ queryKey: ["friendRequests"] });
      queryClient.invalidateQueries({ queryKey: ["friends"] });
    },
    onError: () => {
      toast.error("친구 요청 수락에 실패했습니다.");
    },
  });

  const rejectRequestMutation = useMutation({
    mutationFn: (requestId: string) => rejectFriendRequest(requestId),
    onSuccess: () => {
      toast.info("친구 요청을 거절했습니다.");
      queryClient.invalidateQueries({ queryKey: ["friendRequests"] });
    },
    onError: () => {
      toast.error("친구 요청 거절에 실패했습니다.");
    },
  });

  return (
    <FriendsContainer>
      {/* 내 프로필 카드 */}
      <ProfileCard>
        <ProfileAvatar>
          {adminInfo?.username.charAt(0).toUpperCase()}
        </ProfileAvatar>
        <ProfileInfo>
          <ProfileName>{adminInfo?.username}</ProfileName>
          <ProfileStatus>
            {adminInfo?.status || "상태 메시지를 설정해주세요."}
          </ProfileStatus>
        </ProfileInfo>
      </ProfileCard>

      <Divider />

      {/* 친구 신청 섹션 */}
      <Section>
        <SectionTitle>친구 신청</SectionTitle>
        {requestsLoading ? (
          <div>로딩중...</div>
        ) : friendRequests && friendRequests.length > 0 ? (
          <FriendList>
            {friendRequests.map((req: FriendRequest) => (
              <FriendItem
                key={req.id}
                onClick={() => setSelectedFriend(req.requester)}
              >
                <FriendItemAvatar>
                  {req.requester.username.charAt(0).toUpperCase()}
                </FriendItemAvatar>
                <FriendItemName>{req.requester.username}</FriendItemName>
                <ActionButton
                  onClick={() => acceptRequestMutation.mutate(req.id)}
                >
                  수락
                </ActionButton>
                <ActionButton
                  onClick={() => rejectRequestMutation.mutate(req.id)}
                >
                  거절
                </ActionButton>
              </FriendItem>
            ))}
          </FriendList>
        ) : (
          <div>받은 신청이 없습니다.</div>
        )}
      </Section>

      {/* 친구 목록 섹션 */}
      <Section>
        <SectionTitle>내 친구</SectionTitle>
        {friendsLoading ? (
          <div>로딩중...</div>
        ) : friends && friends.length > 0 ? (
          <FriendList>
            {friends.map((friend: Friend) => (
              <FriendItem
                key={friend.id}
                onClick={() => setSelectedFriend(friend)}
              >
                <FriendItemAvatar>
                  {friend.username.charAt(0).toUpperCase()}
                </FriendItemAvatar>
                <FriendItemName>{friend.username}</FriendItemName>
              </FriendItem>
            ))}
          </FriendList>
        ) : (
          <div>친구가 없습니다.</div>
        )}
      </Section>

      {/* FriendProfileModal */}
      {selectedFriend && (
        <FriendProfileModal
          friend={selectedFriend}
          onClose={() => setSelectedFriend(null)}
        />
      )}
    </FriendsContainer>
  );
};

export default FriendsPage;
