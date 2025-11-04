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
    await this.db!.clear('app-config');

    // Also clear salt backups
    await saltRecoveryService.clearAllBackups();
  }

  /**
   * Export encrypted data as downloadable file
   */
  async exportBackup(): Promise<Blob> {
    const data = await this.getEncryptedData();
    if (!data) {
      throw new Error('No data to export');
    }
    
    const config = {
      salt: await this.getConfig('salt'),
      deviceId: await this.getConfig('deviceId'),
      exportDate: Date.now()
    };

    const exportData = {
      ...data,
      config
    };

    return new Blob(
      [JSON.stringify(exportData, null, 2)], 
      { type: 'application/json' }
    );
  }

  /**
   * Import encrypted data from backup file
   */
  async importBackup(fileContent: string): Promise<void> {
    try {
      const importData = JSON.parse(fileContent);

      // Validate structure
      if (!importData.iv || !importData.salt || !importData.ciphertext) {
        throw new Error('Invalid backup file format');
      }

      // Save encrypted data
      await this.saveEncryptedData({
        iv: importData.iv,
        salt: importData.salt,
        ciphertext: importData.ciphertext,
        version: importData.version || 1
      });

      // Restore config if present
      if (importData.config) {
        if (importData.config.salt) {
          await this.setConfig('salt', importData.config.salt);
        }
        if (importData.config.deviceId) {
          await this.setConfig('deviceId', importData.config.deviceId);
        }
      }
    } catch (error) {
      console.error('Import failed:', error);
      throw new Error('Failed to import backup - invalid file format');
    }
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
