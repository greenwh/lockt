// src/services/backup.service.test.ts

import 'fake-indexeddb/auto';
import { describe, it, expect, vi, beforeAll, beforeEach } from 'vitest';
import type { AppData, EncryptedData } from '../types/data.types';
import type { BiometricCredential } from './webauthn.service';

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

const { backupService, BackupError, BACKUP_FORMAT } = await import('./backup.service');
const { databaseService } = await import('./database.service');
const { cryptoService } = await import('./crypto.service');

const PASSWORD = 'correct horse battery';
const OTHER_PASSWORD = 'a different password';
const PHRASE = 'abandon ability able about above absent absorb abstract absurd abuse access accident';
const DATA_MODIFIED = Date.UTC(2026, 8, 1);
const CONFIG_MODIFIED = Date.UTC(2026, 8, 2);

function makeAppData(passwordCount: number): AppData {
  return {
    passwords: Array.from({ length: passwordCount }, (_, i) => ({
      id: `p${i}`,
      account: `Account ${i}`,
      username: 'user',
      password: 'secret',
      pin: '',
      createdAt: 1,
      updatedAt: 1,
    })),
    creditCards: [],
    crypto: [],
    freetext: [],
    health: {
      providers: [],
      conditions: [],
      impairments: [],
      journal: [],
      medications: [],
      devices: [],
      emergency: null,
    },
    metadata: { version: 2, lastModified: DATA_MODIFIED, deviceId: 'device-a' },
  } as AppData;
}

let vault: EncryptedData;
let escrow: EncryptedData;
let otherVault: EncryptedData;

async function seedDevice(v: EncryptedData, esc: EncryptedData | null) {
  await databaseService.saveEncryptedData(v);
  await databaseService.setConfig('salt', v.salt);
  await databaseService.setConfig('lastModified', CONFIG_MODIFIED);
  await databaseService.setConfig('lastSyncTime', CONFIG_MODIFIED + 1000);
  await databaseService.setConfig('deviceId', 'device-a');
  if (esc) await databaseService.setConfig('encryptedPassword', esc);
}

beforeAll(async () => {
  vault = await cryptoService.encrypt(JSON.stringify(makeAppData(3)), PASSWORD);
  escrow = await cryptoService.encryptPasswordWithRecoveryPhrase(PASSWORD, PHRASE);
  otherVault = await cryptoService.encrypt(JSON.stringify(makeAppData(1)), OTHER_PASSWORD);
});

beforeEach(async () => {
  await databaseService.clearAll();
  memoryStorage.clear();
});

describe('backupService.createBackupFile', () => {
  it('includes the vault, escrow and timestamps, and round-trips through parse', async () => {
    await seedDevice(vault, escrow);
    const now = Date.UTC(2026, 8, 25, 12);

    const { blob, filename, backup } = await backupService.createBackupFile(now);

    expect(filename).toMatch(/^lockt-backup-\d{4}-\d{2}-\d{2}\.json$/);
    expect(backup.format).toBe(BACKUP_FORMAT);
    expect(backup.vault).toEqual(vault);
    expect(backup.encryptedPassword).toEqual(escrow);
    expect(backup.lastModified).toBe(CONFIG_MODIFIED);

    const parsed = backupService.parseBackupFile(await blob.text());
    expect(parsed.source).toBe('lockt-backup');
    expect(parsed.vault).toEqual(vault);
    expect(parsed.encryptedPassword).toEqual(escrow);
    expect(parsed.exportedAt).toBe(now);
  });

  it('refuses to export when there is no vault', async () => {
    await expect(backupService.createBackupFile()).rejects.toBeInstanceOf(BackupError);
  });

  it('records and reads the last export time', async () => {
    await backupService.markBackupExported(1234);
    expect(await backupService.getLastBackupExportedAt()).toBe(1234);
  });
});

describe('backupService.parseBackupFile', () => {
  it('accepts a raw OneDrive vault file', () => {
    const parsed = backupService.parseBackupFile(JSON.stringify(vault));
    expect(parsed.source).toBe('raw-vault');
    expect(parsed.encryptedPassword).toBeNull();
  });

  it('accepts the legacy export format', () => {
    const parsed = backupService.parseBackupFile(
      JSON.stringify({ ...vault, config: { salt: vault.salt, deviceId: 'x', exportDate: 99 } })
    );
    expect(parsed.source).toBe('legacy-export');
    expect(parsed.exportedAt).toBe(99);
  });

  it.each([
    ['not JSON', 'hello'],
    ['unrelated JSON', JSON.stringify({ hello: 'world' })],
    ['JSON array', '[]'],
    ['non-base64 fields', JSON.stringify({ iv: '!!', salt: 'AA==', ciphertext: 'AA==' })],
    ['lockt-backup without vault', JSON.stringify({ format: 'lockt-backup', formatVersion: 1 })],
  ])('rejects %s', (_label, text) => {
    expect(() => backupService.parseBackupFile(text)).toThrow(BackupError);
  });

  it('rejects backups from a newer format version', () => {
    const text = JSON.stringify({ format: 'lockt-backup', formatVersion: 99, vault });
    expect(() => backupService.parseBackupFile(text)).toThrow(/newer version/);
  });
});

