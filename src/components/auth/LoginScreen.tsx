// src/components/auth/LoginScreen.tsx

import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import Button from '../common/Button';
import Input from '../common/Input';

const LoginScreen: React.FC = () => {
  const { unlock, error } = useAuth();
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);

  const handleUnlock = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!password.trim()) {
      setLocalError('Password is required');
      return;
    }

    try {
      setIsLoading(true);
      setLocalError(null);
      await unlock(password);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unlock failed';
      setLocalError(message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: '400px', margin: '50px auto', padding: '20px' }}>
      <h1>Unlock Lockt</h1>
      <form onSubmit={handleUnlock}>
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
        <Button type="submit" disabled={isLoading} style={{ width: '100%', marginTop: '20px' }}>
          {isLoading ? 'Unlocking...' : 'Unlock'}
        </Button>
      </form>
      {(localError || error) && (
        <div style={{ color: '#dc3545', marginTop: '10px', textAlign: 'center' }}>
          {localError || error}
        </div>
      )}
    </div>
  );
};

export default LoginScreen;
