// src/context/SyncContext.tsx

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { oneDriveService } from '../services/onedrive.service';
import { syncService } from '../services/sync.service';
import type { SyncState, SyncSettings } from '../types/sync.types';
import type { AccountInfo } from '@azure/msal-browser';

interface SyncContextType {
  syncState: SyncState;
  signIn: () => Promise<void>;
  signOut: () => Promise<void>;
  performSync: () => Promise<void>;
  forceUpload: () => Promise<void>;
  forceDownload: () => Promise<void>;
  updateSettings: (settings: Partial<SyncSettings>) => Promise<void>;
  getSettings: () => Promise<SyncSettings>;
}

const SyncContext = createContext<SyncContextType | undefined>(undefined);

export const SyncProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [syncState, setSyncState] = useState<SyncState>({
    status: 'idle',
    lastSyncTime: null,
    error: null,
    isOneDriveConnected: false,
    accountName: null,
    isSyncing: false,
  });

  // Initialize sync service and check for existing session
  useEffect(() => {
    const initialize = async () => {
      try {
        await syncService.init();

        // Check if already signed in
        const account = oneDriveService.getAccount();
        if (account) {
          const lastSyncTime = await syncService.getLastSyncTime();
          setSyncState((prev) => ({
            ...prev,
            isOneDriveConnected: true,
            accountName: account.username,
            lastSyncTime,
            status: 'idle',
          }));
        }

        // Listen for online/offline events
        const handleOnline = () => {
          setSyncState((prev) => ({ ...prev, status: prev.status === 'offline' ? 'idle' : prev.status }));
        };

        const handleOffline = () => {
          setSyncState((prev) => ({ ...prev, status: 'offline' }));
        };

        window.addEventListener('online', handleOnline);
        window.addEventListener('offline', handleOffline);

        // Set initial offline state
        if (!navigator.onLine) {
          setSyncState((prev) => ({ ...prev, status: 'offline' }));
        }

        return () => {
          window.removeEventListener('online', handleOnline);
          window.removeEventListener('offline', handleOffline);
        };
      } catch (error) {
        console.error('Sync initialization failed:', error);
        setSyncState((prev) => ({
          ...prev,
          status: 'error',
          error: 'Failed to initialize sync service',
        }));
      }
    };

    initialize();
  }, []);

  const signIn = useCallback(async () => {
    try {
      setSyncState((prev) => ({ ...prev, isSyncing: true, status: 'syncing' }));
      const account: AccountInfo = await oneDriveService.signIn();

      setSyncState((prev) => ({
        ...prev,
        isOneDriveConnected: true,
        accountName: account.username,
        status: 'success',
        isSyncing: false,
      }));

      // Perform initial sync after sign-in
      await performSync();
    } catch (error) {
      console.error('Sign in failed:', error);
      setSyncState((prev) => ({
        ...prev,
        status: 'error',
        error: error instanceof Error ? error.message : 'Sign in failed',
        isSyncing: false,
      }));
    }
  }, []);

  const signOut = useCallback(async () => {
    try {
      await oneDriveService.signOut();
      setSyncState({
        status: 'idle',
        lastSyncTime: null,
        error: null,
        isOneDriveConnected: false,
        accountName: null,
        isSyncing: false,
      });
    } catch (error) {
      console.error('Sign out failed:', error);
      setSyncState((prev) => ({
        ...prev,
        status: 'error',
        error: error instanceof Error ? error.message : 'Sign out failed',
      }));
    }
  }, []);

  const performSync = useCallback(async () => {
    try {
      setSyncState((prev) => ({ ...prev, isSyncing: true, status: 'syncing', error: null }));

      const result = await syncService.sync();

      if (result.success) {
        const lastSyncTime = await syncService.getLastSyncTime();
        setSyncState((prev) => ({
          ...prev,
          status: 'success',
          lastSyncTime,
          error: null,
          isSyncing: false,
        }));

        // Reset to idle after 3 seconds
        setTimeout(() => {
          setSyncState((prev) => ({ ...prev, status: 'idle' }));
        }, 3000);
      } else {
        setSyncState((prev) => ({
          ...prev,
          status: result.action === 'conflict' ? 'conflict' : 'error',
          error: result.error || 'Sync failed',
          isSyncing: false,
        }));
      }
    } catch (error) {
      console.error('Sync failed:', error);
      setSyncState((prev) => ({
        ...prev,
        status: 'error',
        error: error instanceof Error ? error.message : 'Sync failed',
        isSyncing: false,
      }));
    }
  }, []);

  const forceUpload = useCallback(async () => {
    try {
      setSyncState((prev) => ({ ...prev, isSyncing: true, status: 'syncing', error: null }));

      const result = await syncService.forceUpload();

      if (result.success) {
        const lastSyncTime = await syncService.getLastSyncTime();
        setSyncState((prev) => ({
          ...prev,
          status: 'success',
          lastSyncTime,
          error: null,
          isSyncing: false,
        }));

        setTimeout(() => {
          setSyncState((prev) => ({ ...prev, status: 'idle' }));
        }, 3000);
      } else {
        setSyncState((prev) => ({
          ...prev,
          status: 'error',
          error: result.error || 'Upload failed',
          isSyncing: false,
        }));
      }
    } catch (error) {
      console.error('Force upload failed:', error);
      setSyncState((prev) => ({
        ...prev,
        status: 'error',
        error: error instanceof Error ? error.message : 'Upload failed',
        isSyncing: false,
      }));
    }
  }, []);

  const forceDownload = useCallback(async () => {
    try {
      setSyncState((prev) => ({ ...prev, isSyncing: true, status: 'syncing', error: null }));

      const result = await syncService.forceDownload();

      if (result.success) {
        const lastSyncTime = await syncService.getLastSyncTime();
        setSyncState((prev) => ({
          ...prev,
          status: 'success',
          lastSyncTime,
          error: null,
          isSyncing: false,
        }));

        setTimeout(() => {
          setSyncState((prev) => ({ ...prev, status: 'idle' }));
        }, 3000);
      } else {
        setSyncState((prev) => ({
          ...prev,
          status: 'error',
          error: result.error || 'Download failed',
          isSyncing: false,
        }));
      }
    } catch (error) {
      console.error('Force download failed:', error);
      setSyncState((prev) => ({
        ...prev,
        status: 'error',
        error: error instanceof Error ? error.message : 'Download failed',
        isSyncing: false,
      }));
    }
  }, []);

  const updateSettings = useCallback(async (settings: Partial<SyncSettings>) => {
    try {
      await syncService.updateSettings(settings);
    } catch (error) {
      console.error('Failed to update settings:', error);
      throw error;
    }
  }, []);

  const getSettings = useCallback(async () => {
    return await syncService.getSettings();
  }, []);

  return (
    <SyncContext.Provider
      value={{
        syncState,
        signIn,
        signOut,
        performSync,
        forceUpload,
        forceDownload,
        updateSettings,
        getSettings,
      }}
    >
      {children}
    </SyncContext.Provider>
  );
};

export const useSync = () => {
  const context = useContext(SyncContext);
  if (context === undefined) {
    throw new Error('useSync must be used within a SyncProvider');
  }
  return context;
};
