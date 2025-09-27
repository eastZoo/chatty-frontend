import { atom, selector } from "recoil";

// localStorage에서 다크모드 설정을 가져오는 함수
const getDarkModeFromStorage = (): boolean => {
  if (typeof window !== "undefined") {
    try {
      const stored = localStorage.getItem("darkMode");
      if (stored !== null) {
        return JSON.parse(stored);
      }
    } catch (error) {
      console.warn("Failed to parse darkMode from localStorage:", error);
    }
  }
  return false; // 기본값은 라이트 모드
};

// 다크모드 상태 atom
export const darkModeState = atom({
  key: "darkModeState",
  default: false, // 초기값은 false로 설정
});

// 다크모드 상태를 localStorage에 저장하는 selector
export const darkModeWithPersistence = selector({
  key: "darkModeWithPersistence",
  get: ({ get }) => get(darkModeState),
  set: ({ set }, newValue) => {
    set(darkModeState, newValue);
    if (typeof window !== "undefined") {
      try {
        localStorage.setItem("darkMode", JSON.stringify(newValue));
      } catch (error) {
        console.warn("Failed to save darkMode to localStorage:", error);
      }
    }
  },
});

// localStorage에서 다크모드 설정을 초기화하는 함수
export const initializeDarkMode = (setter: (value: boolean) => void) => {
  if (typeof window !== "undefined") {
    const storedValue = getDarkModeFromStorage();
    setter(storedValue);
  }
};
