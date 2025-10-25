// src/components/auth/RecoveryFlow.tsx

import React, { useState, useEffect } from 'react';
import { databaseService } from '../../services/database.service';
import { oneDriveService } from '../../services/onedrive.service';
import styled from 'styled-components';

interface RecoveryFlowProps {
  onRecoveryComplete: () => void;
  onRecoveryFailed: () => void;
}

const RecoveryFlow: React.FC<RecoveryFlowProps> = ({ onRecoveryComplete, onRecoveryFailed }) => {
  const [status, setStatus] = useState<'checking' | 'found' | 'not-found' | 'recovering' | 'success' | 'failed'>('checking');
  const [backupStatus, setBackupStatus] = useState<{
    indexedDB: boolean;
    localStorage: boolean;
    oneDrive: boolean;
  } | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [needsOneDriveSignIn, setNeedsOneDriveSignIn] = useState(false);

  useEffect(() => {
    checkSaltStatus();
  }, []);

  const checkSaltStatus = async () => {
    try {
      setStatus('checking');
      const backups = await databaseService.getSaltBackupStatus();
      setBackupStatus(backups);

      if (backups.indexedDB) {
        // Salt exists in IndexedDB, no recovery needed
        setStatus('found');
        setTimeout(() => onRecoveryComplete(), 1500);
      } else if (backups.localStorage || backups.oneDrive) {
        // Salt available in backups
        setStatus('found');
      } else {
        // No salt found anywhere
        setStatus('not-found');
      }
    } catch (error) {
      console.error('Failed to check salt status:', error);
      setErrorMessage('Failed to check recovery options');
      setStatus('failed');
    }
  };

  const attemptRecovery = async () => {
    try {
      setStatus('recovering');
      setErrorMessage(null);

      // If OneDrive backup exists but not signed in, prompt sign-in
      if (backupStatus?.oneDrive && !oneDriveService.isSignedIn()) {
        setNeedsOneDriveSignIn(true);
        return;
      }

      const recoveredSalt = await databaseService.recoverSalt();

      if (recoveredSalt) {
        setStatus('success');
        setTimeout(() => onRecoveryComplete(), 2000);
      } else {
        setStatus('failed');
        setErrorMessage('No recovery backups found. You may need to reset the app and start over.');
      }
    } catch (error) {
      console.error('Recovery failed:', error);
      setStatus('failed');
      setErrorMessage(error instanceof Error ? error.message : 'Recovery failed');
    }
  };

  const signInToOneDrive = async () => {
    try {
      await oneDriveService.signIn();
      setNeedsOneDriveSignIn(false);
      // Retry recovery after sign-in
      await attemptRecovery();
    } catch (error) {
      console.error('OneDrive sign-in failed:', error);
      setErrorMessage('Failed to sign in to OneDrive');
    }
  };

  const handleReset = () => {
    if (window.confirm('This will delete all data and start fresh. Are you sure?')) {
      onRecoveryFailed();
    }
  };

  return (
    <Container>
      <Title>Account Recovery</Title>

      {status === 'checking' && (
        <StatusSection>
          <StatusIcon>🔍</StatusIcon>
          <StatusText>Checking for recovery options...</StatusText>
          <Spinner />
        </StatusSection>
      )}

      {status === 'found' && backupStatus && !backupStatus.indexedDB && (
        <StatusSection>
          <StatusIcon>✅</StatusIcon>
          <StatusText>Recovery backup found!</StatusText>
          <BackupList>
            {backupStatus.localStorage && (
              <BackupItem>
                <BackupIcon>💾</BackupIcon>
                <BackupLabel>Browser Storage</BackupLabel>
                <BackupStatus>Available</BackupStatus>
              </BackupItem>
            )}
            {backupStatus.oneDrive && (
              <BackupItem>
                <BackupIcon>☁️</BackupIcon>
                <BackupLabel>OneDrive</BackupLabel>
                <BackupStatus>Available</BackupStatus>
              </BackupItem>
            )}
          </BackupList>
          {!needsOneDriveSignIn ? (
            <RecoveryButton onClick={attemptRecovery}>Recover Account</RecoveryButton>
          ) : (
            <>
              <InfoText>Sign in to OneDrive to recover from cloud backup</InfoText>
              <RecoveryButton onClick={signInToOneDrive}>Sign in to OneDrive</RecoveryButton>
            </>
          )}
        </StatusSection>
      )}

      {status === 'not-found' && (
        <StatusSection>
          <StatusIcon>❌</StatusIcon>
          <StatusText>No Recovery Backups Found</StatusText>
          <InfoText>
            Your encryption key could not be recovered from any backup location.
            This may happen if:
          </InfoText>
          <ReasonList>
            <li>This is your first time using Lockt on this device</li>
            <li>Browser data was cleared completely</li>
            <li>You haven't synced to OneDrive yet</li>
          </ReasonList>
          <ButtonGroup>
            <RecoveryButton onClick={() => onRecoveryComplete()}>
              Start Fresh Setup
            </RecoveryButton>
            <SecondaryButton onClick={handleReset}>Reset App</SecondaryButton>
          </ButtonGroup>
        </StatusSection>
      )}

      {status === 'recovering' && (
        <StatusSection>
          <StatusIcon>🔄</StatusIcon>
          <StatusText>Recovering your account...</StatusText>
          <Spinner />
        </StatusSection>
      )}

      {status === 'success' && (
        <StatusSection>
          <StatusIcon>🎉</StatusIcon>
          <StatusText>Account Recovered Successfully!</StatusText>
          <InfoText>You can now sign in with your password</InfoText>
        </StatusSection>
      )}

      {status === 'failed' && (
        <StatusSection>
          <StatusIcon>⚠️</StatusIcon>
          <StatusText>Recovery Failed</StatusText>
          <ErrorText>{errorMessage || 'Unable to recover account'}</ErrorText>
          <ButtonGroup>
            <RecoveryButton onClick={checkSaltStatus}>Try Again</RecoveryButton>
            <SecondaryButton onClick={handleReset}>Reset App</SecondaryButton>
          </ButtonGroup>
        </StatusSection>
      )}

      {backupStatus && (
        <BackupStatusBox>
          <BackupStatusTitle>Backup Status</BackupStatusTitle>
          <BackupStatusList>
            <BackupStatusItem>
              <BackupStatusLabel>IndexedDB:</BackupStatusLabel>
              <BackupStatusValue $available={backupStatus.indexedDB}>
                {backupStatus.indexedDB ? '✓ Available' : '✗ Missing'}
              </BackupStatusValue>
            </BackupStatusItem>
            <BackupStatusItem>
              <BackupStatusLabel>Browser Storage:</BackupStatusLabel>
              <BackupStatusValue $available={backupStatus.localStorage}>
                {backupStatus.localStorage ? '✓ Available' : '✗ Missing'}
              </BackupStatusValue>
            </BackupStatusItem>
            <BackupStatusItem>
              <BackupStatusLabel>OneDrive:</BackupStatusLabel>
              <BackupStatusValue $available={backupStatus.oneDrive}>
                {backupStatus.oneDrive ? '✓ Available' : '✗ Missing'}
              </BackupStatusValue>
            </BackupStatusItem>
          </BackupStatusList>
        </BackupStatusBox>
      )}
    </Container>
  );
};

