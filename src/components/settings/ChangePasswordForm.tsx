// src/components/settings/ChangePasswordForm.tsx

import React, { useState } from 'react';
import styled from 'styled-components';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../hooks/useToast';
import Button from '../common/Button';
import Input from '../common/Input';

const ChangePasswordForm: React.FC = () => {
  const { changePassword, unlockedViaRecovery } = useAuth();
  const toast = useToast();

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [recoveryPhrase, setRecoveryPhrase] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLocalError(null);

    // Validation
    if (!unlockedViaRecovery && !currentPassword.trim()) {
      setLocalError('Current password is required');
      return;
    }

    if (!newPassword.trim()) {
      setLocalError('New password is required');
      return;
    }

    if (newPassword.length < 8) {
      setLocalError('New password must be at least 8 characters');
      return;
    }

    if (newPassword !== confirmPassword) {
      setLocalError('New passwords do not match');
      return;
    }

    const words = recoveryPhrase.trim().toLowerCase().split(/\s+/);
    if (words.length !== 12) {
      setLocalError('Recovery phrase must be exactly 12 words');
      return;
    }

    try {
      setIsLoading(true);
      await changePassword(
        unlockedViaRecovery ? null : currentPassword,
        newPassword,
        recoveryPhrase.trim().toLowerCase()
      );

      toast.success('Password changed successfully!');

      // Clear form
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setRecoveryPhrase('');
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Password change failed';
      setLocalError(message);
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Container>
      <Title>Change Password</Title>

      {unlockedViaRecovery && (
        <InfoBox>
          <InfoIcon>ℹ️</InfoIcon>
          <InfoText>
            You unlocked with your recovery phrase, so current password verification is skipped.
          </InfoText>
        </InfoBox>
      )}

      <Form onSubmit={handleSubmit}>
        {!unlockedViaRecovery && (
          <Input
            label="Current Password"
            id="current-password"
            type="password"
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.currentTarget.value)}
            placeholder="Enter your current password"
            disabled={isLoading}
          />
        )}

        <Input
          label="New Password"
          id="new-password"
          type="password"
          value={newPassword}
          onChange={(e) => setNewPassword(e.currentTarget.value)}
          placeholder="Enter your new password (min 8 characters)"
          disabled={isLoading}
        />

        <Input
          label="Confirm New Password"
          id="confirm-password"
          type="password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.currentTarget.value)}
          placeholder="Re-enter your new password"
          disabled={isLoading}
        />

        <RecoverySection>
          <Label>Recovery Phrase (12 words) *</Label>
          <RecoveryTextarea
            value={recoveryPhrase}
            onChange={(e) => setRecoveryPhrase(e.target.value)}
            placeholder="Enter your 12-word recovery phrase"
            disabled={isLoading}
            rows={3}
          />
          <HelpText>
            ⚠️ <strong>Required:</strong> Your recovery phrase is needed to encrypt your new password for future recovery. This verifies you still have access to your recovery phrase.
          </HelpText>
        </RecoverySection>

        {localError && <ErrorMessage>{localError}</ErrorMessage>}

        <Button type="submit" disabled={isLoading} style={{ width: '100%', marginTop: '20px' }}>
          {isLoading ? 'Changing Password...' : 'Change Password'}
        </Button>
      </Form>

      <SecurityNote>
        <strong>Security Note:</strong> Changing your password will re-encrypt all your data with the new password. Your recovery phrase remains the same and can still be used to recover your new password if you forget it.
      </SecurityNote>
    </Container>
  );
};

export default ChangePasswordForm;

// Styled Components
const Container = styled.div`
  max-width: 500px;
  margin: 0 auto;
  padding: 20px;
`;

const Title = styled.h2`
  color: ${(props) => props.theme.colors.text};
  margin-bottom: 24px;
`;

const InfoBox = styled.div`
  display: flex;
  gap: 12px;
  padding: 12px 16px;
  margin-bottom: 20px;
  background: ${(props) => props.theme.colors.surface};
  border: 1px solid ${(props) => props.theme.colors.border};
  border-radius: 8px;
`;

const InfoIcon = styled.div`
  font-size: 20px;
  flex-shrink: 0;
`;

const InfoText = styled.p`
  margin: 0;
  font-size: 14px;
  color: ${(props) => props.theme.colors.textSecondary};
  line-height: 1.5;
`;

const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: 16px;
`;

const RecoverySection = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding: 16px;
  background: ${(props) => props.theme.colors.surface};
  border: 1px solid ${(props) => props.theme.colors.border};
  border-radius: 12px;
`;

const Label = styled.label`
  font-size: 14px;
  font-weight: 600;
  color: ${(props) => props.theme.colors.text};
`;

const RecoveryTextarea = styled.textarea`
  width: 100%;
  padding: 12px;
  border: 1px solid ${(props) => props.theme.colors.border};
  border-radius: 8px;
  background: ${(props) => props.theme.colors.background};
  color: ${(props) => props.theme.colors.text};
  font-size: 14px;
  font-family: 'Courier New', monospace;
  resize: vertical;
  min-height: 80px;

  &:focus {
    outline: none;
    border-color: ${(props) => props.theme.colors.primary};
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
`;

const HelpText = styled.p`
  font-size: 12px;
  color: ${(props) => props.theme.colors.textSecondary};
  margin: 0;
  line-height: 1.5;

  strong {
    color: ${(props) => props.theme.colors.warning};
  }
`;

const ErrorMessage = styled.div`
  color: #dc3545;
  font-size: 14px;
  padding: 12px;
  background: #dc354510;
  border: 1px solid #dc354530;
  border-radius: 8px;
`;

const SecurityNote = styled.div`
  margin-top: 24px;
  padding: 16px;
  background: ${(props) => props.theme.colors.surface};
  border: 1px solid ${(props) => props.theme.colors.border};
  border-radius: 8px;
  font-size: 13px;
  color: ${(props) => props.theme.colors.textSecondary};
  line-height: 1.6;

  strong {
    color: ${(props) => props.theme.colors.text};
  }
`;
