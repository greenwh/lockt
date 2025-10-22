// src/styles/GlobalStyles.ts

import { createGlobalStyle } from 'styled-components';
import { theme } from './theme';

export const GlobalStyles = createGlobalStyle`
  body {
    margin: 0;
    font-family: ${theme.fonts.main};
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
    background-color: ${theme.colors.light};
    color: ${theme.colors.dark};
  }

  * {
    box-sizing: border-box;
  }
`;
