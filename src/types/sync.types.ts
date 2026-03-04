// src/types/sync.types.ts

export type SyncStatus = 'idle' | 'syncing' | 'success' | 'error' | 'offline' | 'conflict';

export interface SyncState {
  status: SyncStatus;
  lastSyncTime: number | null;
  error: string | null;
  isOneDriveConnected: boolean;
  accountName: string | null;
  isSyncing: boolean;
}

export interface SyncSettings {
  autoSync: boolean;
  syncInterval: number; // in minutes
  syncOnStart: boolean;
  wifiOnly: boolean;
}

export interface ConflictResolution {
  action: 'use-local' | 'use-remote' | 'manual';
  localTimestamp: number;
  remoteTimestamp: number;
}

export type SyncLogAction =
  | 'upload'
  | 'download'
  | 'conflict-resolved-local'
  | 'conflict-resolved-remote'
  | 'conflict-resolved-merge'
  | 'auto-connect'
  | 'error'
  | 'force-upload'
  | 'force-download';

export interface SyncLogEntry {
  id: string;
  timestamp: number;
  action: SyncLogAction;
  deviceId: string;
  summary: string;
  error?: string;
}
