import type { DefaultTheme } from "styled-components";

declare module "styled-components" {
  export interface DefaultTheme {
    colors: {
      primary: string;
      secondary: string;
      accent: string;
      text: string;
      textSecondary: string;
      bg: string;
      bgSecondary: string;
      bgTertiary: string;
      border: string;
      success: string;
      warning: string;
      error: string;
      messageOwn: string;
      messageOther: string;
      messageOwnText: string;
      messageOtherText: string;
    };
    radius: {
      sm: string;
      md: string;
      lg: string;
      xl: string;
      full: string;
    };
    spacing: (n: number) => string;
    shadows: {
      sm: string;
      md: string;
      lg: string;
    };
    breakpoints: {
      mobile: string;
      tablet: string;
      desktop: string;
    };
    isDark: boolean;
  }
}

// 라이트 모드 테마
export const lightTheme: DefaultTheme = {
  colors: {
    // 모바일 채팅앱에 맞는 색상 팔레트
    primary: "#007AFF", // iOS 블루
    secondary: "#34C759", // iOS 그린
    accent: "#FF3B30", // iOS 레드
    text: "#1D1D1F", // 다크 그레이
    textSecondary: "#86868B", // 라이트 그레이
    bg: "#F2F2F7", // iOS 라이트 그레이
    bgSecondary: "#FFFFFF", // 화이트
    bgTertiary: "#F9F9F9", // 매우 연한 그레이
    border: "#E5E5EA", // 보더 색상
    success: "#34C759",
    warning: "#FF9500",
    error: "#FF3B30",
    // 채팅 메시지 색상
    messageOwn: "#007AFF",
    messageOther: "#E5E5EA",
    messageOwnText: "#FFFFFF",
    messageOtherText: "#1D1D1F",
  },
  radius: {
    sm: "8px",
    md: "12px",
    lg: "16px",
    xl: "20px",
    full: "50%",
  },
  spacing: (n: number) => `${n * 4}px`,
  shadows: {
    sm: "0 1px 3px rgba(0, 0, 0, 0.1)",
    md: "0 4px 6px rgba(0, 0, 0, 0.1)",
    lg: "0 10px 15px rgba(0, 0, 0, 0.1)",
  },
  breakpoints: {
    mobile: "768px",
    tablet: "1024px",
    desktop: "1200px",
  },
  isDark: false,
};

// 다크 모드 테마
export const darkTheme: DefaultTheme = {
  colors: {
    primary: "#0A84FF", // 다크모드 블루
    secondary: "#30D158", // 다크모드 그린
    accent: "#FF453A", // 다크모드 레드
    text: "#FFFFFF", // 화이트
    textSecondary: "#8E8E93", // 다크모드 그레이
    bg: "#000000", // 블랙
    bgSecondary: "#1C1C1E", // 다크 그레이
    bgTertiary: "#2C2C2E", // 더 밝은 다크 그레이
    border: "#38383A", // 다크모드 보더
    success: "#30D158",
    warning: "#FF9F0A",
    error: "#FF453A",
    // 채팅 메시지 색상 (다크모드)
    messageOwn: "#0A84FF",
    messageOther: "#2C2C2E",
    messageOwnText: "#FFFFFF",
    messageOtherText: "#FFFFFF",
  },
  radius: {
    sm: "8px",
    md: "12px",
    lg: "16px",
    xl: "20px",
    full: "50%",
  },
  spacing: (n: number) => `${n * 4}px`,
  shadows: {
    sm: "0 1px 3px rgba(0, 0, 0, 0.3)",
    md: "0 4px 6px rgba(0, 0, 0, 0.3)",
    lg: "0 10px 15px rgba(0, 0, 0, 0.3)",
  },
  breakpoints: {
    mobile: "768px",
    tablet: "1024px",
    desktop: "1200px",
  },
  isDark: true,
};

// 기본 테마 (라이트 모드)
export const theme = lightTheme;
