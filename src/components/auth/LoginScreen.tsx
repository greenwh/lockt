// src/components/auth/LoginScreen.tsx

import React, { useState } from 'react';
import styled from 'styled-components';
import { useAuth } from '../../context/AuthContext';
import Button from '../common/Button';
import Input from '../common/Input';

const LoginScreen: React.FC = () => {
  const { unlock, error } = useAuth();
  const [password, setPassword] = useState('');
  const [recoveryPhrase, setRecoveryPhrase] = useState('');
  const [useRecovery, setUseRecovery] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);

  const handleUnlock = async (e: React.FormEvent) => {
    e.preventDefault();

    if (useRecovery) {
      // Recovery mode: recovery phrase is required, password is optional
      const words = recoveryPhrase.trim().toLowerCase().split(/\s+/);
      if (words.length !== 12) {
        setLocalError('Recovery phrase must be exactly 12 words');
        return;
      }
      // Password is optional in recovery mode - recovery phrase will decrypt it
    } else {
      // Normal mode: password is required
      if (!password.trim()) {
        setLocalError('Password is required');
        return;
      }
    }

    try {
      setIsLoading(true);
      setLocalError(null);

      if (useRecovery) {
        // Recovery mode: Pass empty password and recovery phrase
        await unlock('', recoveryPhrase.trim().toLowerCase());
      } else {
        // Normal mode: Pass password only
        await unlock(password, undefined);
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unlock failed';
      setLocalError(message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Container>
      <Title>Unlock Lockt</Title>
      <Form onSubmit={handleUnlock}>
        {!useRecovery && (
          <Input
            label="Master Password"
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.currentTarget.value)}
            error={localError || error || undefined}
            placeholder="Enter your master password"
            disabled={isLoading}
          />
        )}

        <ToggleContainer>
          <ToggleButton type="button" onClick={() => setUseRecovery(!useRecovery)}>
            {useRecovery ? '🔑 Use password instead' : '🔐 Forgot password? Use recovery phrase'}
          </ToggleButton>
        </ToggleContainer>

        {useRecovery && (
          <RecoveryPhraseContainer>
            <Label>Recovery Phrase (12 words)</Label>
            <RecoveryTextarea
              value={recoveryPhrase}
              onChange={(e) => setRecoveryPhrase(e.target.value)}
              placeholder="Enter your 12-word recovery phrase (space-separated)"
              disabled={isLoading}
              rows={3}
              autoFocus
            />
            <HelpText>
              ✅ <strong>Enter only your recovery phrase</strong> - you don't need your password! The recovery phrase will decrypt your password automatically.
            </HelpText>
          </RecoveryPhraseContainer>
        )}

        <Button type="submit" disabled={isLoading} style={{ width: '100%', marginTop: '20px' }}>
          {isLoading ? 'Unlocking...' : useRecovery ? 'Recover & Unlock' : 'Unlock'}
        </Button>
      </Form>
      {(localError || error) && (
        <ErrorMessage>
          {localError || error}
        </ErrorMessage>
      )}
    </Container>
  );
};

export default LoginScreen;

// Styled Components
const Container = styled.div`
  max-width: 400px;
  margin: 50px auto;
  padding: 20px;
`;

const Title = styled.h1`
  color: ${(props) => props.theme.colors.text};
  margin-bottom: 24px;
`;

const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: 16px;
`;

const ToggleContainer = styled.div`
  display: flex;
  justify-content: center;
  margin: 8px 0;
`;

const ToggleButton = styled.button`
  background: transparent;
  border: 1px solid ${(props) => props.theme.colors.border};
  color: ${(props) => props.theme.colors.primary};
  padding: 8px 16px;
  border-radius: 8px;
  cursor: pointer;
  font-size: 14px;
  transition: all 0.2s;

  &:hover {
    background: ${(props) => props.theme.colors.surface};
    border-color: ${(props) => props.theme.colors.primary};
  }
`;

const RecoveryPhraseContainer = styled.div`
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
`;

const ErrorMessage = styled.div`
  color: #dc3545;
  margin-top: 10px;
  text-align: center;
  font-size: 14px;
`;
