// src/styles/GlobalStyles.ts
import { createGlobalStyle } from 'styled-components';
import type { ThemeType } from './theme';

export const GlobalStyle = createGlobalStyle<{ theme: ThemeType }>`
  * {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
    -webkit-tap-highlight-color: transparent;
  }

  body {
    font-family: ${({ theme }) => theme.fonts.main};
    background: ${({ theme }) => theme.colors.bodyBackground};
    min-height: 100vh;
    padding: 20px;

    @media (max-width: 768px) {
      padding: 0;
    }
  }

  #root {
    display: flex;
    flex-direction: column;
    min-height: 100vh;
  }
`;