export default RecoveryFlow;

// Styled Components
const Container = styled.div`
  max-width: 500px;
  margin: 0 auto;
  padding: 24px;
`;

const Title = styled.h1`
  font-size: 24px;
  font-weight: 600;
  text-align: center;
  margin-bottom: 32px;
  color: ${(props) => props.theme.colors.text};
`;

const StatusSection = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
  padding: 24px;
  background: ${(props) => props.theme.colors.surface};
  border-radius: 12px;
  margin-bottom: 24px;
`;

const StatusIcon = styled.div`
  font-size: 48px;
`;

const StatusText = styled.p`
  font-size: 18px;
  font-weight: 500;
  text-align: center;
  color: ${(props) => props.theme.colors.text};
  margin: 0;
`;

const InfoText = styled.p`
  font-size: 14px;
  text-align: center;
  color: ${(props) => props.theme.colors.textSecondary};
  margin: 0;
  max-width: 400px;
`;

const ErrorText = styled.p`
  font-size: 14px;
  text-align: center;
  color: ${(props) => props.theme.colors.error};
  margin: 0;
  max-width: 400px;
`;

const BackupList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
  width: 100%;
  margin-top: 8px;
`;

const BackupItem = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 16px;
  background: ${(props) => props.theme.colors.background};
  border-radius: 8px;
`;

const BackupIcon = styled.span`
  font-size: 24px;
`;

const BackupLabel = styled.span`
  flex: 1;
  font-size: 14px;
  font-weight: 500;
  color: ${(props) => props.theme.colors.text};
`;

const BackupStatus = styled.span`
  font-size: 12px;
  color: ${(props) => props.theme.colors.success};
  font-weight: 600;
`;

const RecoveryButton = styled.button`
  padding: 12px 32px;
  background: ${(props) => props.theme.colors.primary};
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: opacity 0.2s;

  &:hover {
    opacity: 0.9;
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const SecondaryButton = styled.button`
  padding: 12px 32px;
  background: transparent;
  color: ${(props) => props.theme.colors.textSecondary};
  border: 1px solid ${(props) => props.theme.colors.border};
  border-radius: 8px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    background: ${(props) => props.theme.colors.surface};
  }
`;

const ButtonGroup = styled.div`
  display: flex;
  gap: 12px;
  margin-top: 16px;
`;

const ReasonList = styled.ul`
  text-align: left;
  color: ${(props) => props.theme.colors.textSecondary};
  font-size: 14px;
  margin: 8px 0;
  padding-left: 24px;

  li {
    margin: 4px 0;
  }
`;

const Spinner = styled.div`
  width: 32px;
  height: 32px;
  border: 3px solid ${(props) => props.theme.colors.border};
  border-top-color: ${(props) => props.theme.colors.primary};
  border-radius: 50%;
  animation: spin 1s linear infinite;

  @keyframes spin {
    to {
      transform: rotate(360deg);
    }
  }
`;

const BackupStatusBox = styled.div`
  background: ${(props) => props.theme.colors.surface};
  border-radius: 8px;
  padding: 16px;
`;

const BackupStatusTitle = styled.h3`
  font-size: 14px;
  font-weight: 600;
  color: ${(props) => props.theme.colors.text};
  margin: 0 0 12px 0;
`;

const BackupStatusList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

const BackupStatusItem = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const BackupStatusLabel = styled.span`
  font-size: 13px;
  color: ${(props) => props.theme.colors.textSecondary};
`;

const BackupStatusValue = styled.span<{ $available: boolean }>`
  font-size: 13px;
  font-weight: 600;
  color: ${(props) => (props.$available ? props.theme.colors.success : props.theme.colors.error)};
`;
