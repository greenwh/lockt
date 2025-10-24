import React from 'react';
import ReactDOM from 'react-dom/client';
import { ThemeProvider } from 'styled-components';
import App from './App';
import { GlobalStyle } from './styles/GlobalStyles';
import { theme } from './styles/theme';
import { SyncProvider } from './context/SyncContext';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <ThemeProvider theme={theme}>
      <GlobalStyle />
      <SyncProvider>
        <App />
      </SyncProvider>
    </ThemeProvider>
  </React.StrictMode>
);