describe('backupService.verifyBackup', () => {
  const parsedWithEscrow = () =>
    backupService.parseBackupFile(
      JSON.stringify({ format: 'lockt-backup', formatVersion: 1, exportedAt: 1, lastModified: 2, vault, encryptedPassword: escrow })
    );

  it('opens with the master password and summarizes contents', async () => {
    const verified = await backupService.verifyBackup(parsedWithEscrow(), { password: PASSWORD });
    expect(verified.password).toBe(PASSWORD);
    expect(verified.summary.passwords).toBe(3);
    expect(verified.summary.dataLastModified).toBe(DATA_MODIFIED);
  });

  it('opens with the recovery phrase (normalizing case and whitespace at the ends)', async () => {
    const verified = await backupService.verifyBackup(parsedWithEscrow(), {
      recoveryPhrase: `  ${PHRASE.toUpperCase()}  `,
    });
    expect(verified.password).toBe(PASSWORD);
  });

  it('rejects a wrong password', async () => {
    await expect(backupService.verifyBackup(parsedWithEscrow(), { password: 'nope' })).rejects.toThrow(
      /Incorrect password/
    );
  });

  it('rejects a wrong recovery phrase', async () => {
    const wrong = PHRASE.replace('abandon', 'zoo');
    await expect(backupService.verifyBackup(parsedWithEscrow(), { recoveryPhrase: wrong })).rejects.toThrow(
      /does not match/
    );
  });

  it('explains when a file has no recovery-phrase data', async () => {
    const raw = backupService.parseBackupFile(JSON.stringify(vault));
    await expect(backupService.verifyBackup(raw, { recoveryPhrase: PHRASE })).rejects.toThrow(
      /does not include recovery-phrase data/
    );
  });

  it('rejects content that decrypts but is not Lockt data', async () => {
    const notAppData = await cryptoService.encrypt(JSON.stringify({ hello: 1 }), PASSWORD);
    const parsed = backupService.parseBackupFile(JSON.stringify(notAppData));
    await expect(backupService.verifyBackup(parsed, { password: PASSWORD })).rejects.toThrow(/not valid Lockt data/);
  });
});

