// src/App.tsx

import React from 'react';
import { ThemeProvider } from 'styled-components';
import { theme } from './styles/theme';
import { GlobalStyles } from './styles/GlobalStyles';
import SetupScreen from './components/auth/SetupScreen';

const App: React.FC = () => {
  return (
    <ThemeProvider theme={theme}>
      <GlobalStyles />
      <SetupScreen />
    </ThemeProvider>
  );
};

export default App;

