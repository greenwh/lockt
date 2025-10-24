// src/components/sync/SyncSettings.tsx
import React, { useState, useEffect } from 'react';
import { useSync } from '../../context/SyncContext';
import type { SyncSettings as SyncSettingsType } from '../../types/sync.types';
import {
  SettingsContainer,
  SettingsSection,
  SettingsLabel,
  SettingsCheckbox,
  SettingsSelect,
  SettingsDescription,
  AccountInfo,
  AccountLabel,
  AccountValue,
  ActionButtons,
  ActionButton,
} from './SyncSettings.styled';

interface SyncSettingsProps {
  onClose: () => void;
}

const SyncSettings: React.FC<SyncSettingsProps> = () => {
  const { syncState, updateSettings, getSettings, forceUpload, forceDownload } = useSync();
  const [settings, setSettings] = useState<SyncSettingsType>({
    autoSync: false,
    syncInterval: 15,
    syncOnStart: true,
    wifiOnly: false,
  });

  useEffect(() => {
    const loadSettings = async () => {
      const currentSettings = await getSettings();
      setSettings(currentSettings);
    };
    loadSettings();
  }, [getSettings]);

  const handleSettingChange = async (key: keyof SyncSettingsType, value: boolean | number) => {
    const newSettings = { ...settings, [key]: value };
    setSettings(newSettings);
    await updateSettings({ [key]: value });
  };

  const handleForceUpload = async () => {
    if (window.confirm('This will overwrite cloud data with local data. Continue?')) {
      await forceUpload();
    }
  };

  const handleForceDownload = async () => {
    if (
      window.confirm(
        'This will overwrite local data with cloud data. Any unsaved local changes will be lost. Continue?'
      )
    ) {
      await forceDownload();
    }
  };

  return (
    <SettingsContainer>
      <h2>Sync Settings</h2>

      {syncState.isOneDriveConnected && (
        <AccountInfo>
          <AccountLabel>Connected Account</AccountLabel>
          <AccountValue>{syncState.accountName || 'Unknown'}</AccountValue>
          {syncState.lastSyncTime && (
            <>
              <AccountLabel style={{ marginTop: '8px' }}>Last Sync</AccountLabel>
              <AccountValue>{new Date(syncState.lastSyncTime).toLocaleString()}</AccountValue>
            </>
          )}
        </AccountInfo>
      )}

      <SettingsSection>
        <SettingsLabel>
          <SettingsCheckbox
            type="checkbox"
            checked={settings.autoSync}
            onChange={(e) => handleSettingChange('autoSync', e.target.checked)}
          />
          Enable automatic sync
        </SettingsLabel>
        <SettingsDescription>
          Automatically sync your data with OneDrive at regular intervals
        </SettingsDescription>
      </SettingsSection>

      {settings.autoSync && (
        <SettingsSection>
          <SettingsLabel>
            Sync interval
            <SettingsSelect
              value={settings.syncInterval}
              onChange={(e) => handleSettingChange('syncInterval', parseInt(e.target.value))}
            >
              <option value="5">Every 5 minutes</option>
              <option value="15">Every 15 minutes</option>
              <option value="30">Every 30 minutes</option>
              <option value="60">Every hour</option>
            </SettingsSelect>
          </SettingsLabel>
          <SettingsDescription>How often to sync when auto-sync is enabled</SettingsDescription>
        </SettingsSection>
      )}

      <SettingsSection>
        <SettingsLabel>
          <SettingsCheckbox
            type="checkbox"
            checked={settings.syncOnStart}
            onChange={(e) => handleSettingChange('syncOnStart', e.target.checked)}
          />
          Sync on app start
        </SettingsLabel>
        <SettingsDescription>Automatically sync when you open the app</SettingsDescription>
      </SettingsSection>

      <SettingsSection>
        <SettingsLabel>
          <SettingsCheckbox
            type="checkbox"
            checked={settings.wifiOnly}
            onChange={(e) => handleSettingChange('wifiOnly', e.target.checked)}
          />
          Sync on Wi-Fi only
        </SettingsLabel>
        <SettingsDescription>Only sync when connected to Wi-Fi (saves mobile data)</SettingsDescription>
      </SettingsSection>

      {syncState.isOneDriveConnected && (
        <ActionButtons>
          <ActionButton onClick={handleForceUpload} disabled={syncState.isSyncing}>
            ⬆️ Force Upload
          </ActionButton>
          <ActionButton onClick={handleForceDownload} disabled={syncState.isSyncing}>
            ⬇️ Force Download
          </ActionButton>
        </ActionButtons>
      )}
    </SettingsContainer>
  );
};

export default SyncSettings;
