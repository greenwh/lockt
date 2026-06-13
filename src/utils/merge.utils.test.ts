// src/utils/merge.utils.test.ts

import { describe, it, expect } from 'vitest';
import { applyMerge } from './merge.utils';
import type { AppData } from '../types/data.types';

const emptyHealth = {
  providers: [],
  conditions: [],
  impairments: [],
  journal: [],
  medications: [],
  devices: [],
  emergency: null,
};

function makeAppData(passwords: AppData['passwords']): AppData {
  return {
    passwords,
    creditCards: [],
    crypto: [],
    freetext: [],
    health: { ...emptyHealth },
    metadata: { version: 2, lastModified: 0, deviceId: 'test' },
  };
}

function pw(id: string, account: string) {
  return {
    id,
    account,
    username: 'u',
    password: 'p',
    pin: '',
    createdAt: 0,
    updatedAt: 0,
  };
}

describe('applyMerge', () => {
  it('includes entries added on only one side', () => {
    const local = makeAppData([pw('1', 'Local Bank')]);
    const remote = makeAppData([pw('2', 'Remote Bank')]);

    const merged = applyMerge(local, remote, [], undefined);

    const accounts = merged.passwords.map((p) => p.account).sort();
    expect(accounts).toEqual(['Local Bank', 'Remote Bank']);
  });

  it('defaults a conflicting entry to the local version', () => {
    const local = makeAppData([pw('1', 'Local Name')]);
    const remote = makeAppData([pw('1', 'Remote Name')]);

    const merged = applyMerge(local, remote, [], undefined);

    expect(merged.passwords).toHaveLength(1);
    expect(merged.passwords[0].account).toBe('Local Name');
  });

  it('honors an explicit decision to keep the remote version', () => {
    const local = makeAppData([pw('1', 'Local Name')]);
    const remote = makeAppData([pw('1', 'Remote Name')]);

    const merged = applyMerge(local, remote, [{ id: '1', choice: 'remote' }], undefined);

    expect(merged.passwords).toHaveLength(1);
    expect(merged.passwords[0].account).toBe('Remote Name');
  });

  it('bumps lastModified on the merged result', () => {
    const before = Date.now();
    const merged = applyMerge(makeAppData([]), makeAppData([]), [], undefined);
    expect(merged.metadata.lastModified).toBeGreaterThanOrEqual(before);
  });
});
