// src/utils/diff.utils.ts

import type { AppData } from '../types/data.types';

export type DiffStatus = 'added-local' | 'added-remote' | 'modified' | 'unchanged';

export type DiffCategory = 'passwords' | 'creditCards' | 'crypto' | 'freetext';

export interface EntryDiff {
  id: string;
  category: DiffCategory | 'health';
  status: DiffStatus;
  localEntry?: any;
  remoteEntry?: any;
  displayName: string;
  localUpdatedAt?: number;
  remoteUpdatedAt?: number;
  changedFields?: string[];
}

export interface HealthSubDiff {
  subCategory: 'providers' | 'conditions' | 'impairments' | 'journal';
  entries: EntryDiff[];
}

export interface DiffResult {
  entries: EntryDiff[];
  healthDiffs: HealthSubDiff[];
  summary: { added: number; modified: number; unchanged: number };
}

const TIMESTAMP_FIELDS = new Set(['updatedAt', 'createdAt']);

function getEntryId(entry: any, category: string): string {
  if (entry.id) return entry.id;
  // Deterministic key for legacy entries without id
  const displayName = getDisplayName(entry, category);
  return `legacy-${category}-${displayName}-${entry.createdAt || 0}`;
}

function getDisplayName(entry: any, category: string): string {
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

function getChangedFields(local: any, remote: any): string[] {
  const allKeys = new Set([...Object.keys(local), ...Object.keys(remote)]);
  const changed: string[] = [];

  for (const key of allKeys) {
    if (TIMESTAMP_FIELDS.has(key)) continue;
    if (JSON.stringify(local[key]) !== JSON.stringify(remote[key])) {
      changed.push(key);
    }
  }

  return changed;
}

function diffEntries(
  localEntries: any[],
  remoteEntries: any[],
  category: string,
  diffCategory: DiffCategory | 'health'
): EntryDiff[] {
  const localMap = new Map<string, any>();
  const remoteMap = new Map<string, any>();

  for (const entry of localEntries) {
    localMap.set(getEntryId(entry, category), entry);
  }
  for (const entry of remoteEntries) {
    remoteMap.set(getEntryId(entry, category), entry);
  }

  const allIds = new Set([...localMap.keys(), ...remoteMap.keys()]);
  const diffs: EntryDiff[] = [];

  for (const id of allIds) {
    const local = localMap.get(id);
    const remote = remoteMap.get(id);

    if (local && remote) {
      // Both exist - check if identical
      if (JSON.stringify(local) === JSON.stringify(remote)) {
        diffs.push({
          id,
          category: diffCategory,
          status: 'unchanged',
          localEntry: local,
          remoteEntry: remote,
          displayName: getDisplayName(local, category),
          localUpdatedAt: local.updatedAt,
          remoteUpdatedAt: remote.updatedAt,
        });
      } else {
        diffs.push({
          id,
          category: diffCategory,
          status: 'modified',
          localEntry: local,
          remoteEntry: remote,
          displayName: getDisplayName(local, category),
          localUpdatedAt: local.updatedAt,
          remoteUpdatedAt: remote.updatedAt,
          changedFields: getChangedFields(local, remote),
        });
      }
    } else if (local) {
      diffs.push({
        id,
        category: diffCategory,
        status: 'added-local',
        localEntry: local,
        displayName: getDisplayName(local, category),
        localUpdatedAt: local.updatedAt,
      });
    } else {
      diffs.push({
        id,
        category: diffCategory,
        status: 'added-remote',
        remoteEntry: remote,
        displayName: getDisplayName(remote, category),
        remoteUpdatedAt: remote.updatedAt,
      });
    }
  }

  return diffs;
}

export function computeDiff(local: AppData, remote: AppData): DiffResult {
  const categories: DiffCategory[] = ['passwords', 'creditCards', 'crypto', 'freetext'];
  const entries: EntryDiff[] = [];

  for (const category of categories) {
    const localEntries = local[category] || [];
    const remoteEntries = remote[category] || [];
    entries.push(...diffEntries(localEntries, remoteEntries, category, category));
  }

  // Health sub-categories
  const healthSubCategories = ['providers', 'conditions', 'impairments', 'journal'] as const;
  const healthDiffs: HealthSubDiff[] = [];

  for (const subCategory of healthSubCategories) {
    const localEntries = local.health?.[subCategory] || [];
    const remoteEntries = remote.health?.[subCategory] || [];
    const subDiffs = diffEntries(localEntries, remoteEntries, subCategory, 'health');
    healthDiffs.push({ subCategory, entries: subDiffs });
  }

  // Compute summary
  const allDiffs = [...entries, ...healthDiffs.flatMap((h) => h.entries)];
  const summary = {
    added: allDiffs.filter((d) => d.status === 'added-local' || d.status === 'added-remote').length,
    modified: allDiffs.filter((d) => d.status === 'modified').length,
    unchanged: allDiffs.filter((d) => d.status === 'unchanged').length,
  };

  return { entries, healthDiffs, summary };
}
