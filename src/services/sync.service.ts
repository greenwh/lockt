// src/services/sync.service.ts

import { oneDriveService } from './onedrive.service';
import { databaseService } from './database.service';
import type { SyncSettings } from '../types/sync.types';

class SyncService {
  private syncInProgress = false;
  private autoSyncInterval: NodeJS.Timeout | null = null;
  private readonly MAX_RETRIES = 3;
  private readonly BASE_DELAY_MS = 2000; // 2 seconds

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
   * Retry wrapper with exponential backoff
   * Delays: 2s, 4s, 8s (3 total attempts)
   */
  private async retryWithBackoff<T>(
    operation: () => Promise<T>,
    operationName: string
  ): Promise<T> {
    let lastError: Error | null = null;

    for (let attempt = 0; attempt < this.MAX_RETRIES; attempt++) {
      try {
        return await operation();
      } catch (error) {
        lastError = error instanceof Error ? error : new Error(String(error));

        // Don't retry on last attempt
        if (attempt === this.MAX_RETRIES - 1) {
          console.error(`${operationName} failed after ${this.MAX_RETRIES} attempts`);
          break;
        }

        // Calculate exponential backoff delay: 2s, 4s, 8s
        const delay = this.BASE_DELAY_MS * Math.pow(2, attempt);
        console.log(
          `${operationName} failed (attempt ${attempt + 1}/${this.MAX_RETRIES}). ` +
          `Retrying in ${delay / 1000}s...`
        );

        // Wait before retry
        await new Promise((resolve) => setTimeout(resolve, delay));
      }
    }

    // All retries exhausted
    throw lastError || new Error(`${operationName} failed`);
  }

  /**
   * Check if error is retryable (for future use)
   */
  // @ts-expect-error - Method reserved for future selective retry logic
  private isRetryableError(error: any): boolean {
    // Don't retry conflicts (user must resolve)
    if (error?.message?.includes('conflict')) {
      return false;
    }

    // Don't retry auth errors (user must sign in)
    if (error?.message?.includes('signed in') || error?.message?.includes('auth')) {
      return false;
    }

    // Retry network errors, timeouts, server errors
    return true;
  }

  /**
   * Perform full sync operation
   */
  async sync(): Promise<{
    success: boolean;
    action: 'upload' | 'download' | 'conflict' | 'none';
    error?: string;
    conflictData?: {
      localData: any;
      localTimestamp: number;
      remoteData: any;
      remoteTimestamp: number;
    };
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

      // Get local encrypted data and timestamps
      const localEncrypted = await databaseService.getEncryptedData();
      const localTimestamp = (await databaseService.getConfig('lastModified')) || 0;
      const lastSyncTime = (await databaseService.getConfig('lastSyncTime')) || undefined;

      // Compare with remote (now with lastSyncTime for conflict detection)
      const syncResult = await oneDriveService.sync(localEncrypted || null, localTimestamp, lastSyncTime);

      switch (syncResult.action) {
        case 'upload':
          if (localEncrypted) {
            // Retry upload with exponential backoff
            await this.retryWithBackoff(
              () => oneDriveService.uploadData(localEncrypted),
              'Upload to OneDrive'
            );
            await databaseService.setConfig('lastSyncTime', Date.now());
          }
          break;

        case 'download':
          if (syncResult.remoteData) {
            // No retry needed for database operations (local only)
            await databaseService.saveEncryptedData(syncResult.remoteData);
            await databaseService.setConfig('lastModified', syncResult.remoteTimestamp);
            await databaseService.setConfig('lastSyncTime', Date.now());
          }
          break;

        case 'conflict':
          // Return conflict data for user resolution
          return {
            success: false,
            action: 'conflict',
            error: 'Sync conflict detected - both local and remote data modified',
            conflictData: {
              localData: syncResult.localData!,
              localTimestamp: syncResult.localTimestamp!,
              remoteData: syncResult.remoteData!,
              remoteTimestamp: syncResult.remoteTimestamp!,
            },
          };

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
   * Resolve conflict by choosing a version
   */
  async resolveConflict(
    action: 'keep-local' | 'download-remote',
    conflictData: {
      localData: any;
      localTimestamp: number;
      remoteData: any;
      remoteTimestamp: number;
    }
  ): Promise<{ success: boolean; error?: string }> {
    try {
      await databaseService.init();

      if (action === 'keep-local') {
        // Upload local version to cloud (overwrite remote)
        await oneDriveService.uploadData(conflictData.localData);
        await databaseService.setConfig('lastSyncTime', Date.now());
        console.log('Conflict resolved: Kept local version');
      } else {
        // Download remote version (overwrite local)
        await databaseService.saveEncryptedData(conflictData.remoteData);
        await databaseService.setConfig('lastModified', conflictData.remoteTimestamp);
        await databaseService.setConfig('lastSyncTime', Date.now());
        console.log('Conflict resolved: Downloaded remote version');
      }

      return { success: true };
    } catch (error) {
      console.error('Conflict resolution failed:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to resolve conflict',
      };
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

      // Retry upload with exponential backoff
      await this.retryWithBackoff(
        () => oneDriveService.uploadData(localEncrypted),
        'Force upload to OneDrive'
      );
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

      // Retry download with exponential backoff
      const remoteData = await this.retryWithBackoff(
        () => oneDriveService.downloadData(),
        'Force download from OneDrive'
      );

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
