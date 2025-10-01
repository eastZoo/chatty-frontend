// src/utils/authFunctions.ts
export const saveAccessToken = (token: string) => {
  localStorage.setItem("chatty_accessToken", token);
};

export const readAccessToken = (): string | null => {
  return localStorage.getItem("chatty_accessToken");
};

export const removeAccessToken = () => {
  localStorage.removeItem("chatty_accessToken");
};
