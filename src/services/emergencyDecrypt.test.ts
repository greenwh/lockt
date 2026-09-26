// src/services/emergencyDecrypt.test.ts
//
// public/emergency-decrypt.html is a standalone offline viewer with its own copy of
// the decryption code. These tests run that copy against files produced by the app's
// real backup/crypto services, so any drift between the two fails here.

import 'fake-indexeddb/auto';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, it, expect, vi, beforeAll } from 'vitest';
import type { AppData, EncryptedData } from '../types/data.types';

vi.mock('./onedrive.service', () => ({
  oneDriveService: {
    init: async () => {},
    isSignedIn: () => false,
    getToken: async () => 'test-token',
    downloadAppFile: async () => null,
    downloadData: async () => null,
  },
}));

const memoryStorage = new Map<string, string>();
vi.stubGlobal('localStorage', {
  getItem: (k: string) => memoryStorage.get(k) ?? null,
  setItem: (k: string, v: string) => void memoryStorage.set(k, v),
  removeItem: (k: string) => void memoryStorage.delete(k),
});

const { backupService } = await import('./backup.service');
const { databaseService } = await import('./database.service');
const { cryptoService } = await import('./crypto.service');

interface LocktCoreApi {
  parseBackup(text: string): { source: string; vault: EncryptedData; escrow: EncryptedData | null; exportedAt: number | null };
  openBackup(backup: unknown, creds: { password?: string; recoveryPhrase?: string }): Promise<AppData>;
  ITERATIONS: number;
}

const HTML = readFileSync(resolve(__dirname, '../../public/emergency-decrypt.html'), 'utf8');
const coreSource = HTML.match(/<script id="lockt-core">([\s\S]*?)<\/script>/)?.[1];
if (!coreSource) throw new Error('lockt-core script block not found in emergency-decrypt.html');
new Function(coreSource)();
const Core = (globalThis as unknown as { LocktCore: LocktCoreApi }).LocktCore;

const PASSWORD = 'emergency-test-password';
const PHRASE = 'abandon ability able about above absent absorb abstract absurd abuse access accident';

const appData = {
  passwords: [{ id: '1', account: 'Test Bank', username: 'me', password: 's3cret', pin: '1234', createdAt: 1, updatedAt: 1 }],
  creditCards: [],
  crypto: [],
  freetext: [],
  health: { providers: [], conditions: [], impairments: [], journal: [], medications: [], devices: [], emergency: null },
  metadata: { version: 2, lastModified: 1700000000000, deviceId: 'd' },
} as unknown as AppData;

let backupText: string;
let vault: EncryptedData;

beforeAll(async () => {
  vault = await cryptoService.encrypt(JSON.stringify(appData), PASSWORD);
  await databaseService.saveEncryptedData(vault);
  await databaseService.setConfig('salt', vault.salt);
  await databaseService.setConfig('lastModified', 1700000000000);
  await databaseService.setConfig('encryptedPassword', await cryptoService.encryptPasswordWithRecoveryPhrase(PASSWORD, PHRASE));
  const { blob } = await backupService.createBackupFile();
  backupText = await blob.text();
});

describe('emergency-decrypt.html core', () => {
  it('uses the same PBKDF2 iteration count as the app', () => {
    expect(Core.ITERATIONS).toBe((cryptoService as unknown as { PBKDF2_ITERATIONS: number }).PBKDF2_ITERATIONS);
  });

  it('opens an app-created backup file with the master password', async () => {
    const backup = Core.parseBackup(backupText);
    expect(backup.source).toBe('Lockt backup file');
    const data = await Core.openBackup(backup, { password: PASSWORD });
    expect(data.passwords[0].account).toBe('Test Bank');
  });

  it('opens an app-created backup file with the recovery phrase', async () => {
    const data = await Core.openBackup(Core.parseBackup(backupText), { recoveryPhrase: ` ${PHRASE.toUpperCase()} ` });
    expect(data.passwords[0].password).toBe('s3cret');
  });

  it('opens a raw OneDrive vault file and a legacy export', async () => {
    const raw = Core.parseBackup(JSON.stringify(vault));
    expect(raw.source).toBe('Vault file from OneDrive');
    expect((await Core.openBackup(raw, { password: PASSWORD })).passwords).toHaveLength(1);

    const legacy = Core.parseBackup(JSON.stringify({ ...vault, config: { exportDate: 5 } }));
    expect(legacy.source).toBe('Older Lockt export');
    expect((await Core.openBackup(legacy, { password: PASSWORD })).passwords).toHaveLength(1);
  });

  it('accepts exactly the files the app accepts', () => {
    const samples = [backupText, JSON.stringify(vault), 'nope', '{}', JSON.stringify({ format: 'lockt-backup', formatVersion: 99, vault })];
    for (const text of samples) {
      let appOk = true;
      let pageOk = true;
      try { backupService.parseBackupFile(text); } catch { appOk = false; }
      try { Core.parseBackup(text); } catch { pageOk = false; }
      expect(pageOk).toBe(appOk);
    }
  });

  it('rejects a wrong password with a clear message', async () => {
    await expect(Core.openBackup(Core.parseBackup(backupText), { password: 'wrong' })).rejects.toThrow(/Incorrect password/);
  });
});

describe('emergency-decrypt.html safety', () => {
  it('blocks all network access with a Content-Security-Policy', () => {
    expect(HTML).toMatch(/http-equiv="Content-Security-Policy"[^>]*default-src 'none'/);
    expect(HTML).not.toMatch(/connect-src/);
  });

  it('never injects data as HTML and loads nothing external', () => {
    expect(HTML).not.toMatch(/innerHTML|outerHTML|insertAdjacentHTML|document\.write|\beval\(/);
    expect(HTML).not.toMatch(/(src|href)=["']https?:/);
  });
});
