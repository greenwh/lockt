// src/services/auditlog.service.ts

import { databaseService } from './database.service';

export type AuditLogAction = 'added' | 'edited' | 'deleted';

export type AuditLogCategory =
  | 'passwords'
  | 'creditCards'
  | 'crypto'
  | 'freetext'
  | 'providers'
  | 'conditions'
  | 'impairments'
  | 'journal';

export interface AuditLogEntry {
  id: string;
  timestamp: number;
  action: AuditLogAction;
  category: AuditLogCategory;
  entryName: string;
  changedFields?: string[];
}

const AUDIT_LOG_KEY = 'auditLog';
const MAX_ENTRIES = 200;

const TIMESTAMP_FIELDS = new Set(['updatedAt', 'createdAt']);

function getDisplayName(entry: any, category: AuditLogCategory): string {
  switch (category) {
    case 'passwords':
    case 'crypto':
      return entry.account || 'Unnamed';
    case 'creditCards':
      return entry.accountName || 'Unnamed';
    case 'freetext':
      return entry.title || 'Unnamed';
    case 'providers':
      return entry.drName || 'Unnamed Provider';
    case 'conditions':
      return entry.condition || 'Unnamed Condition';
    case 'impairments':
      return entry.description || 'Unnamed Impairment';
    case 'journal': {
      const date = entry.date ? new Date(entry.date).toLocaleDateString() : 'Unknown Date';
      return entry.reasonForEntry ? `${date} - ${entry.reasonForEntry}` : date;
    }
    default:
      return 'Unknown';
  }
}

function getChangedFields(oldEntry: any, newEntry: any): string[] {
  const allKeys = new Set([...Object.keys(oldEntry), ...Object.keys(newEntry)]);
  const changed: string[] = [];
  for (const key of allKeys) {
    if (TIMESTAMP_FIELDS.has(key) || key === 'id') continue;
    if (JSON.stringify(oldEntry[key]) !== JSON.stringify(newEntry[key])) {
      changed.push(key);
    }
  }
  return changed;
}

export function detectChanges(
  category: AuditLogCategory,
  oldEntries: any[],
  newEntries: any[]
): AuditLogEntry[] {
  const oldMap = new Map<string, any>();
  const newMap = new Map<string, any>();

  for (const entry of oldEntries) {
    if (entry.id) oldMap.set(entry.id, entry);
  }
  for (const entry of newEntries) {
    if (entry.id) newMap.set(entry.id, entry);
  }

  const logEntries: AuditLogEntry[] = [];
  const now = Date.now();

  // Deleted entries (in old but not in new)
  for (const [id, oldEntry] of oldMap) {
    if (!newMap.has(id)) {
      logEntries.push({
        id: crypto.randomUUID(),
        timestamp: now,
        action: 'deleted',
        category,
        entryName: getDisplayName(oldEntry, category),
      });
    }
  }

  // Added or edited entries
  for (const [id, newEntry] of newMap) {
    const oldEntry = oldMap.get(id);
    if (!oldEntry) {
      logEntries.push({
        id: crypto.randomUUID(),
        timestamp: now,
        action: 'added',
        category,
        entryName: getDisplayName(newEntry, category),
      });
    } else {
      // Check if actually changed (ignore timestamp fields)
      const changedFields = getChangedFields(oldEntry, newEntry);
      if (changedFields.length > 0) {
        logEntries.push({
          id: crypto.randomUUID(),
          timestamp: now,
          action: 'edited',
          category,
          entryName: getDisplayName(newEntry, category),
          changedFields,
        });
      }
    }
  }

  return logEntries;
}

class AuditLogService {
  async addEntry(entry: Omit<AuditLogEntry, 'id' | 'timestamp'>): Promise<void> {
    const fullEntry: AuditLogEntry = {
      ...entry,
      id: crypto.randomUUID(),
      timestamp: Date.now(),
    };
    await this.addEntries([fullEntry]);
  }

  async addEntries(newEntries: AuditLogEntry[]): Promise<void> {
    if (newEntries.length === 0) return;
    try {
      const entries = await this.getEntries();
      entries.unshift(...newEntries);
      const pruned = entries.slice(0, MAX_ENTRIES);
      await databaseService.setConfig(AUDIT_LOG_KEY, pruned);
    } catch (err) {
      console.error('Failed to add audit log entries:', err);
    }
  }

  async getEntries(): Promise<AuditLogEntry[]> {
    try {
      const entries = await databaseService.getConfig(AUDIT_LOG_KEY);
      return Array.isArray(entries) ? entries : [];
    } catch {
      return [];
    }
  }

  async clear(): Promise<void> {
    await databaseService.setConfig(AUDIT_LOG_KEY, []);
  }
}

export const auditLogService = new AuditLogService();
