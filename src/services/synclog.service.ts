// src/services/synclog.service.ts

import { databaseService } from './database.service';
import type { SyncLogEntry, SyncLogAction } from '../types/sync.types';

const SYNC_LOG_KEY = 'syncLog';
const MAX_ENTRIES = 100;

class SyncLogService {
  async addEntry(action: SyncLogAction, summary: string, error?: string): Promise<void> {
    try {
      const entries = await this.getEntries();
      const deviceId = (await databaseService.getConfig('deviceId')) || 'unknown';

      const entry: SyncLogEntry = {
        id: crypto.randomUUID(),
        timestamp: Date.now(),
        action,
        deviceId,
        summary,
        error,
      };

      entries.unshift(entry);

      // Prune to max entries
      const pruned = entries.slice(0, MAX_ENTRIES);
      await databaseService.setConfig(SYNC_LOG_KEY, pruned);
    } catch (err) {
      console.error('Failed to add sync log entry:', err);
    }
  }

  async getEntries(): Promise<SyncLogEntry[]> {
    try {
      const entries = await databaseService.getConfig(SYNC_LOG_KEY);
      return Array.isArray(entries) ? entries : [];
    } catch {
      return [];
    }
  }

  async clear(): Promise<void> {
    await databaseService.setConfig(SYNC_LOG_KEY, []);
  }
}

export const syncLogService = new SyncLogService();
