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

// 임시로 프로필 ID도 필요할 경우(예: 회원 가입 후 설정)
export const readProfileId = (): string | null => {
  return localStorage.getItem("profileId");
};
