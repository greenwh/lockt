// src/services/backup.service.ts

import type { AppData, EncryptedData } from '../types/data.types';
import { cryptoService } from './crypto.service';
import { databaseService } from './database.service';
import { saltRecoveryService } from './saltRecovery.service';

/**
 * Encrypted backup files.
 *
 * A backup contains only data that is already encrypted:
 * - the vault blob (encrypted with the master password), and
 * - the recovery-phrase escrow of the master password (encrypted with the recovery phrase).
 * It is as safe to store anywhere as the OneDrive copy is.
 *
 * Accepted input formats:
 * - 'lockt-backup' v1 (created by createBackupFile)
 * - legacy export ({ iv, salt, ciphertext, version, config })
 * - raw vault file downloaded from OneDrive (lockt-data.encrypted)
 */

export const BACKUP_FORMAT = 'lockt-backup';
export const BACKUP_FORMAT_VERSION = 1;
export const LAST_BACKUP_CONFIG_KEY = 'lastBackupExportedAt';

export interface BackupFile {
  format: typeof BACKUP_FORMAT;
  formatVersion: number;
  exportedAt: number;
  lastModified: number | null;
  vault: EncryptedData;
  encryptedPassword: EncryptedData | null;
}

export type BackupSource = 'lockt-backup' | 'legacy-export' | 'raw-vault';

export interface ParsedBackup {
  source: BackupSource;
  vault: EncryptedData;
  encryptedPassword: EncryptedData | null;
  exportedAt: number | null;
  lastModified: number | null;
}

export interface BackupSummary {
  passwords: number;
  creditCards: number;
  crypto: number;
  freetext: number;
  dataLastModified: number | null;
}

export interface VerifiedBackup {
  backup: ParsedBackup;
  password: string;
  summary: BackupSummary;
}

/**
 * How sync should treat the restored vault:
 * - 'keep-newer': the restored vault is dated by its own last-modified time, so if
 *   OneDrive holds a newer copy, the next sync replaces the restore with it.
 * - 'make-current': the restored vault is dated now, so the next sync uploads it
 *   and it replaces the OneDrive copy (older OneDrive versions stay in OneDrive's
 *   version history).
 */
export type RestoreMode = 'keep-newer' | 'make-current';

export class BackupError extends Error {}

const BASE64_RE = /^[A-Za-z0-9+/]+={0,2}$/;

function isBase64(value: unknown): value is string {
  return typeof value === 'string' && value.length > 0 && BASE64_RE.test(value);
}

function toEncryptedData(value: unknown): EncryptedData | null {
  if (!value || typeof value !== 'object') return null;
  const v = value as Record<string, unknown>;
  if (!isBase64(v.iv) || !isBase64(v.salt) || !isBase64(v.ciphertext)) return null;
  return {
    iv: v.iv,
    salt: v.salt,
    ciphertext: v.ciphertext,
    version: typeof v.version === 'number' ? v.version : 1,
  };
}

function toTimestamp(value: unknown): number | null {
  return typeof value === 'number' && Number.isFinite(value) && value > 0 ? value : null;
}

function isAppData(value: unknown): value is AppData {
  if (!value || typeof value !== 'object') return false;
  const v = value as Record<string, unknown>;
  return Array.isArray(v.passwords) && typeof v.metadata === 'object' && v.metadata !== null;
}

