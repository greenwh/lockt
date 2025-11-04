// src/components/settings/BiometricSettings.tsx

import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { useAuth } from '../../context/AuthContext';
import type { BiometricCredential } from '../../services/webauthn.service';
import { webAuthnService } from '../../services/webauthn.service';
import Button from '../common/Button';
import Input from '../common/Input';

const BiometricSettings: React.FC = () => {
  const {
    biometricAvailable,
    hasBiometricEnabled,
    enableBiometric,
    disableBiometric,
    getBiometricCredentials,
    refreshBiometricStatus,
  } = useAuth();

  const [credentials, setCredentials] = useState<BiometricCredential[]>([]);
  const [isEnrolling, setIsEnrolling] = useState(false);
  const [deviceName, setDeviceName] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Load credentials on mount
  useEffect(() => {
    loadCredentials();
  }, [hasBiometricEnabled]);

  const loadCredentials = async () => {
    try {
      const creds = await getBiometricCredentials();
      setCredentials(creds);
    } catch (err) {
      console.error('Failed to load biometric credentials:', err);
    }
  };

  const handleEnroll = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (!deviceName.trim()) {
      setError('Device name is required');
      return;
    }

    try {
      setIsEnrolling(true);
      await enableBiometric(deviceName.trim());
      setSuccess(`${webAuthnService.getAuthenticatorName()} enabled successfully!`);
      setDeviceName('');
      await refreshBiometricStatus();
      await loadCredentials();
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to enable biometric authentication';
      setError(message);
    } finally {
      setIsEnrolling(false);
    }
  };

  const handleRemove = async (credentialId: string) => {
    if (!confirm('Are you sure you want to remove this biometric credential?')) {
      return;
    }

    try {
      setError(null);
      setSuccess(null);
      await disableBiometric(credentialId);
      setSuccess('Biometric credential removed successfully');
      await refreshBiometricStatus();
      await loadCredentials();
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to remove biometric credential';
      setError(message);
    }
  };

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (!biometricAvailable) {
    return (
      <Container>
        <InfoBox type="info">
          <InfoIcon>ℹ️</InfoIcon>
          <InfoText>
            <strong>Biometric authentication not available</strong>
            <p>
              Your device doesn't support biometric authentication (Face ID, Touch ID, Windows Hello, etc.),
              or it's not configured in your system settings.
            </p>
          </InfoText>
        </InfoBox>
      </Container>
    );
  }

  return (
    <Container>
      <Description>
        Enable biometric authentication (Face ID, Touch ID, Windows Hello) for quick and secure access to Lockt.
        Your master password will be encrypted and stored securely on this device.
      </Description>

      {error && (
        <InfoBox type="error">
          <InfoIcon>❌</InfoIcon>
          <InfoText>{error}</InfoText>
        </InfoBox>
      )}

      {success && (
        <InfoBox type="success">
          <InfoIcon>✅</InfoIcon>
          <InfoText>{success}</InfoText>
        </InfoBox>
      )}

      {/* Enrollment Form */}
      {!hasBiometricEnabled && (
        <EnrollmentCard>
          <CardTitle>Enable {webAuthnService.getAuthenticatorName()}</CardTitle>
          <CardDescription>
            Register your biometric credential to unlock Lockt without entering your password.
          </CardDescription>
          <Form onSubmit={handleEnroll}>
            <Input
              label="Device Name"
              id="deviceName"
              type="text"
              value={deviceName}
              onChange={(e) => setDeviceName(e.currentTarget.value)}
              placeholder="e.g., My iPhone, Work Laptop"
              disabled={isEnrolling}
            />
            <Button type="submit" disabled={isEnrolling} style={{ width: '100%' }}>
              {isEnrolling ? 'Enrolling...' : `Enable ${webAuthnService.getAuthenticatorName()}`}
            </Button>
          </Form>
        </EnrollmentCard>
      )}

      {/* Enrolled Credentials List */}
      {hasBiometricEnabled && credentials.length > 0 && (
        <CredentialsList>
          <ListHeader>
            <ListTitle>Enrolled Devices</ListTitle>
            <Badge>{credentials.length}</Badge>
          </ListHeader>
          {credentials.map((credential) => (
            <CredentialCard key={credential.id}>
              <CredentialIcon>🔐</CredentialIcon>
              <CredentialInfo>
                <CredentialName>{credential.deviceName}</CredentialName>
                <CredentialMeta>
                  <MetaItem>
                    <MetaLabel>Created:</MetaLabel>
                    <MetaValue>{formatDate(credential.createdAt)}</MetaValue>
                  </MetaItem>
                  <MetaItem>
                    <MetaLabel>Last used:</MetaLabel>
                    <MetaValue>{formatDate(credential.lastUsedAt)}</MetaValue>
                  </MetaItem>
                </CredentialMeta>
              </CredentialInfo>
              <RemoveButton
                onClick={() => handleRemove(credential.id)}
                title="Remove this credential"
              >
                🗑️
              </RemoveButton>
            </CredentialCard>
          ))}
        </CredentialsList>
      )}

      {/* Add Another Device (if already enrolled) */}
      {hasBiometricEnabled && (
        <EnrollmentCard style={{ marginTop: '24px' }}>
          <CardTitle>Add Another Device</CardTitle>
          <CardDescription>
            You can enroll multiple devices to access Lockt with biometric authentication.
          </CardDescription>
          <Form onSubmit={handleEnroll}>
            <Input
              label="Device Name"
              id="deviceName"
              type="text"
              value={deviceName}
              onChange={(e) => setDeviceName(e.currentTarget.value)}
              placeholder="e.g., My iPad, Personal Laptop"
              disabled={isEnrolling}
            />
            <Button type="submit" disabled={isEnrolling} style={{ width: '100%' }}>
              {isEnrolling ? 'Enrolling...' : 'Add Device'}
            </Button>
          </Form>
        </EnrollmentCard>
      )}

      {/* Security Notice */}
      <InfoBox type="warning" style={{ marginTop: '24px' }}>
        <InfoIcon>⚠️</InfoIcon>
        <InfoText>
          <strong>Security Notice:</strong> Biometric credentials are device-specific.
          If you lose access to this device, you can still unlock Lockt using your master password or recovery phrase.
        </InfoText>
      </InfoBox>
    </Container>
  );
};

