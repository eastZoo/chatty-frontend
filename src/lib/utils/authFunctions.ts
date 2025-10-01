// src/utils/authFunctions.ts
export const saveAccessToken = (token: string) => {
  localStorage.setItem("access_token", token);
};

export const readAccessToken = (): string | null => {
  return localStorage.getItem("access_token");
};

export const removeAccessToken = () => {
  localStorage.removeItem("access_token");
};

// 임시로 프로필 ID도 필요할 경우(예: 회원 가입 후 설정)
export const readProfileId = (): string | null => {
  return localStorage.getItem("profileId");
};