function formatDate(ts: number): string {
  const d = new Date(ts);
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

class BackupService {
  /**
   * Build a backup file from the vault currently stored on this device.
   */
  async createBackupFile(now: number = Date.now()): Promise<{ blob: Blob; filename: string; backup: BackupFile }> {
    const vault = await databaseService.getEncryptedData();
    if (!vault) {
      throw new BackupError('There is no data on this device to back up.');
    }

    const backup: BackupFile = {
      format: BACKUP_FORMAT,
      formatVersion: BACKUP_FORMAT_VERSION,
      exportedAt: now,
      lastModified: toTimestamp(await databaseService.getConfig('lastModified')),
      vault: { iv: vault.iv, salt: vault.salt, ciphertext: vault.ciphertext, version: vault.version },
      encryptedPassword: toEncryptedData(await databaseService.getConfig('encryptedPassword')),
    };

    const blob = new Blob([JSON.stringify(backup, null, 2)], { type: 'application/json' });
    return { blob, filename: `lockt-backup-${formatDate(now)}.json`, backup };
  }

  /**
   * Record that a backup was exported (shown in Settings as a reminder).
   */
  async markBackupExported(at: number = Date.now()): Promise<void> {
    await databaseService.setConfig(LAST_BACKUP_CONFIG_KEY, at);
  }

  async getLastBackupExportedAt(): Promise<number | null> {
    return toTimestamp(await databaseService.getConfig(LAST_BACKUP_CONFIG_KEY));
  }

  /**
   * Parse and structurally validate a backup file. Does not decrypt anything.
   */
  parseBackupFile(text: string): ParsedBackup {
    let raw: unknown;
    try {
      raw = JSON.parse(text);
    } catch {
      throw new BackupError('This file is not a Lockt backup (it is not valid JSON).');
    }
    if (!raw || typeof raw !== 'object') {
      throw new BackupError('This file is not a Lockt backup.');
    }
    const obj = raw as Record<string, unknown>;

    if (obj.format === BACKUP_FORMAT) {
      if (typeof obj.formatVersion !== 'number' || obj.formatVersion > BACKUP_FORMAT_VERSION) {
        throw new BackupError('This backup was made by a newer version of Lockt. Update the app and try again.');
      }
      const vault = toEncryptedData(obj.vault);
      if (!vault) {
        throw new BackupError('This backup file is damaged (the encrypted vault is missing or invalid).');
      }
      return {
        source: 'lockt-backup',
        vault,
        encryptedPassword: toEncryptedData(obj.encryptedPassword),
        exportedAt: toTimestamp(obj.exportedAt),
        lastModified: toTimestamp(obj.lastModified),
      };
    }

    const vault = toEncryptedData(obj);
    if (!vault) {
      throw new BackupError(
        'This file is not a Lockt backup. Choose a lockt-backup-*.json file or lockt-data.encrypted from OneDrive.'
      );
    }

    const config = obj.config && typeof obj.config === 'object' ? (obj.config as Record<string, unknown>) : null;
    return {
      source: config ? 'legacy-export' : 'raw-vault',
      vault,
      encryptedPassword: null,
      exportedAt: config ? toTimestamp(config.exportDate) : null,
      lastModified: null,
    };
  }

  /**
   * Decrypt the backup with the master password, or with the recovery phrase
   * (only if the backup contains the recovery-phrase escrow). Nothing is written.
   */
  async verifyBackup(
    backup: ParsedBackup,
    credentials: { password?: string; recoveryPhrase?: string }
  ): Promise<VerifiedBackup> {
    let password = credentials.password ?? '';

    if (!password) {
      const phrase = credentials.recoveryPhrase?.trim().toLowerCase();
      if (!phrase) {
        throw new BackupError('Enter the master password for this backup.');
      }
      if (!backup.encryptedPassword) {
        throw new BackupError(
          'This file does not include recovery-phrase data. Use the master password it was created with.'
        );
      }
      try {
        password = await cryptoService.decryptPasswordWithRecoveryPhrase(backup.encryptedPassword, phrase);
      } catch {
        throw new BackupError('That recovery phrase does not match this backup.');
      }
    }

    let data: unknown;
    try {
      data = JSON.parse(await cryptoService.decrypt(backup.vault, password));
    } catch {
      throw new BackupError(
        credentials.password
          ? 'Incorrect password for this backup. Use the master password that was in effect when the backup was made.'
          : 'The recovery phrase unlocked a password that does not open this backup.'
      );
    }
    if (!isAppData(data)) {
      throw new BackupError('The backup decrypted, but its contents are not valid Lockt data.');
    }

    return {
      backup,
      password,
      summary: {
        passwords: data.passwords.length,
        creditCards: Array.isArray(data.creditCards) ? data.creditCards.length : 0,
        crypto: Array.isArray(data.crypto) ? data.crypto.length : 0,
        freetext: Array.isArray(data.freetext) ? data.freetext.length : 0,
        dataLastModified: toTimestamp((data.metadata as { lastModified?: unknown }).lastModified),
      },
    };
  }

  /**
   * Replace this device's vault with a verified backup.
   * Callers should unlock with `verified.password` afterwards.
   *
   * @param currentPassword the password of the vault being replaced, if known.
   *   Biometric credentials are kept only when it matches the restored password.
   */
  async restoreBackup(
    verified: VerifiedBackup,
    mode: RestoreMode,
    currentPassword: string | null,
    now: number = Date.now()
  ): Promise<void> {
    const { backup, password, summary } = verified;
    const datedAt = backup.lastModified ?? summary.dataLastModified ?? backup.exportedAt ?? 0;

    await databaseService.restoreVault({
      vault: backup.vault,
      lastModified: mode === 'make-current' ? now : datedAt,
      encryptedPassword: backup.encryptedPassword,
      clearBiometrics: currentPassword !== password,
    });

    // Refresh cloud recovery backups for the restored vault (never throws).
    await saltRecoveryService.saveSaltBackups(backup.vault.salt, backup.encryptedPassword ?? undefined);
  }
}

export const backupService = new BackupService();
