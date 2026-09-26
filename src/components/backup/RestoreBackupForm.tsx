// src/components/backup/RestoreBackupForm.tsx

import React, { useState } from 'react';
import styled from 'styled-components';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../hooks/useToast';
import { backupService, BackupError } from '../../services/backup.service';
import type { ParsedBackup, VerifiedBackup, RestoreMode } from '../../services/backup.service';
import Button from '../common/Button';
import Input from '../common/Input';

const MAX_BACKUP_BYTES = 50 * 1024 * 1024;

interface RestoreBackupFormProps {
  /** Called after the vault is restored and unlocked. */
  onRestored: () => void;
  onCancel?: () => void;
}

const SOURCE_LABELS: Record<ParsedBackup['source'], string> = {
  'lockt-backup': 'Lockt backup file',
  'legacy-export': 'Older Lockt export',
  'raw-vault': 'Vault file from OneDrive',
};

const formatDateTime = (ts: number | null) => (ts ? new Date(ts).toLocaleString() : 'Unknown');

const RestoreBackupForm: React.FC<RestoreBackupFormProps> = ({ onRestored, onCancel }) => {
  const { restoreBackup, isLocked } = useAuth();
  const toast = useToast();

  const [fileName, setFileName] = useState<string | null>(null);
  const [parsed, setParsed] = useState<ParsedBackup | null>(null);
  const [useRecoveryPhrase, setUseRecoveryPhrase] = useState(false);
  const [password, setPassword] = useState('');
  const [recoveryPhrase, setRecoveryPhrase] = useState('');
  const [verified, setVerified] = useState<VerifiedBackup | null>(null);
  const [mode, setMode] = useState<RestoreMode>('keep-newer');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const reset = () => {
    setParsed(null);
    setVerified(null);
    setPassword('');
    setRecoveryPhrase('');
    setUseRecoveryPhrase(false);
    setError(null);
  };

  const handleFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = ''; // allow re-selecting the same file
    reset();
    if (!file) return;

    setFileName(file.name);
    if (file.size > MAX_BACKUP_BYTES) {
      setError('This file is too large to be a Lockt backup.');
      return;
    }
    try {
      setParsed(backupService.parseBackupFile(await file.text()));
    } catch (err) {
      setError(err instanceof BackupError ? err.message : 'Could not read this file.');
    }
  };

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!parsed) return;
    setError(null);
    setBusy(true);
    try {
      const result = await backupService.verifyBackup(
        parsed,
        useRecoveryPhrase ? { recoveryPhrase } : { password }
      );
      setVerified(result);
      setPassword('');
      setRecoveryPhrase('');
    } catch (err) {
      setError(err instanceof BackupError ? err.message : 'Could not open this backup.');
    } finally {
      setBusy(false);
    }
  };

  const handleRestore = async () => {
    if (!verified) return;
    setError(null);
    setBusy(true);
    try {
      await restoreBackup(verified, mode);
      toast.success('Backup restored. Lockt is unlocked with the restored data.');
      setVerified(null);
      onRestored();
    } catch (err) {
      console.error('Restore failed:', err);
      setError(err instanceof Error ? `Restore failed: ${err.message}` : 'Restore failed.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <Container>
      {!verified && (
        <>
          <FileLabel>
            <HiddenFileInput type="file" onChange={handleFile} disabled={busy} />
            <FileButton>{fileName ? 'Choose a different file' : 'Choose backup file…'}</FileButton>
            {fileName && <FileName>{fileName}</FileName>}
          </FileLabel>
          <Hint>
            Choose a <code>lockt-backup-…</code> file (<code>.json</code> or <code>.txt</code>), or{' '}
            <code>lockt-data.encrypted</code> downloaded from OneDrive (Apps → Lockt).
          </Hint>
        </>
      )}

      {parsed && !verified && (
        <Form onSubmit={handleVerify}>
          <Details>
            <DetailRow>
              <span>Type</span>
              <span>{SOURCE_LABELS[parsed.source]}</span>
            </DetailRow>
            {parsed.exportedAt && (
              <DetailRow>
                <span>Backed up</span>
                <span>{formatDateTime(parsed.exportedAt)}</span>
              </DetailRow>
            )}
          </Details>

          {useRecoveryPhrase ? (
            <PhraseField>
              <PhraseLabel htmlFor="restore-phrase">Recovery phrase (12 words)</PhraseLabel>
              <PhraseInput
                id="restore-phrase"
                value={recoveryPhrase}
                onChange={(e) => setRecoveryPhrase(e.target.value)}
                rows={3}
                autoComplete="off"
                spellCheck={false}
                disabled={busy}
              />
            </PhraseField>
          ) : (
            <Input
              label="Master password for this backup"
              id="restore-password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.currentTarget.value)}
              autoComplete="current-password"
              disabled={busy}
            />
          )}

          {parsed.encryptedPassword && (
            <LinkButton type="button" onClick={() => setUseRecoveryPhrase((v) => !v)} disabled={busy}>
              {useRecoveryPhrase ? 'Use master password instead' : 'Forgot the password? Use recovery phrase'}
            </LinkButton>
          )}

          <Hint>Use the password that was in effect when this backup was made. Nothing is changed yet.</Hint>

          <Button
            type="submit"
            disabled={busy || (useRecoveryPhrase ? !recoveryPhrase.trim() : !password)}
            style={{ width: '100%' }}
          >
            {busy ? 'Checking… (this takes a few seconds)' : 'Open backup'}
          </Button>
        </Form>
      )}

      {verified && (
        <>
          <Verified>✅ Backup opened successfully</Verified>
          <Details>
            <DetailRow>
              <span>Passwords</span>
              <span>{verified.summary.passwords}</span>
            </DetailRow>
            <DetailRow>
              <span>Credit cards</span>
              <span>{verified.summary.creditCards}</span>
            </DetailRow>
            <DetailRow>
              <span>Crypto</span>
              <span>{verified.summary.crypto}</span>
            </DetailRow>
            <DetailRow>
              <span>Other records</span>
              <span>{verified.summary.freetext}</span>
            </DetailRow>
            <DetailRow>
              <span>Last changed</span>
              <span>{formatDateTime(verified.summary.dataLastModified)}</span>
            </DetailRow>
          </Details>

          <Fieldset>
            <legend>After restoring, when Lockt syncs with OneDrive:</legend>
            <RadioRow>
              <input
                type="radio"
                name="restore-mode"
                checked={mode === 'keep-newer'}
                onChange={() => setMode('keep-newer')}
                disabled={busy}
              />
              <span>
                <strong>Keep the newest version</strong> (recommended). If OneDrive has newer data than this backup,
                sync replaces the restore with it.
              </span>
            </RadioRow>
            <RadioRow>
              <input
                type="radio"
                name="restore-mode"
                checked={mode === 'make-current'}
                onChange={() => setMode('make-current')}
                disabled={busy}
              />
              <span>
                <strong>Make this backup the current version.</strong> Sync uploads it and replaces the OneDrive copy.
                Use this if the OneDrive copy is wrong. (OneDrive keeps older versions in its version history.)
              </span>
            </RadioRow>
          </Fieldset>

          <Warning>
            {isLocked
              ? 'This sets up Lockt on this device from the backup.'
              : 'This replaces the Lockt data on this device with the backup.'}
          </Warning>

          <Button type="button" onClick={handleRestore} disabled={busy} style={{ width: '100%' }}>
            {busy ? 'Restoring…' : 'Restore this backup'}
          </Button>
          <LinkButton type="button" onClick={reset} disabled={busy}>
            Start over
          </LinkButton>
        </>
      )}

      {error && <ErrorMessage role="alert">{error}</ErrorMessage>}

      {onCancel && (
        <LinkButton type="button" onClick={onCancel} disabled={busy}>
          Cancel
        </LinkButton>
      )}
    </Container>
  );
};

export default RestoreBackupForm;

// Styled Components
const Container = styled.div`
  display: flex;
  flex-direction: column;
  gap: 14px;
  width: 100%;
  max-width: 500px;
  text-align: left;
`;

const FileLabel = styled.label`
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 12px;
  cursor: pointer;
`;

const HiddenFileInput = styled.input`
  position: absolute;
  width: 1px;
  height: 1px;
  opacity: 0;
  overflow: hidden;
`;

const FileButton = styled.span`
  display: inline-block;
  padding: 10px 20px;
  border: 1px solid ${(props) => props.theme.colors.primary};
  border-radius: 8px;
  color: ${(props) => props.theme.colors.primary};
  font-weight: 600;
  font-size: 14px;

  ${FileLabel}:focus-within & {
    outline: 2px solid ${(props) => props.theme.colors.primary};
    outline-offset: 2px;
  }
`;

const FileName = styled.span`
  font-size: 14px;
  color: ${(props) => props.theme.colors.text};
  word-break: break-all;
`;

const Hint = styled.p`
  margin: 0;
  font-size: 12px;
  color: ${(props) => props.theme.colors.textSecondary};
  line-height: 1.5;
`;

const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: 14px;
`;

const Details = styled.div`
  padding: 12px 16px;
  background: ${(props) => props.theme.colors.background};
  border: 1px solid ${(props) => props.theme.colors.border};
  border-radius: 8px;
  font-size: 14px;
`;

const DetailRow = styled.div`
  display: flex;
  justify-content: space-between;
  gap: 12px;
  padding: 3px 0;
  color: ${(props) => props.theme.colors.text};

  span:first-child {
    color: ${(props) => props.theme.colors.textSecondary};
  }
`;

const PhraseField = styled.div`
  display: flex;
  flex-direction: column;
  gap: 6px;
`;

const PhraseLabel = styled.label`
  font-size: 14px;
  font-weight: 600;
  color: ${(props) => props.theme.colors.text};
`;

const PhraseInput = styled.textarea`
  width: 100%;
  padding: 12px;
  border: 1px solid ${(props) => props.theme.colors.border};
  border-radius: 8px;
  font-size: 14px;
  font-family: 'Courier New', monospace;
  resize: vertical;
  box-sizing: border-box;

  &:focus {
    outline: none;
    border-color: ${(props) => props.theme.colors.primary};
  }
`;

const LinkButton = styled.button`
  align-self: flex-start;
  padding: 4px 0;
  background: none;
  border: none;
  color: ${(props) => props.theme.colors.primary};
  font-size: 14px;
  cursor: pointer;
  text-decoration: underline;

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const Verified = styled.div`
  font-weight: 600;
  color: ${(props) => props.theme.colors.success};
`;

const Fieldset = styled.fieldset`
  display: flex;
  flex-direction: column;
  gap: 10px;
  margin: 0;
  padding: 12px 16px;
  border: 1px solid ${(props) => props.theme.colors.border};
  border-radius: 8px;
  font-size: 14px;
  color: ${(props) => props.theme.colors.text};

  legend {
    padding: 0 6px;
    font-weight: 600;
  }
`;

const RadioRow = styled.label`
  display: flex;
  gap: 10px;
  align-items: flex-start;
  line-height: 1.5;
  cursor: pointer;

  input {
    margin-top: 4px;
    flex-shrink: 0;
  }
`;

const Warning = styled.div`
  padding: 10px 14px;
  background: #fff8e1;
  border: 1px solid #ffe08a;
  border-radius: 8px;
  font-size: 14px;
  color: #6d5200;
`;

const ErrorMessage = styled.div`
  color: #dc3545;
  font-size: 14px;
  padding: 12px;
  background: #dc354510;
  border: 1px solid #dc354530;
  border-radius: 8px;
`;