describe('backupService.restoreBackup', () => {
  const fakeCredential = { id: 'cred-1' } as unknown as BiometricCredential;

  it("'keep-newer' dates the vault by the backup and clears lastSyncTime", async () => {
    await seedDevice(otherVault, null);
    const parsed = backupService.parseBackupFile(
      JSON.stringify({ format: 'lockt-backup', formatVersion: 1, exportedAt: 5, lastModified: 4242, vault, encryptedPassword: escrow })
    );
    const verified = await backupService.verifyBackup(parsed, { password: PASSWORD });

    await backupService.restoreBackup(verified, 'keep-newer', OTHER_PASSWORD, 999_999);

    expect(await databaseService.getEncryptedData()).toEqual(vault);
    expect(await databaseService.getConfig('salt')).toBe(vault.salt);
    expect(await databaseService.getConfig('lastModified')).toBe(4242);
    expect(await databaseService.getConfig('lastSyncTime')).toBeUndefined();
    expect(await databaseService.getConfig('encryptedPassword')).toEqual(escrow);
    expect(memoryStorage.get('lockt-salt-backup')).toBe(vault.salt);
  });

  it("'make-current' dates the vault now so the next sync uploads it", async () => {
    const verified = await backupService.verifyBackup(backupService.parseBackupFile(JSON.stringify(vault)), {
      password: PASSWORD,
    });
    await backupService.restoreBackup(verified, 'make-current', null, 777_777);
    expect(await databaseService.getConfig('lastModified')).toBe(777_777);
  });

  it('falls back to the data timestamp for a raw vault file', async () => {
    const verified = await backupService.verifyBackup(backupService.parseBackupFile(JSON.stringify(vault)), {
      password: PASSWORD,
    });
    await backupService.restoreBackup(verified, 'keep-newer', null);
    expect(await databaseService.getConfig('lastModified')).toBe(DATA_MODIFIED);
  });

  it('keeps an existing escrow when the backup has none', async () => {
    await seedDevice(vault, escrow);
    const verified = await backupService.verifyBackup(backupService.parseBackupFile(JSON.stringify(vault)), {
      password: PASSWORD,
    });
    await backupService.restoreBackup(verified, 'keep-newer', PASSWORD);
    expect(await databaseService.getConfig('encryptedPassword')).toEqual(escrow);
  });

  it('keeps biometric credentials only when the password is unchanged', async () => {
    const verified = await backupService.verifyBackup(backupService.parseBackupFile(JSON.stringify(vault)), {
      password: PASSWORD,
    });

    await databaseService.saveBiometricCredential(fakeCredential);
    await backupService.restoreBackup(verified, 'keep-newer', PASSWORD);
    expect(await databaseService.hasBiometricCredentials()).toBe(true);

    await backupService.restoreBackup(verified, 'keep-newer', OTHER_PASSWORD);
    expect(await databaseService.hasBiometricCredentials()).toBe(false);

    await databaseService.saveBiometricCredential(fakeCredential);
    await backupService.restoreBackup(verified, 'keep-newer', null); // locked: password unknown
    expect(await databaseService.hasBiometricCredentials()).toBe(false);
  });

  it('gives a restored device a device ID (needed for biometric enrollment)', async () => {
    const verified = await backupService.verifyBackup(backupService.parseBackupFile(JSON.stringify(vault)), {
      password: PASSWORD,
    });
    await backupService.restoreBackup(verified, 'keep-newer', null);
    const deviceId = await databaseService.getConfig('deviceId');
    expect(typeof deviceId).toBe('string');
    expect(deviceId.length).toBeGreaterThan(0);
  });

  it('the restored vault unlocks with the backup password', async () => {
    const verified = await backupService.verifyBackup(backupService.parseBackupFile(JSON.stringify(vault)), {
      password: PASSWORD,
    });
    await backupService.restoreBackup(verified, 'keep-newer', null);
    const stored = await databaseService.getEncryptedData();
    const data = JSON.parse(await cryptoService.decrypt(stored!, PASSWORD));
    expect(data.passwords).toHaveLength(3);
  });
});

describe('databaseService.onVaultChanged', () => {
  it('notifies on save, restore and clear, and stops after unsubscribe', async () => {
    let calls = 0;
    const unsubscribe = databaseService.onVaultChanged(() => calls++);

    await databaseService.saveEncryptedData(vault);
    expect(calls).toBe(1);

    const verified = await backupService.verifyBackup(backupService.parseBackupFile(JSON.stringify(vault)), {
      password: PASSWORD,
    });
    await backupService.restoreBackup(verified, 'keep-newer', PASSWORD);
    expect(calls).toBe(2);

    await databaseService.clearAll();
    expect(calls).toBe(3);

    unsubscribe();
    await databaseService.saveEncryptedData(vault);
    expect(calls).toBe(3);
  });
});

describe('cryptoService.resolvePasswordWithRecoveryPhrase', () => {
  it('skips a stale escrow and uses one that opens the vault', async () => {
    const stale = await cryptoService.encryptPasswordWithRecoveryPhrase(OTHER_PASSWORD, PHRASE);
    const result = await cryptoService.resolvePasswordWithRecoveryPhrase(vault, PHRASE, [stale, null, escrow]);
    expect(result.password).toBe(PASSWORD);
    expect(result.escrow).toBe(escrow);
    expect(JSON.parse(result.plaintext).passwords).toHaveLength(3);
  });

  it('reports a correct phrase with only stale recovery data', async () => {
    const stale = await cryptoService.encryptPasswordWithRecoveryPhrase(OTHER_PASSWORD, PHRASE);
    await expect(cryptoService.resolvePasswordWithRecoveryPhrase(vault, PHRASE, [stale])).rejects.toThrow(
      /out of date/
    );
  });

  it('reports an incorrect phrase', async () => {
    await expect(
      cryptoService.resolvePasswordWithRecoveryPhrase(vault, PHRASE.replace('abandon', 'zoo'), [escrow])
    ).rejects.toThrow('Recovery phrase is incorrect');
  });

  it('reports when there is no recovery data at all', async () => {
    await expect(cryptoService.resolvePasswordWithRecoveryPhrase(vault, PHRASE, [null, undefined])).rejects.toThrow(
      /No recovery data/
    );
  });
});
