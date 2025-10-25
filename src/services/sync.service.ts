// src/services/sync.service.ts

import { oneDriveService } from './onedrive.service';
import { databaseService } from './database.service';
import type { SyncSettings } from '../types/sync.types';

class SyncService {
  private syncInProgress = false;
  private autoSyncInterval: NodeJS.Timeout | null = null;

  /**
   * Initialize sync service
   */
  async init(): Promise<void> {
    await oneDriveService.init();

    // Load sync settings
    const settings = await this.getSettings();
    if (settings.autoSync) {
      this.startAutoSync(settings.syncInterval);
    }

    // Sync on start if enabled
    if (settings.syncOnStart && oneDriveService.isSignedIn()) {
      // Don't block initialization, sync in background
      this.sync().catch(console.error);
    }
  }

  /**
   * Perform full sync operation
   */
  async sync(): Promise<{
    success: boolean;
    action: 'upload' | 'download' | 'conflict' | 'none';
    error?: string;
  }> {
    if (this.syncInProgress) {
      return { success: false, action: 'none', error: 'Sync already in progress' };
    }

    if (!oneDriveService.isSignedIn()) {
      return { success: false, action: 'none', error: 'Not signed in to OneDrive' };
    }

    if (!oneDriveService.isOnline()) {
      return { success: false, action: 'none', error: 'Device is offline' };
    }

    this.syncInProgress = true;

    try {
      // Initialize database first
      await databaseService.init();

      // Get local encrypted data
      const localEncrypted = await databaseService.getEncryptedData();
      const localTimestamp = (await databaseService.getConfig('lastModified')) || 0;

      // Compare with remote
      const syncResult = await oneDriveService.sync(localEncrypted || null, localTimestamp);

      switch (syncResult.action) {
        case 'upload':
          if (localEncrypted) {
            await oneDriveService.uploadData(localEncrypted);
            await databaseService.setConfig('lastSyncTime', Date.now());
          }
          break;

        case 'download':
          if (syncResult.remoteData) {
            await databaseService.saveEncryptedData(syncResult.remoteData);
            await databaseService.setConfig('lastModified', syncResult.remoteTimestamp);
            await databaseService.setConfig('lastSyncTime', Date.now());
          }
          break;

        case 'conflict':
          // Handle conflict - for now, use most recent
          // In future, could prompt user
          return { success: false, action: 'conflict', error: 'Sync conflict detected' };

        case 'none':
          await databaseService.setConfig('lastSyncTime', Date.now());
          break;
      }

      return { success: true, action: syncResult.action };
    } catch (error) {
      console.error('Sync failed:', error);
      return {
        success: false,
        action: 'none',
        error: error instanceof Error ? error.message : 'Unknown sync error',
      };
    } finally {
      this.syncInProgress = false;
    }
  }

  /**
   * Manual upload to OneDrive (force upload local data)
   */
  async forceUpload(): Promise<{ success: boolean; error?: string }> {
    if (!oneDriveService.isSignedIn()) {
      return { success: false, error: 'Not signed in to OneDrive' };
    }

    try {
      // Initialize database first
      await databaseService.init();

      const localEncrypted = await databaseService.getEncryptedData();
      if (!localEncrypted) {
        return { success: false, error: 'No local data to upload' };
      }

      await oneDriveService.uploadData(localEncrypted);
      await databaseService.setConfig('lastSyncTime', Date.now());
      await databaseService.setConfig('lastModified', Date.now());

      return { success: true };
    } catch (error) {
      console.error('Force upload failed:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Upload failed',
      };
    }
  }

  /**
   * Manual download from OneDrive (force download remote data)
   */
  async forceDownload(): Promise<{ success: boolean; error?: string }> {
    if (!oneDriveService.isSignedIn()) {
      return { success: false, error: 'Not signed in to OneDrive' };
    }

    try {
      // Initialize database first
      await databaseService.init();

      const remoteData = await oneDriveService.downloadData();
      if (!remoteData) {
        return { success: false, error: 'No remote data found' };
      }

      await databaseService.saveEncryptedData(remoteData);
      await databaseService.setConfig('lastSyncTime', Date.now());
      await databaseService.setConfig('lastModified', Date.now());

      return { success: true };
    } catch (error) {
      console.error('Force download failed:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Download failed',
      };
    }
  }

  /**
   * Get sync settings
   */
  async getSettings(): Promise<SyncSettings> {
    const settings = await databaseService.getConfig('syncSettings');
    return (
      settings || {
        autoSync: false,
        syncInterval: 15, // 15 minutes
        syncOnStart: true,
        wifiOnly: false,
      }
    );
  }

  /**
   * Update sync settings
   */
  async updateSettings(settings: Partial<SyncSettings>): Promise<void> {
    const currentSettings = await this.getSettings();
    const newSettings = { ...currentSettings, ...settings };
    await databaseService.setConfig('syncSettings', newSettings);

    // Update auto-sync
    if (newSettings.autoSync) {
      this.startAutoSync(newSettings.syncInterval);
    } else {
      this.stopAutoSync();
    }
  }

  /**
   * Start automatic sync
   */
  private startAutoSync(intervalMinutes: number): void {
    this.stopAutoSync();

    const intervalMs = intervalMinutes * 60 * 1000;
    this.autoSyncInterval = setInterval(() => {
      if (oneDriveService.isSignedIn() && oneDriveService.isOnline()) {
        this.sync().catch(console.error);
      }
    }, intervalMs);
  }

  /**
   * Stop automatic sync
   */
  private stopAutoSync(): void {
    if (this.autoSyncInterval) {
      clearInterval(this.autoSyncInterval);
      this.autoSyncInterval = null;
    }
  }

  /**
   * Get last sync time
   */
  async getLastSyncTime(): Promise<number | null> {
    return await databaseService.getConfig('lastSyncTime');
  }

  /**
   * Check if sync is in progress
   */
  isSyncing(): boolean {
    return this.syncInProgress;
  }
}

export const syncService = new SyncService();
