// src/services/database.service.ts

import { openDB } from 'idb';
import type { DBSchema, IDBPDatabase } from 'idb';
import type { AppData } from '../types/data.types';

interface LocktDB extends DBSchema {
  'app-data': {
    key: string;
    value: AppData;
  };
  'app-config': {
    key: string;
    value: any;
  };
}

/**
 * Database Service
 * Handles local storage of plain JSON data in IndexedDB
 * NO ENCRYPTION - data stored as-is for simplicity
 */
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
        if (!db.objectStoreNames.contains('app-data')) {
          db.createObjectStore('app-data');
        }
        if (!db.objectStoreNames.contains('app-config')) {
          db.createObjectStore('app-config');
        }
      },
    });
  }

  /**
   * Save app data
   */
  async saveData(data: AppData): Promise<void> {
    await this.init();
    await this.db!.put('app-data', data, 'main');
  }

  /**
   * Retrieve app data
   */
  async getData(): Promise<AppData | undefined> {
    await this.init();
    return this.db!.get('app-data', 'main');
  }

  /**
   * Check if data exists (first-time setup check)
   */
  async hasData(): Promise<boolean> {
    await this.init();
    const data = await this.db!.get('app-data', 'main');
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
    await this.db!.clear('app-data');
    await this.db!.clear('app-config');
  }

  /**
   * Export data as downloadable JSON file
   */
  async exportBackup(): Promise<Blob> {
    const data = await this.getData();
    if (!data) {
      throw new Error('No data to export');
    }

    return new Blob(
      [JSON.stringify(data, null, 2)], 
      { type: 'application/json' }
    );
  }

  /**
   * Import data from backup file
   */
  async importBackup(fileContent: string): Promise<void> {
    try {
      const data = JSON.parse(fileContent) as AppData;
      
      // Validate structure
      if (!data.metadata || !data.passwords) {
        throw new Error('Invalid backup file format');
      }

      await this.saveData(data);
    } catch (error) {
      console.error('Import failed:', error);
      throw new Error('Failed to import backup - invalid file format');
    }
  }
}

export const databaseService = new DatabaseService();
