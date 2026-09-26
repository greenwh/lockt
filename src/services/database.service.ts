// src/services/database.service.ts

import { openDB } from 'idb';
import type { DBSchema, IDBPDatabase } from 'idb';
import type { EncryptedData } from '../types/data.types';
import type { BiometricCredential } from './webauthn.service';
import { saltRecoveryService } from './saltRecovery.service';

interface LocktDB extends DBSchema {
  'encrypted-data': {
    key: string;
    value: EncryptedData;
  };
  'app-config': {
    key: string;
    value: any;
  };
  'biometric-credentials': {
    key: string; // credential ID
    value: BiometricCredential;
  };
}

class DatabaseService {
  private db: IDBPDatabase<LocktDB> | null = null;
  private vaultListeners = new Set<() => void>();

  /**
   * Subscribe to changes of the stored vault (edits, sync downloads, password
   * change, restore). Returns an unsubscribe function.
   */
  onVaultChanged(listener: () => void): () => void {
    this.vaultListeners.add(listener);
    return () => this.vaultListeners.delete(listener);
  }

  private notifyVaultChanged(): void {
    this.vaultListeners.forEach((listener) => {
      try {
        listener();
      } catch (error) {
        console.error('Vault change listener failed:', error);
      }
    });
  }
  private readonly DB_NAME = 'lockt-db';
  private readonly DB_VERSION = 2; // Incremented for biometric credentials

  /**
   * Initialize database connection
   */
  async init(): Promise<void> {
    if (this.db) return;

    this.db = await openDB<LocktDB>(this.DB_NAME, this.DB_VERSION, {
      upgrade(db, oldVersion) {
        // Create object stores if they don't exist
        if (!db.objectStoreNames.contains('encrypted-data')) {
          db.createObjectStore('encrypted-data');
        }
        if (!db.objectStoreNames.contains('app-config')) {
          db.createObjectStore('app-config');
        }
        // Version 2: Add biometric credentials store
        if (oldVersion < 2 && !db.objectStoreNames.contains('biometric-credentials')) {
          db.createObjectStore('biometric-credentials');
        }
      },
    });
  }

  /**
   * Save encrypted data blob
   */
  async saveEncryptedData(data: EncryptedData): Promise<void> {
    await this.init();
    await this.db!.put('encrypted-data', data, 'main');
    this.notifyVaultChanged();
  }

  /**
   * Retrieve encrypted data blob
   */
  async getEncryptedData(): Promise<EncryptedData | undefined> {
    await this.init();
    return this.db!.get('encrypted-data', 'main');
  }

  /**
   * Check if encrypted data exists (first-time setup check)
   */
  async hasEncryptedData(): Promise<boolean> {
    await this.init();
    const data = await this.db!.get('encrypted-data', 'main');
    return data !== undefined;
  }

  /**
   * Save configuration value
   */
  async setConfig(key: string, value: any): Promise<void> {
    await this.init();
    await this.db!.put('app-config', value, key);

    // If saving salt, also backup to localStorage and OneDrive
    if (key === 'salt' && typeof value === 'string') {
      console.log('database.service: Saving salt, triggering backups...');
      await saltRecoveryService.saveSaltBackups(value);
      console.log('database.service: Salt backups completed');
    }

    // Recovery-phrase escrow changed (setup / password change): back it up to
    // OneDrive alongside the salt it belongs to, so the recovery phrase works on
    // a new device. Salt is always written before the escrow by callers.
    if (key === 'encryptedPassword' && value) {
      const salt = await this.getConfig('salt');
      if (typeof salt === 'string') {
        await saltRecoveryService.saveSaltBackups(salt, value);
      }
    }
  }

  /**
   * Delete a configuration value
   */
  async deleteConfig(key: string): Promise<void> {
    await this.init();
    await this.db!.delete('app-config', key);
  }

  /**
   * Ensure this device has a device ID (set at account creation; missing on
   * devices set up via recovery or restore, which breaks biometric enrollment).
   */
  async ensureDeviceId(): Promise<string> {
    const existing = await this.getConfig('deviceId');
    if (typeof existing === 'string' && existing) return existing;
    const deviceId = crypto.getRandomValues(new Uint8Array(16)).toString();
    await this.setConfig('deviceId', deviceId);
    return deviceId;
  }

