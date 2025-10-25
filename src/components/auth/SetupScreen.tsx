// src/components/auth/SetupScreen.tsx

import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { cryptoService } from '../../services/crypto.service';
import Button from '../common/Button';
import Input from '../common/Input';
import type { RecoveryPhrase } from '../../types/data.types';

const SetupScreen: React.FC = () => {
  const { createAccount } = useAuth();
  const [recoveryPhrase, setRecoveryPhrase] = useState<RecoveryPhrase | null>(null);
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [step, setStep] = useState<'intro' | 'password' | 'confirm'>('intro');

  useEffect(() => {
    generatePhrase();
  }, []);

  const generatePhrase = async () => {
    const phrase = await cryptoService.generateRecoveryPhrase();
    setRecoveryPhrase(phrase);
  };

  const handleContinue = () => {
    if (!recoveryPhrase) {
      setError('Recovery phrase not generated');
      return;
    }
    setStep('password');
  };

  const handleCreateAccount = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!password.trim()) {
      setError('Password is required');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (password.length < 8) {
      setError('Password must be at least 8 characters');
      return;
    }

    try {
      setIsLoading(true);
      const phraseString = recoveryPhrase?.words.join(' ') || '';
      await createAccount(password, phraseString);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Account creation failed';
      setError(message);
    } finally {
      setIsLoading(false);
    }
  };

  if (step === 'intro') {
    return (
      <div style={{ maxWidth: '500px', margin: '50px auto', padding: '20px' }}>
        <h1>Set Up Lockt</h1>
        <p>
          Your data will be encrypted with a master password. Write down this recovery phrase and store it in a safe place. You can use it to access your data if you forget your password.
        </p>
        <div
          style={{
            background: '#f8f9fa',
            padding: '20px',
            borderRadius: '8px',
            marginBottom: '20px',
            border: '2px solid #dee2e6'
          }}
        >
          <h3>Recovery Phrase</h3>
          {recoveryPhrase && (
            <ol style={{ columns: 2, columnGap: '30px' }}>
              {recoveryPhrase.words.map((word, index) => (
                <li key={index} style={{ marginBottom: '8px' }}>
                  {word}
                </li>
              ))}
            </ol>
          )}
          <Button onClick={generatePhrase} style={{ marginTop: '20px', width: '100%' }}>
            Generate New Phrase
          </Button>
        </div>
        <p style={{ color: '#dc3545', fontSize: '0.9em' }}>
          ⚠️ Important: Write down these words in order. Do not screenshot or email them.
        </p>
        <Button onClick={handleContinue} style={{ width: '100%' }}>
          I've Saved My Recovery Phrase
        </Button>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: '400px', margin: '50px auto', padding: '20px' }}>
      <h1>Create Master Password</h1>
      <form onSubmit={handleCreateAccount}>
        <Input
          label="Master Password"
          id="password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.currentTarget.value)}
          placeholder="Create a strong password"
          disabled={isLoading}
        />
        <Input
          label="Confirm Password"
          id="confirmPassword"
          type="password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.currentTarget.value)}
          placeholder="Confirm your password"
          disabled={isLoading}
          error={
            confirmPassword && password !== confirmPassword ? 'Passwords do not match' : undefined
          }
        />
        {error && <div style={{ color: '#dc3545', marginBottom: '10px' }}>{error}</div>}
        <Button type="submit" disabled={isLoading} style={{ width: '100%', marginTop: '20px' }}>
          {isLoading ? 'Creating Account...' : 'Create Account'}
        </Button>
      </form>
    </div>
  );
};

export default SetupScreen;

