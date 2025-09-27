import React, { useEffect } from "react";
import { RecoilRoot } from "recoil";
import { QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { ThemeProvider } from "styled-components";
import { BrowserRouter } from "react-router-dom";
import { useRecoilValue, useSetRecoilState } from "recoil";

import { lightTheme, darkTheme } from "@/styles/theme";
import { darkModeState, initializeDarkMode } from "@/store/theme";
import { GlobalStyle } from "@/styles/GlobalStyle";
import { queryClient } from "@/lib/queryClient";
import AppRoutes from "@/lib/core/routes/Routes";
import { ToastContainer } from "react-toastify";

// 테마를 적용하는 내부 컴포넌트
const AppWithTheme: React.FC = () => {
  const isDarkMode = useRecoilValue(darkModeState);
  const setDarkMode = useSetRecoilState(darkModeState);
  const currentTheme = isDarkMode ? darkTheme : lightTheme;

  // localStorage에서 다크모드 설정을 초기화
  useEffect(() => {
    initializeDarkMode(setDarkMode);
  }, [setDarkMode]);

  return (
    <ThemeProvider theme={currentTheme}>
      <BrowserRouter>
        <GlobalStyle />
        <AppRoutes />
        {/* <ReactQueryDevtools
          initialIsOpen={false}
          buttonPosition="bottom-left"
        /> */}

        <ToastContainer
          className="custom-toast-container"
          toastClassName="custom-toast"
          position="top-center"
          autoClose={1000}
          hideProgressBar
          newestOnTop
          closeOnClick
          rtl={false}
          pauseOnFocusLoss
          draggable
          pauseOnHover
        />
      </BrowserRouter>
    </ThemeProvider>
  );
};

export default function AppProviders() {
  return (
    <RecoilRoot>
      <QueryClientProvider client={queryClient}>
        <AppWithTheme />
      </QueryClientProvider>
    </RecoilRoot>
  );
}
