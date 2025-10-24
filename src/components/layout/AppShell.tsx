// src/components/layout/AppShell.tsx
import React, { useState } from 'react';
import { AppContainer, AppHeader, AppContent, HeaderActions, SettingsButton } from './AppShell.styled';
import SyncStatus from '../sync/SyncStatus';
import Modal from '../common/Modal';
import SyncSettings from '../sync/SyncSettings';

const AppShell: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [showSettings, setShowSettings] = useState(false);

  return (
    <AppContainer>
      <AppHeader>
        <HeaderActions>
          <SyncStatus />
          <SettingsButton onClick={() => setShowSettings(true)}>⚙️ Settings</SettingsButton>
        </HeaderActions>
        <h1>Lockt</h1>
        <p>Secure. Private. Yours.</p>
      </AppHeader>
      <AppContent>{children}</AppContent>

      <Modal isOpen={showSettings} onClose={() => setShowSettings(false)} title="Sync Settings">
        <SyncSettings onClose={() => setShowSettings(false)} />
      </Modal>
    </AppContainer>
  );
};

export default AppShell;