  /**
   * Atomically replace the vault with a restored one (single transaction, so an
   * interrupted restore never leaves a vault paired with the wrong salt).
   * lastSyncTime is cleared so the next sync compares timestamps instead of
   * reporting a false conflict. Does NOT trigger cloud salt backups — the
   * caller does that after the transaction commits.
   */
  async restoreVault(params: {
    vault: EncryptedData;
    lastModified: number;
    encryptedPassword: EncryptedData | null;
    clearBiometrics: boolean;
  }): Promise<void> {
    await this.init();
    const tx = this.db!.transaction(['encrypted-data', 'app-config', 'biometric-credentials'], 'readwrite');
    const config = tx.objectStore('app-config');
    await Promise.all([
      tx.objectStore('encrypted-data').put(params.vault, 'main'),
      config.put(params.vault.salt, 'salt'),
      config.put(params.lastModified, 'lastModified'),
      config.delete('lastSyncTime'),
      // Keep an existing escrow if the backup has none: unlock tries every
      // escrow candidate, so a stale one can't lock the user out.
      params.encryptedPassword ? config.put(params.encryptedPassword, 'encryptedPassword') : Promise.resolve(),
      params.clearBiometrics ? tx.objectStore('biometric-credentials').clear() : Promise.resolve(),
      tx.done,
    ]);
    this.notifyVaultChanged();

    await this.ensureDeviceId();
  }

  /**
   * Retrieve configuration value
   */
  async getConfig(key: string): Promise<any> {
    await this.init();
    return this.db!.get('app-config', key);
  }

  /**
   * Delete all data (for app reset)
   */
  async clearAll(): Promise<void> {
    await this.init();
    await this.db!.clear('encrypted-data');
    this.notifyVaultChanged();
    await this.db!.clear('app-config');
    // Also clear biometric credentials, which hold an encrypted copy of the
    // master password — leaving these behind after a reset is a security leak.
    await this.db!.clear('biometric-credentials');

    // Also clear salt backups
    await saltRecoveryService.clearAllBackups();
  }

  /**
   * Attempt to recover salt from backup locations
   * Used when IndexedDB salt is missing
   */
  async recoverSalt(): Promise<string | null> {
    console.log('Attempting to recover salt from backups...');

    // First check if salt exists in IndexedDB
    const existingSalt = await this.getConfig('salt');
    if (existingSalt) {
      console.log('Salt found in IndexedDB, no recovery needed');
      return existingSalt;
    }

    // Attempt recovery from backups
    const recoveredSalt = await saltRecoveryService.recoverSalt();

    if (recoveredSalt) {
      // Restore to IndexedDB
      await this.setConfig('salt', recoveredSalt);
      await this.ensureDeviceId();
      console.log('Salt successfully recovered and restored to IndexedDB');
      return recoveredSalt;
    }

    console.log('Salt recovery failed - no backups available');
    return null;
  }

  /**
   * Check salt backup status
   */
  async getSaltBackupStatus(): Promise<{
    indexedDB: boolean;
    localStorage: boolean;
    oneDrive: boolean;
  }> {
    const indexedDBSalt = await this.getConfig('salt');
    const backups = await saltRecoveryService.hasBackups();

    return {
      indexedDB: !!indexedDBSalt,
      localStorage: backups.localStorage,
      oneDrive: backups.oneDrive,
    };
  }

  /**
   * Biometric Credentials Management
   */

  /**
   * Save a biometric credential
   */
  async saveBiometricCredential(credential: BiometricCredential): Promise<void> {
    await this.init();
    await this.db!.put('biometric-credentials', credential, credential.id);
  }

  /**
   * Get all biometric credentials
   */
  async getBiometricCredentials(): Promise<BiometricCredential[]> {
    await this.init();
    return this.db!.getAll('biometric-credentials');
  }

  /**
   * Get a specific biometric credential by ID
   */
  async getBiometricCredential(id: string): Promise<BiometricCredential | undefined> {
    await this.init();
    return this.db!.get('biometric-credentials', id);
  }

  /**
   * Update last used timestamp for a credential
   */
  async updateCredentialLastUsed(id: string): Promise<void> {
    await this.init();
    const credential = await this.getBiometricCredential(id);
    if (credential) {
      credential.lastUsedAt = Date.now();
      await this.saveBiometricCredential(credential);
    }
  }

  /**
   * Delete a biometric credential
   */
  async deleteBiometricCredential(id: string): Promise<void> {
    await this.init();
    await this.db!.delete('biometric-credentials', id);
  }

  /**
   * Check if any biometric credentials exist
   */
  async hasBiometricCredentials(): Promise<boolean> {
    await this.init();
    const credentials = await this.getBiometricCredentials();
    return credentials.length > 0;
  }

  /**
   * Delete all biometric credentials
   */
  async clearBiometricCredentials(): Promise<void> {
    await this.init();
    await this.db!.clear('biometric-credentials');
  }
}

export const databaseService = new DatabaseService();
