// src/components/layout/AppShell.tsx
import React from 'react';
import { AppContainer, AppHeader, AppContent } from './AppShell.styled';

const AppShell: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <AppContainer>
      <AppHeader>
        <h1>Lockt</h1>
        <p>Secure. Private. Yours.</p>
      </AppHeader>
      <AppContent>{children}</AppContent>
    </AppContainer>
  );
};

export default AppShell;
