// src/components/settings/BackupSettings.tsx

import React, { useCallback, useEffect, useState } from 'react';
import styled from 'styled-components';
import { useToast } from '../../hooks/useToast';
import { backupService, BackupError } from '../../services/backup.service';
import { storagePersistenceService } from '../../services/storagePersistence.service';
import type { PersistenceStatus } from '../../services/storagePersistence.service';
import RestoreBackupForm from '../backup/RestoreBackupForm';
import Button from '../common/Button';

const BACKUP_REMINDER_DAYS = 30;
const DAY_MS = 24 * 60 * 60 * 1000;

const PERSISTENCE_TEXT: Record<PersistenceStatus, string> = {
  persisted: '✓ Protected — the browser will not clear Lockt data to free up space.',
  'not-persisted': '⚠️ Not protected — the browser may clear Lockt data when storage runs low.',
  unsupported: 'This browser does not support storage protection.',
};

function saveBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.rel = 'noopener';
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 60_000);
}

const BackupSettings: React.FC = () => {
  const toast = useToast();
  const [lastBackup, setLastBackup] = useState<number | null>(null);
  const [persistence, setPersistence] = useState<PersistenceStatus | null>(null);
  const [busy, setBusy] = useState(false);
  const [showRestore, setShowRestore] = useState(false);

  const canShareFiles =
    typeof navigator !== 'undefined' &&
    typeof navigator.canShare === 'function' &&
    navigator.canShare({ files: [new File([''], 'test.json', { type: 'application/json' })] });

  const refresh = useCallback(async () => {
    setLastBackup(await backupService.getLastBackupExportedAt());
    setPersistence(await storagePersistenceService.getStatus());
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const handleExport = async (viaShare: boolean) => {
    setBusy(true);
    try {
      const { blob, filename } = await backupService.createBackupFile();
      if (viaShare) {
        const file = new File([blob], filename, { type: 'application/json' });
        try {
          await navigator.share({ files: [file], title: 'Lockt backup' });
        } catch (err) {
          if (err instanceof DOMException && err.name === 'AbortError') return; // user cancelled
          throw err;
        }
      } else {
        saveBlob(blob, filename);
      }
      await backupService.markBackupExported();
      await refresh();
      toast.success(`Backup saved as ${filename}`);
    } catch (err) {
      console.error('Backup export failed:', err);
      toast.error(err instanceof BackupError ? err.message : 'Could not create the backup file.');
    } finally {
      setBusy(false);
    }
  };

  const handleRequestPersistence = async () => {
    const status = await storagePersistenceService.request();
    setPersistence(status);
    if (status === 'not-persisted') {
      toast.warning('The browser declined. Installing Lockt as an app usually allows it.');
    }
  };

  const backupIsStale = !lastBackup || Date.now() - lastBackup > BACKUP_REMINDER_DAYS * DAY_MS;

  return (
    <Container>
      <Card>
        <CardTitle>Backup file</CardTitle>
        <Text>
          Save an encrypted copy of your vault as a file you keep outside this browser — a USB drive, your OneDrive
          folder, or an email to yourself. Opening it needs your master password (or recovery phrase), so it is as
          safe as the copy Lockt keeps on OneDrive.
        </Text>
        <Status $warn={backupIsStale}>
          {lastBackup
            ? `Last backup from this device: ${new Date(lastBackup).toLocaleDateString()}`
            : 'No backup has been made from this device yet.'}
          {lastBackup && backupIsStale && ' — consider making a new one.'}
        </Status>
        <Buttons>
          <Button type="button" onClick={() => handleExport(false)} disabled={busy}>
            {busy ? 'Preparing…' : '⬇️ Download backup'}
          </Button>
          {canShareFiles && (
            <SecondaryButton type="button" onClick={() => handleExport(true)} disabled={busy}>
              Share / Save to Files…
            </SecondaryButton>
          )}
        </Buttons>
        <Small>
          Make a new backup after important changes. Delete any unencrypted CSV exports once you have an encrypted
          backup.
        </Small>
      </Card>

      <Card>
        <CardTitle>Restore</CardTitle>
        {showRestore ? (
          <RestoreBackupForm onRestored={() => setShowRestore(false)} onCancel={() => setShowRestore(false)} />
        ) : (
          <>
            <Text>
              Replace the data on this device with a backup file, or with <code>lockt-data.encrypted</code> downloaded
              from OneDrive (including an older version from OneDrive's version history).
            </Text>
            <Buttons>
              <SecondaryButton type="button" onClick={() => setShowRestore(true)}>
                Restore from backup file…
              </SecondaryButton>
            </Buttons>
          </>
        )}
      </Card>

      <Card>
        <CardTitle>Storage protection</CardTitle>
        <Status $warn={persistence === 'not-persisted'}>{persistence ? PERSISTENCE_TEXT[persistence] : '…'}</Status>
        {persistence === 'not-persisted' && (
          <Buttons>
            <SecondaryButton type="button" onClick={handleRequestPersistence}>
              Protect Lockt data
            </SecondaryButton>
          </Buttons>
        )}
        <Small>
          This does not stop you or your browser settings from deleting site data. In Firefox, check Settings → Privacy
          &amp; Security → Cookies and Site Data: if "Delete cookies and site data when Firefox is closed" is on, add an
          exception for <code>{window.location.origin}</code>.
        </Small>
      </Card>
    </Container>
  );
};

export default BackupSettings;

// Styled Components
const Container = styled.div`
  display: flex;
  flex-direction: column;
  gap: 16px;
`;

const Card = styled.div`
  padding: 16px 20px;
  background: ${(props) => props.theme.colors.surface};
  border: 1px solid ${(props) => props.theme.colors.border};
  border-radius: 12px;
`;

const CardTitle = styled.h3`
  margin: 0 0 10px 0;
  font-size: 16px;
  color: ${(props) => props.theme.colors.text};
`;

const Text = styled.p`
  margin: 0 0 12px 0;
  font-size: 14px;
  line-height: 1.5;
  color: ${(props) => props.theme.colors.textSecondary};
`;

const Status = styled.p<{ $warn?: boolean }>`
  margin: 0 0 12px 0;
  font-size: 14px;
  font-weight: 600;
  color: ${(props) => (props.$warn ? '#8a6d00' : props.theme.colors.success)};
`;

const Buttons = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  margin-bottom: 12px;
`;

const SecondaryButton = styled.button`
  padding: 10px 20px;
  background: transparent;
  color: ${(props) => props.theme.colors.primary};
  border: 1px solid ${(props) => props.theme.colors.primary};
  border-radius: 8px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const Small = styled.p`
  margin: 0;
  font-size: 12px;
  line-height: 1.5;
  color: ${(props) => props.theme.colors.textSecondary};
`;
