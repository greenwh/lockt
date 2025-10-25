import React from 'react';
import ReactDOM from 'react-dom/client';
import { ThemeProvider } from 'styled-components';
import App from './App';
import { GlobalStyle } from './styles/GlobalStyles';
import { theme } from './styles/theme';
import { SyncProvider } from './context/SyncContext';
import { AuthProvider } from './context/AuthContext';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <ThemeProvider theme={theme}>
      <GlobalStyle />
      <AuthProvider>
        <SyncProvider>
          <App />
        </SyncProvider>
      </AuthProvider>
    </ThemeProvider>
  </React.StrictMode>
);

