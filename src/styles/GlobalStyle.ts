import { createGlobalStyle } from "styled-components";
import { normalize } from "styled-normalize";

export const GlobalStyle = createGlobalStyle`
  ${normalize}

  * {
    box-sizing: border-box;
  }

  html, body, #root {
    height: 100%;
    font-size: 16px; /* 모바일에서 가독성을 위해 16px로 설정 */
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', sans-serif;
    overflow-x: hidden;
    -webkit-text-size-adjust: 100%; /* iOS Safari 텍스트 크기 조정 방지 */
    -webkit-tap-highlight-color: transparent; /* 터치 하이라이트 제거 */
  }

  body {
    margin: 0;
    padding: 0;
    color: ${({ theme }) => theme.colors.text};
    background: ${({ theme }) => theme.colors.bg};
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
    overflow-x: hidden;
    /* iOS Safari 주소창 높이 대응 */
    min-height: 100vh;
    min-height: -webkit-fill-available;
  }

  #root {
    height: 100vh;
    height: -webkit-fill-available;
    display: flex;
    flex-direction: column;
  }

  /* 모바일 터치 최적화 */
  a, button, input, textarea, select {
    -webkit-tap-highlight-color: transparent;
    -webkit-touch-callout: none;
  }

  /* 기본 스타일 리셋 */
  a { 
    color: inherit; 
    text-decoration: none; 
  }
  
  ul, ol { 
    padding: 0; 
    margin: 0; 
    list-style: none; 
  }
  
  button { 
    cursor: pointer;
    border: none;
    background: none;
    padding: 0;
    font: inherit;
  }
  
  input, textarea, select { 
    font: inherit;
    border: none;
    outline: none;
    background: transparent;
  }

  /* 스크롤바 스타일링 (웹킷 브라우저) */
  ::-webkit-scrollbar {
    width: 4px;
  }
  
  ::-webkit-scrollbar-track {
    background: transparent;
  }
  
  ::-webkit-scrollbar-thumb {
    background: rgba(0, 0, 0, 0.2);
    border-radius: 2px;
  }
  
  ::-webkit-scrollbar-thumb:hover {
    background: rgba(0, 0, 0, 0.3);
  }

  /* iOS Safari에서 input zoom 방지 */
  input[type="text"],
  input[type="email"],
  input[type="password"],
  input[type="search"],
  textarea {
    font-size: 16px;
  }

  /* 안전 영역 대응 (iPhone X 이상) */
  @supports (padding: max(0px)) {
    .safe-area-top {
      padding-top: max(20px, env(safe-area-inset-top));
    }
    
    .safe-area-bottom {
      padding-bottom: max(20px, env(safe-area-inset-bottom));
    }
  }
`;
