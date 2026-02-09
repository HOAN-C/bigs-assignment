/**
 * 앱 전역 스타일.
 *
 * CSS 리셋, 기본 폰트, body 배경/텍스트 색상을 테마에 맞춰 설정한다.
 * ThemeProvider 하위에서 사용되므로 theme 변수를 직접 참조할 수 있다.
 */
import { createGlobalStyle } from 'styled-components';

const GlobalStyle = createGlobalStyle`
  *, *::before, *::after {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
  }

  html {
    font-size: 16px;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
  }

  body {
    font-family: ${({ theme }) => theme.fonts.primary};
    background-color: ${({ theme }) => theme.colors.bgPrimary};
    color: ${({ theme }) => theme.colors.textPrimary};
    line-height: 1.5;
    transition: background-color 0.2s ease, color 0.2s ease;
  }

  a {
    text-decoration: none;
    color: inherit;
  }

  button {
    border: none;
    background: none;
    cursor: pointer;
    font-family: inherit;
  }

  input, textarea, select {
    font-family: inherit;
    outline: none;
  }

  img {
    max-width: 100%;
    display: block;
  }
`;

export default GlobalStyle;
