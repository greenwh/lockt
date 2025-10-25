// src/components/sync/ConflictResolutionDialog.tsx

import React, { useState } from 'react';
import styled from 'styled-components';
import type { EncryptedData } from '../../types/data.types';

interface ConflictResolutionDialogProps {
  localTimestamp: number;
  remoteTimestamp: number;
  localData?: EncryptedData;
  remoteData?: EncryptedData;
  onResolve: (action: 'keep-local' | 'download-remote') => void;
  onCancel: () => void;
}

const ConflictResolutionDialog: React.FC<ConflictResolutionDialogProps> = ({
  localTimestamp,
  remoteTimestamp,
  localData,
  remoteData,
  onResolve,
  onCancel,
}) => {
  const [selectedOption, setSelectedOption] = useState<'keep-local' | 'download-remote' | null>(null);

  const formatTimestamp = (timestamp: number) => {
    const date = new Date(timestamp);
    return date.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });
  };

  const getTimeDifference = () => {
    const diff = Math.abs(localTimestamp - remoteTimestamp);
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (days > 0) return `${days} day${days > 1 ? 's' : ''} apart`;
    if (hours > 0) return `${hours} hour${hours > 1 ? 's' : ''} apart`;
    if (minutes > 0) return `${minutes} minute${minutes > 1 ? 's' : ''} apart`;
    return 'less than a minute apart';
  };

  const handleResolve = () => {
    if (!selectedOption) return;
    onResolve(selectedOption);
  };

  return (
    <Overlay onClick={onCancel}>
      <DialogContainer onClick={(e) => e.stopPropagation()}>
        <Header>
          <WarningIcon>⚠️</WarningIcon>
          <Title>Sync Conflict Detected</Title>
        </Header>

        <Description>
          Your data has been modified on multiple devices. Please choose which version to keep.
        </Description>

        <TimeDifference>
          These changes are <strong>{getTimeDifference()}</strong>
        </TimeDifference>

        <VersionsContainer>
          <VersionOption
            $selected={selectedOption === 'keep-local'}
            onClick={() => setSelectedOption('keep-local')}
          >
            <VersionHeader>
              <RadioButton $selected={selectedOption === 'keep-local'}>
                {selectedOption === 'keep-local' && <RadioDot />}
              </RadioButton>
              <VersionTitle>Keep Local Version</VersionTitle>
            </VersionHeader>
            <VersionDetails>
              <VersionLabel>Last Modified:</VersionLabel>
              <VersionTimestamp>{formatTimestamp(localTimestamp)}</VersionTimestamp>
              <VersionLabel>This Device</VersionLabel>
              {localData && (
                <DataInfo>
                  <DataInfoLabel>Data size:</DataInfoLabel>
                  <DataInfoValue>{(localData.ciphertext.length / 1024).toFixed(1)} KB</DataInfoValue>
                </DataInfo>
              )}
            </VersionDetails>
            <WarningText>
              ⚠️ This will <strong>overwrite</strong> the cloud version with your local changes
            </WarningText>
          </VersionOption>

          <VersionOption
            $selected={selectedOption === 'download-remote'}
            onClick={() => setSelectedOption('download-remote')}
          >
            <VersionHeader>
              <RadioButton $selected={selectedOption === 'download-remote'}>
                {selectedOption === 'download-remote' && <RadioDot />}
              </RadioButton>
              <VersionTitle>Download Cloud Version</VersionTitle>
            </VersionHeader>
            <VersionDetails>
              <VersionLabel>Last Modified:</VersionLabel>
              <VersionTimestamp>{formatTimestamp(remoteTimestamp)}</VersionTimestamp>
              <VersionLabel>OneDrive</VersionLabel>
              {remoteData && (
                <DataInfo>
                  <DataInfoLabel>Data size:</DataInfoLabel>
                  <DataInfoValue>{(remoteData.ciphertext.length / 1024).toFixed(1)} KB</DataInfoValue>
                </DataInfo>
              )}
            </VersionDetails>
            <WarningText>
              ⚠️ This will <strong>replace</strong> your local changes with the cloud version
            </WarningText>
          </VersionOption>
        </VersionsContainer>

        <InfoBox>
          <InfoIcon>💡</InfoIcon>
          <InfoText>
            <strong>Tip:</strong> To avoid conflicts in the future, always sync before making changes on a new device.
          </InfoText>
        </InfoBox>

        <ButtonGroup>
          <CancelButton onClick={onCancel}>Cancel</CancelButton>
          <ResolveButton onClick={handleResolve} disabled={!selectedOption}>
            {selectedOption === 'keep-local' && 'Upload Local Version'}
            {selectedOption === 'download-remote' && 'Download Cloud Version'}
            {!selectedOption && 'Select an Option'}
          </ResolveButton>
        </ButtonGroup>
      </DialogContainer>
    </Overlay>
  );
};

