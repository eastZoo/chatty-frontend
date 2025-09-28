// src/utils/authFunctions.ts
export const saveAccessToken = (token: string) => {
  localStorage.setItem("accessToken", token);
};

export const readAccessToken = (): string | null => {
  return localStorage.getItem("accessToken");
};

export const removeAccessToken = () => {
  localStorage.removeItem("accessToken");
};

// 로그아웃 시 모든 인증 관련 데이터 정리
export const clearAllAuthData = () => {
  localStorage.removeItem("accessToken");
  localStorage.removeItem("refreshToken");
  localStorage.removeItem("userIP");
  localStorage.removeItem("userId");
  localStorage.removeItem("profileId");
  // 기타 사용자 관련 데이터가 있다면 여기에 추가
};

// 임시로 프로필 ID도 필요할 경우(예: 회원 가입 후 설정)
export const readProfileId = (): string | null => {
  return localStorage.getItem("profileId");
};
