// src/utils/merge.utils.ts

import type { AppData } from '../types/data.types';
import type { DiffCategory } from './diff.utils';

export interface MergeDecision {
  id: string;
  choice: 'local' | 'remote';
}

function mergeEntryList(
  localEntries: any[],
  remoteEntries: any[],
  decisions: Map<string, 'local' | 'remote'>,
  category: string
): any[] {
  const localMap = new Map<string, any>();
  const remoteMap = new Map<string, any>();

  for (const entry of localEntries) {
    const id = entry.id || `legacy-${category}-${entry.account || entry.accountName || entry.title || entry.drName || entry.condition || entry.description || ''}-${entry.createdAt || 0}`;
    localMap.set(id, entry);
  }
  for (const entry of remoteEntries) {
    const id = entry.id || `legacy-${category}-${entry.account || entry.accountName || entry.title || entry.drName || entry.condition || entry.description || ''}-${entry.createdAt || 0}`;
    remoteMap.set(id, entry);
  }

  const allIds = new Set([...localMap.keys(), ...remoteMap.keys()]);
  const merged: any[] = [];

  for (const id of allIds) {
    const local = localMap.get(id);
    const remote = remoteMap.get(id);

    if (local && remote) {
      const decision = decisions.get(id);
      if (decision === 'remote') {
        const entry = { ...remote };
        if (!entry.id) entry.id = crypto.randomUUID();
        merged.push(entry);
      } else {
        // Default to local
        const entry = { ...local };
        if (!entry.id) entry.id = crypto.randomUUID();
        merged.push(entry);
      }
    } else if (local) {
      // Added locally - include
      const entry = { ...local };
      if (!entry.id) entry.id = crypto.randomUUID();
      merged.push(entry);
    } else if (remote) {
      // Added remotely - include
      const entry = { ...remote };
      if (!entry.id) entry.id = crypto.randomUUID();
      merged.push(entry);
    }
  }

  return merged;
}

export function applyMerge(
  local: AppData,
  remote: AppData,
  decisions: MergeDecision[],
  _diff: unknown
): AppData {
  const decisionMap = new Map<string, 'local' | 'remote'>();
  for (const d of decisions) {
    decisionMap.set(d.id, d.choice);
  }

  const categories: DiffCategory[] = ['passwords', 'creditCards', 'crypto', 'freetext'];
  const mergedData: any = {};

  for (const category of categories) {
    mergedData[category] = mergeEntryList(
      local[category] || [],
      remote[category] || [],
      decisionMap,
      category
    );
  }

  // Merge health sub-categories
  const healthSubCategories = ['providers', 'conditions', 'impairments', 'journal'] as const;
  mergedData.health = {} as any;

  for (const subCategory of healthSubCategories) {
    mergedData.health[subCategory] = mergeEntryList(
      local.health?.[subCategory] || [],
      remote.health?.[subCategory] || [],
      decisionMap,
      subCategory
    );
  }

  mergedData.metadata = {
    ...local.metadata,
    lastModified: Date.now(),
  };

  return mergedData as AppData;
}
