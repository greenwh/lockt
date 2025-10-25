// src/services/saltRecovery.service.ts

import { oneDriveService } from './onedrive.service';

/**
 * Salt Recovery Service
 *
 * Ensures salt is backed up in multiple locations for account recovery:
 * 1. IndexedDB (primary storage)
 * 2. localStorage (survives IndexedDB clear)
 * 3. OneDrive metadata file (recovery from new device)
 */
class SaltRecoveryService {
  private readonly SALT_METADATA_FILE = 'lockt-salt-metadata.json';
  private readonly LOCAL_STORAGE_KEY = 'lockt-salt-backup';
  private readonly GRAPH_ENDPOINT = 'https://graph.microsoft.com/v1.0';

  /**
   * Save salt to all backup locations
   */
  async saveSaltBackups(salt: string): Promise<void> {
    try {
      console.log('saltRecoveryService: Starting salt backups...');

      // 1. Save to localStorage (survives IndexedDB deletion)
      this.saveToLocalStorage(salt);
      console.log('saltRecoveryService: localStorage backup complete');

      // 2. Save to OneDrive (if connected)
      if (oneDriveService.isSignedIn()) {
        console.log('saltRecoveryService: OneDrive is signed in, saving backup...');
        await this.saveToOneDrive(salt);
      } else {
        console.log('saltRecoveryService: OneDrive not signed in, skipping cloud backup');
      }
    } catch (error) {
      console.error('Failed to save salt backups:', error);
      // Don't throw - main salt storage already succeeded
    }
  }

  /**
   * Save salt to localStorage
   */
  private saveToLocalStorage(salt: string): void {
    try {
      localStorage.setItem(this.LOCAL_STORAGE_KEY, salt);
      console.log('Salt backed up to localStorage');
    } catch (error) {
      console.error('Failed to save salt to localStorage:', error);
    }
  }

  /**
   * Retrieve salt from localStorage
   */
  async getFromLocalStorage(): Promise<string | null> {
    try {
      const salt = localStorage.getItem(this.LOCAL_STORAGE_KEY);
      if (salt) {
        console.log('Salt recovered from localStorage');
      }
      return salt;
    } catch (error) {
      console.error('Failed to retrieve salt from localStorage:', error);
      return null;
    }
  }

  /**
   * Save salt metadata to OneDrive
   */
  private async saveToOneDrive(salt: string): Promise<void> {
    try {
      const token = await this.getAccessToken();
      if (!token) return;

      const metadata = {
        salt,
        createdAt: Date.now(),
        version: 1,
        deviceId: this.getDeviceId(),
      };

      const endpoint = `${this.GRAPH_ENDPOINT}/me/drive/special/approot:/${this.SALT_METADATA_FILE}:/content`;

      const response = await fetch(endpoint, {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(metadata),
      });

      if (response.ok) {
        console.log('Salt metadata backed up to OneDrive');
      } else {
        console.error('Failed to upload salt metadata to OneDrive:', response.statusText);
      }
    } catch (error) {
      console.error('OneDrive salt backup failed:', error);
      // Don't throw - this is a backup operation
    }
  }

  /**
   * Retrieve salt from OneDrive
   */
  async getFromOneDrive(): Promise<string | null> {
    try {
      const token = await this.getAccessToken();
      if (!token) return null;

      const endpoint = `${this.GRAPH_ENDPOINT}/me/drive/special/approot:/${this.SALT_METADATA_FILE}:/content`;

      const response = await fetch(endpoint, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.status === 404) {
        console.log('No salt metadata found on OneDrive');
        return null;
      }

      if (!response.ok) {
        console.error('Failed to download salt metadata from OneDrive:', response.statusText);
        return null;
      }

      const metadata = await response.json();
      console.log('Salt recovered from OneDrive');
      return metadata.salt || null;
    } catch (error) {
      console.error('OneDrive salt recovery failed:', error);
      return null;
    }
  }

  /**
   * Attempt to recover salt from all backup locations
   * Priority: localStorage → OneDrive
   */
  async recoverSalt(): Promise<string | null> {
    console.log('Attempting salt recovery...');

    // Try localStorage first (fastest)
    const localStorageSalt = await this.getFromLocalStorage();
    if (localStorageSalt) {
      return localStorageSalt;
    }

    // Try OneDrive (if signed in)
    if (oneDriveService.isSignedIn()) {
      const oneDriveSalt = await this.getFromOneDrive();
      if (oneDriveSalt) {
        // Restore to localStorage for future use
        this.saveToLocalStorage(oneDriveSalt);
        return oneDriveSalt;
      }
    }

    console.log('Salt recovery failed - no backups found');
    return null;
  }

  /**
   * Clear all salt backups (for app reset)
   */
  async clearAllBackups(): Promise<void> {
    try {
      // Clear localStorage
      localStorage.removeItem(this.LOCAL_STORAGE_KEY);

      // Clear OneDrive (if connected)
      if (oneDriveService.isSignedIn()) {
        await this.deleteFromOneDrive();
      }

      console.log('All salt backups cleared');
    } catch (error) {
      console.error('Failed to clear salt backups:', error);
    }
  }

  /**
   * Delete salt metadata from OneDrive
   */
  private async deleteFromOneDrive(): Promise<void> {
    try {
      const token = await this.getAccessToken();
      if (!token) return;

      const endpoint = `${this.GRAPH_ENDPOINT}/me/drive/special/approot:/${this.SALT_METADATA_FILE}`;

      const response = await fetch(endpoint, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok || response.status === 404) {
        console.log('Salt metadata deleted from OneDrive');
      }
    } catch (error) {
      console.error('Failed to delete salt metadata from OneDrive:', error);
    }
  }

  /**
   * Get access token from OneDrive service
   */
  private async getAccessToken(): Promise<string | null> {
    try {
      if (!oneDriveService.isSignedIn()) {
        return null;
      }
      return await oneDriveService.getToken();
    } catch (error) {
      console.error('Failed to get access token:', error);
      return null;
    }
  }

  /**
   * Get or generate device ID
   */
  private getDeviceId(): string {
    const key = 'lockt-device-id';
    let deviceId = localStorage.getItem(key);

    if (!deviceId) {
      deviceId = this.generateDeviceId();
      localStorage.setItem(key, deviceId);
    }

    return deviceId;
  }

  /**
   * Generate unique device ID
   */
  private generateDeviceId(): string {
    return `device-${Date.now()}-${Math.random().toString(36).substring(2, 15)}`;
  }

  /**
   * Check if salt backups exist
   */
  async hasBackups(): Promise<{
    localStorage: boolean;
    oneDrive: boolean;
  }> {
    const hasLocalStorage = !!(await this.getFromLocalStorage());
    let hasOneDrive = false;

    if (oneDriveService.isSignedIn()) {
      hasOneDrive = !!(await this.getFromOneDrive());
    }

    return {
      localStorage: hasLocalStorage,
      oneDrive: hasOneDrive,
    };
  }
}

export const saltRecoveryService = new SaltRecoveryService();
