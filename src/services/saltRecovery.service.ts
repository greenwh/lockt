// src/services/saltRecovery.service.ts

import { oneDriveService } from './onedrive.service';
import type { EncryptedData } from '../types/data.types';

/**
 * OneDrive recovery metadata (lockt-salt-metadata.json).
 * v2 adds the recovery-phrase escrow of the master password. The escrow is only
 * valid together with the salt it is stored with (both change on password change).
 */
export interface RecoveryMetadata {
  salt: string;
  encryptedPassword?: EncryptedData;
  createdAt: number;
  version: number;
  deviceId?: string;
}

/**
 * Salt Recovery Service
 *
 * Ensures salt is backed up in multiple locations for account recovery:
 * 1. IndexedDB (primary storage)
 * 2. localStorage (survives IndexedDB clear)
 * 3. OneDrive metadata file (recovery from new device), which also carries the
 *    recovery-phrase escrow so the recovery phrase works on a new device
 */
class SaltRecoveryService {
  private readonly SALT_METADATA_FILE = 'lockt-salt-metadata.json';
  private readonly LOCAL_STORAGE_KEY = 'lockt-salt-backup';
  private readonly GRAPH_ENDPOINT = 'https://graph.microsoft.com/v1.0';
  private backfillCheckedKey: string | null = null;

  /**
   * Save salt to all backup locations.
   * @param encryptedPassword recovery-phrase escrow belonging to this salt. When
   *   omitted, an escrow already on OneDrive is kept only if it has the same salt.
   */
  async saveSaltBackups(salt: string, encryptedPassword?: EncryptedData): Promise<void> {
    try {
      console.log('saltRecoveryService: Starting salt backups...');

      // 1. Save to localStorage (survives IndexedDB deletion)
      this.saveToLocalStorage(salt);
      console.log('saltRecoveryService: localStorage backup complete');

      // 2. Save to OneDrive (if connected)
      if (await this.isOneDriveSignedIn()) {
        console.log('saltRecoveryService: OneDrive is signed in, saving backup...');
        await this.saveToOneDrive(salt, encryptedPassword);
      } else {
        console.log('saltRecoveryService: OneDrive not signed in, skipping cloud backup');
      }
    } catch (error) {
      console.error('Failed to save salt backups:', error);
      // Don't throw - main salt storage already succeeded
    }
  }

  /**
   * Fill in missing OneDrive recovery metadata from this device (e.g. accounts
   * created before OneDrive was connected, or before escrow was backed up).
   * Never overwrites an escrow already on OneDrive, and does nothing when OneDrive
   * holds a different salt (another device may have changed the password).
   */
  async backfillOneDriveBackup(salt: string, encryptedPassword: EncryptedData | null): Promise<void> {
    const checkKey = `${salt}|${encryptedPassword?.ciphertext ?? ''}`;
    if (this.backfillCheckedKey === checkKey) return; // Already checked this session
    try {
      if (!(await this.isOneDriveSignedIn())) return;

      const existing = await this.getOneDriveMetadata();
      const otherSalt = !!existing && existing.salt !== salt;
      const nothingToAdd = !!existing && (!!existing.encryptedPassword || !encryptedPassword);
      const upToDate = otherSalt || nothingToAdd || (await this.saveToOneDrive(salt, encryptedPassword ?? undefined));
      if (upToDate) this.backfillCheckedKey = checkKey;
    } catch (error) {
      console.error('OneDrive recovery backfill failed:', error);
    }
  }

  /**
   * Read the OneDrive recovery metadata file. Returns null if it doesn't exist.
   * Throws on network/auth errors.
   */
  async getOneDriveMetadata(): Promise<RecoveryMetadata | null> {
    const metadata = await oneDriveService.downloadAppFile<RecoveryMetadata>(this.SALT_METADATA_FILE);
    if (!metadata || typeof metadata.salt !== 'string' || !metadata.salt) return null;
    return metadata;
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
   * Save salt metadata (and escrow) to OneDrive, merging with what is there.
   * Returns true if OneDrive is up to date afterwards.
   */
  private async saveToOneDrive(salt: string, encryptedPassword?: EncryptedData): Promise<boolean> {
    try {
      const token = await this.getAccessToken();
      if (!token) return false;

      const existing = await this.getOneDriveMetadata();
      const escrow = encryptedPassword ?? (existing?.salt === salt ? existing.encryptedPassword : undefined);

      if (
        existing?.salt === salt &&
        JSON.stringify(existing.encryptedPassword ?? null) === JSON.stringify(escrow ?? null)
      ) {
        return true; // Already up to date
      }

      const metadata: RecoveryMetadata = {
        salt,
        ...(escrow ? { encryptedPassword: escrow } : {}),
        createdAt: Date.now(),
        version: 2,
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
        return true;
      }
      console.error('Failed to upload salt metadata to OneDrive:', response.statusText);
      return false;
    } catch (error) {
      console.error('OneDrive salt backup failed:', error);
      // Don't throw - this is a backup operation
      return false;
    }
  }

  /**
   * Get the recovery-phrase escrow stored on OneDrive, if any.
   */
  async getOneDriveEscrow(): Promise<EncryptedData | null> {
    try {
      if (!(await this.isOneDriveSignedIn())) return null;
      const metadata = await this.getOneDriveMetadata();
      return metadata?.encryptedPassword ?? null;
    } catch (error) {
      console.error('Failed to read recovery data from OneDrive:', error);
      return null;
    }
  }

  /**
   * Retrieve salt from OneDrive.
   * Tries the salt metadata file first, then falls back to the salt embedded in
   * the encrypted vault file ({ iv, salt, ciphertext }). The metadata file is only
   * written if OneDrive was signed in when the salt was saved, so it may be missing
   * even though the vault is in OneDrive.
   */
  async getFromOneDrive(): Promise<string | null> {
    try {
      if (!(await this.isOneDriveSignedIn())) return null;

      const metadata = await this.getOneDriveMetadata();
      if (metadata) {
        console.log('Salt recovered from OneDrive');
        return metadata.salt;
      }

      console.log('No salt metadata found on OneDrive, checking encrypted vault file');
      const vault = await oneDriveService.downloadData();
      if (vault?.salt) {
        console.log('Salt recovered from OneDrive vault file');
        return vault.salt;
      }

      return null;
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
    if (await this.isOneDriveSignedIn()) {
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
      if (await this.isOneDriveSignedIn()) {
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
   * Check OneDrive sign-in, waiting for MSAL initialization first.
   * This service runs during app startup, before SyncContext has initialized MSAL.
   */
  private async isOneDriveSignedIn(): Promise<boolean> {
    try {
      await oneDriveService.init();
      return oneDriveService.isSignedIn();
    } catch (error) {
      console.error('OneDrive initialization failed:', error);
      return false;
    }
  }

  /**
   * Get access token from OneDrive service
   */
  private async getAccessToken(): Promise<string | null> {
    try {
      if (!(await this.isOneDriveSignedIn())) {
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
    return `device-${Date.now()}-${crypto.randomUUID()}`;
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

    if (await this.isOneDriveSignedIn()) {
      hasOneDrive = !!(await this.getFromOneDrive());
    }

    return {
      localStorage: hasLocalStorage,
      oneDrive: hasOneDrive,
    };
  }
}

export const saltRecoveryService = new SaltRecoveryService();
