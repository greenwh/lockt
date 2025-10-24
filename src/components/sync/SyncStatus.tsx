// src/components/sync/SyncStatus.tsx
import React from 'react';
import { useSync } from '../../context/SyncContext';
import {
  SyncStatusContainer,
  StatusIcon,
  StatusText,
  LastSyncTime,
  SyncButton,
} from './SyncStatus.styled';

const SyncStatus: React.FC = () => {
  const { syncState, performSync, signIn, signOut } = useSync();

  const getStatusIcon = () => {
    switch (syncState.status) {
      case 'syncing':
        return '🔄';
      case 'success':
        return '✅';
      case 'error':
      case 'conflict':
        return '⚠️';
      case 'offline':
        return '📡';
      default:
        return '☁️';
    }
  };

  const getStatusText = () => {
    if (!syncState.isOneDriveConnected) {
      return 'Not connected to OneDrive';
    }

    switch (syncState.status) {
      case 'syncing':
        return 'Syncing...';
      case 'success':
        return 'Synced';
      case 'error':
        return syncState.error || 'Sync error';
      case 'conflict':
        return 'Sync conflict';
      case 'offline':
        return 'Offline';
      default:
        return 'Ready to sync';
    }
  };

  const formatLastSyncTime = () => {
    if (!syncState.lastSyncTime) return '';

    const now = Date.now();
    const diff = now - syncState.lastSyncTime;
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (days > 0) return `${days}d ago`;
    if (hours > 0) return `${hours}h ago`;
    if (minutes > 0) return `${minutes}m ago`;
    return 'Just now';
  };

  const handleSyncClick = async () => {
    if (!syncState.isOneDriveConnected) {
      await signIn();
    } else {
      await performSync();
    }
  };

  return (
    <SyncStatusContainer>
      <StatusIcon status={syncState.status}>{getStatusIcon()}</StatusIcon>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
        <StatusText status={syncState.status}>{getStatusText()}</StatusText>
        {syncState.lastSyncTime && <LastSyncTime>{formatLastSyncTime()}</LastSyncTime>}
        {syncState.accountName && (
          <LastSyncTime title={syncState.accountName}>
            {syncState.accountName.substring(0, 20)}
            {syncState.accountName.length > 20 ? '...' : ''}
          </LastSyncTime>
        )}
      </div>
      {syncState.isOneDriveConnected ? (
        <>
          <SyncButton
            onClick={handleSyncClick}
            disabled={syncState.isSyncing || syncState.status === 'offline'}
            title="Sync now"
          >
            🔄
          </SyncButton>
          <SyncButton onClick={signOut} disabled={syncState.isSyncing} title="Disconnect OneDrive">
            🚪
          </SyncButton>
        </>
      ) : (
        <SyncButton onClick={handleSyncClick} title="Connect to OneDrive">
          🔗
        </SyncButton>
      )}
    </SyncStatusContainer>
  );
};

export default SyncStatus;