export default ConflictResolutionDialog;

// Styled Components
const Overlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.7);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 16px;
`;

const DialogContainer = styled.div`
  background: ${(props) => props.theme.colors.background};
  border-radius: 16px;
  max-width: 600px;
  width: 100%;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
`;

const Header = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 24px 24px 16px 24px;
  border-bottom: 1px solid ${(props) => props.theme.colors.border};
`;

const WarningIcon = styled.div`
  font-size: 32px;
`;

const Title = styled.h2`
  font-size: 20px;
  font-weight: 600;
  margin: 0;
  color: ${(props) => props.theme.colors.text};
`;

const Description = styled.p`
  padding: 16px 24px 0 24px;
  margin: 0;
  font-size: 14px;
  color: ${(props) => props.theme.colors.textSecondary};
  line-height: 1.5;
`;

const TimeDifference = styled.p`
  padding: 8px 24px 16px 24px;
  margin: 0;
  font-size: 13px;
  color: ${(props) => props.theme.colors.textSecondary};

  strong {
    color: ${(props) => props.theme.colors.warning};
    font-weight: 600;
  }
`;

const VersionsContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
  padding: 0 24px 16px 24px;
`;

const VersionOption = styled.div<{ $selected: boolean }>`
  border: 2px solid ${(props) => (props.$selected ? props.theme.colors.primary : props.theme.colors.border)};
  border-radius: 12px;
  padding: 16px;
  cursor: pointer;
  transition: all 0.2s;
  background: ${(props) => (props.$selected ? `${props.theme.colors.primary}10` : props.theme.colors.surface)};

  &:hover {
    border-color: ${(props) => props.theme.colors.primary};
  }
`;

const VersionHeader = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 12px;
`;

const RadioButton = styled.div<{ $selected: boolean }>`
  width: 20px;
  height: 20px;
  border-radius: 50%;
  border: 2px solid ${(props) => (props.$selected ? props.theme.colors.primary : props.theme.colors.border)};
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
`;

const RadioDot = styled.div`
  width: 10px;
  height: 10px;
  border-radius: 50%;
  background: ${(props) => props.theme.colors.primary};
`;

const VersionTitle = styled.h3`
  font-size: 16px;
  font-weight: 600;
  margin: 0;
  color: ${(props) => props.theme.colors.text};
`;

const VersionDetails = styled.div`
  display: grid;
  grid-template-columns: auto 1fr;
  gap: 4px 12px;
  margin-left: 32px;
  font-size: 13px;
`;

const VersionLabel = styled.span`
  color: ${(props) => props.theme.colors.textSecondary};
`;

const VersionTimestamp = styled.span`
  color: ${(props) => props.theme.colors.text};
  font-weight: 500;
`;

const DataInfo = styled.div`
  grid-column: 1 / -1;
  display: flex;
  gap: 8px;
  margin-top: 4px;
`;

const DataInfoLabel = styled.span`
  color: ${(props) => props.theme.colors.textSecondary};
`;

const DataInfoValue = styled.span`
  color: ${(props) => props.theme.colors.text};
  font-weight: 500;
`;

const WarningText = styled.p`
  margin: 12px 0 0 32px;
  font-size: 12px;
  color: ${(props) => props.theme.colors.warning};
  line-height: 1.4;

  strong {
    font-weight: 600;
  }
`;

const InfoBox = styled.div`
  display: flex;
  gap: 12px;
  padding: 12px 24px;
  margin: 0 24px 16px 24px;
  background: ${(props) => props.theme.colors.surface};
  border-radius: 8px;
  border: 1px solid ${(props) => props.theme.colors.border};
`;

const InfoIcon = styled.div`
  font-size: 20px;
  flex-shrink: 0;
`;

const InfoText = styled.p`
  margin: 0;
  font-size: 13px;
  color: ${(props) => props.theme.colors.textSecondary};
  line-height: 1.5;

  strong {
    color: ${(props) => props.theme.colors.text};
    font-weight: 600;
  }
`;

const ButtonGroup = styled.div`
  display: flex;
  gap: 12px;
  padding: 16px 24px 24px 24px;
  border-top: 1px solid ${(props) => props.theme.colors.border};
`;

const CancelButton = styled.button`
  flex: 1;
  padding: 12px 24px;
  background: transparent;
  color: ${(props) => props.theme.colors.textSecondary};
  border: 1px solid ${(props) => props.theme.colors.border};
  border-radius: 8px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    background: ${(props) => props.theme.colors.surface};
  }
`;

const ResolveButton = styled.button`
  flex: 2;
  padding: 12px 24px;
  background: ${(props) => props.theme.colors.primary};
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: opacity 0.2s;

  &:hover:not(:disabled) {
    opacity: 0.9;
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;
