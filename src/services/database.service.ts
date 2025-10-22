// src/services/database.service.ts

import { openDB, DBSchema, IDBPDatabase } from 'idb';
import type { EncryptedData } from '../types/data.types';

interface LocktDB extends DBSchema {
  'encrypted-data': {
    key: string;
    value: EncryptedData;
  };
  'app-config': {
    key: string;
    value: any;
  };
}

class DatabaseService {
  private db: IDBPDatabase<LocktDB> | null = null;
  private readonly DB_NAME = 'lockt-db';
  private readonly DB_VERSION = 1;

  /**
   * Initialize database connection
   */
  async init(): Promise<void> {
    if (this.db) return;

    this.db = await openDB<LocktDB>(this.DB_NAME, this.DB_VERSION, {
      upgrade(db) {
        // Create object stores if they don't exist
        if (!db.objectStoreNames.contains('encrypted-data')) {
          db.createObjectStore('encrypted-data');
        }
        if (!db.objectStoreNames.contains('app-config')) {
          db.createObjectStore('app-config');
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
}

export const databaseService = new DatabaseService();
