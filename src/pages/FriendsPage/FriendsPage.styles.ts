import styled from "styled-components";

export const FriendsContainer = styled.div`
  padding: 16px;
  background-color: #36393f;
  color: #fff;
  min-height: calc(100vh - 110px); /* 하단 탭바 고려 */
  box-sizing: border-box;

  @media (max-width: 768px) {
    padding: 12px;
  }
`;

/* 프로필 카드 */
export const ProfileCard = styled.div`
  display: flex;
  align-items: center;
  padding: 16px;
  background-color: #40444b;
  border-radius: 8px;
  margin-bottom: 16px;
`;

export const ProfileAvatar = styled.div`
  width: 60px;
  height: 60px;
  background-color: #7289da;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.5em;
  font-weight: bold;
  color: #fff;
  margin-right: 16px;
`;

export const ProfileInfo = styled.div`
  display: flex;
  flex-direction: column;
`;

export const ProfileName = styled.div`
  font-size: 1.2em;
  font-weight: bold;
  margin-bottom: 4px;
`;

export const ProfileStatus = styled.div`
  font-size: 0.9em;
  color: #b9bbbe;
`;

/* 구분선 */
export const Divider = styled.div`
  height: 1px;
  background-color: #40444b;
  margin: 16px 0;
`;

export const Section = styled.div`
  margin-bottom: 24px;
`;

export const SectionTitle = styled.h3`
  font-size: 1.2em;
  margin-bottom: 12px;
  padding-bottom: 4px;
  border-bottom: 1px solid #40444b;
`;

export const FriendList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
  height: auto;
  overflow-y: auto;
`;

export const FriendItem = styled.div`
  display: flex;
  align-items: center;
  padding: 8px;
  background-color: #40444b;
  border-radius: 4px;
`;

export const FriendAvatar = styled.div`
  width: 40px;
  height: 40px;
  background-color: #7289da;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.1em;
  font-weight: bold;
  margin-right: 12px;
  flex-shrink: 0;
`;

export const FriendName = styled.div`
  flex: 1;
  font-size: 1em;
`;

export const ActionButton = styled.button`
  background-color: #7289da;
  border: none;
  color: #fff;
  padding: 6px 10px;
  border-radius: 4px;
  cursor: pointer;
  font-size: 0.9em;
  margin-left: 8px;
  transition: background-color 0.2s;

  &:hover {
    background-color: #5b6eae;
  }
`;

export const InputContainer = styled.div`
  display: flex;
  align-items: center;
  margin-top: 8px;
`;

export const SearchInput = styled.input`
  flex: 1;
  padding: 8px;
  margin-right: 8px;
  border-radius: 4px;
  border: none;
  font-size: 1em;
  background-color: #40444b;
  color: #fff;

  &::placeholder {
    color: #b9bbbe;
  }
`;

export const SearchButton = styled.button`
  background-color: #43b581;
  border: none;
  color: #fff;
  padding: 8px 12px;
  border-radius: 4px;
  cursor: pointer;
  font-size: 1em;
  transition: background-color 0.2s;

  &:hover {
    background-color: #3aa67c;
  }
`;