export default BiometricSettings;

// Styled Components
const Container = styled.div`
  display: flex;
  flex-direction: column;
  gap: 20px;
`;

const Description = styled.p`
  color: ${(props) => props.theme.colors.textSecondary};
  font-size: 14px;
  line-height: 1.6;
  margin: 0 0 16px 0;
`;

const InfoBox = styled.div<{ type: 'info' | 'success' | 'error' | 'warning' }>`
  display: flex;
  gap: 12px;
  padding: 16px;
  border-radius: 8px;
  background: ${(props) => {
    switch (props.type) {
      case 'success':
        return '#d4edda';
      case 'error':
        return '#f8d7da';
      case 'warning':
        return '#fff3cd';
      default:
        return '#d1ecf1';
    }
  }};
  border: 1px solid
    ${(props) => {
      switch (props.type) {
        case 'success':
          return '#c3e6cb';
        case 'error':
          return '#f5c6cb';
        case 'warning':
          return '#ffeaa7';
        default:
          return '#bee5eb';
      }
    }};
`;

const InfoIcon = styled.div`
  font-size: 20px;
  line-height: 1;
`;

const InfoText = styled.div`
  flex: 1;
  font-size: 14px;
  color: #333;
  line-height: 1.5;

  strong {
    display: block;
    margin-bottom: 4px;
  }

  p {
    margin: 4px 0 0 0;
  }
`;

const EnrollmentCard = styled.div`
  background: ${(props) => props.theme.colors.surface};
  border: 1px solid ${(props) => props.theme.colors.border};
  border-radius: 12px;
  padding: 24px;
`;

const CardTitle = styled.h3`
  color: ${(props) => props.theme.colors.text};
  font-size: 16px;
  margin: 0 0 8px 0;
`;

const CardDescription = styled.p`
  color: ${(props) => props.theme.colors.textSecondary};
  font-size: 14px;
  line-height: 1.5;
  margin: 0 0 20px 0;
`;

const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: 16px;
`;

const CredentialsList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
`;

const ListHeader = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 8px;
`;

const ListTitle = styled.h3`
  color: ${(props) => props.theme.colors.text};
  font-size: 16px;
  margin: 0;
`;

const Badge = styled.span`
  background: ${(props) => props.theme.colors.primary};
  color: white;
  font-size: 12px;
  font-weight: 600;
  padding: 4px 8px;
  border-radius: 12px;
  min-width: 24px;
  text-align: center;
`;

const CredentialCard = styled.div`
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 16px;
  background: ${(props) => props.theme.colors.surface};
  border: 1px solid ${(props) => props.theme.colors.border};
  border-radius: 8px;
  transition: all 0.2s;

  &:hover {
    border-color: ${(props) => props.theme.colors.primary};
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  }
`;

const CredentialIcon = styled.div`
  font-size: 32px;
  line-height: 1;
`;

const CredentialInfo = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

const CredentialName = styled.div`
  font-size: 16px;
  font-weight: 600;
  color: ${(props) => props.theme.colors.text};
`;

const CredentialMeta = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
`;

const MetaItem = styled.div`
  display: flex;
  gap: 8px;
  font-size: 13px;
`;

const MetaLabel = styled.span`
  color: ${(props) => props.theme.colors.textSecondary};
`;

const MetaValue = styled.span`
  color: ${(props) => props.theme.colors.text};
`;

const RemoveButton = styled.button`
  background: transparent;
  border: none;
  cursor: pointer;
  font-size: 24px;
  padding: 8px;
  border-radius: 8px;
  transition: all 0.2s;
  line-height: 1;

  &:hover {
    background: rgba(220, 53, 69, 0.1);
  }

  &:active {
    transform: scale(0.95);
  }
`;
