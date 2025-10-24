// src/components/auth/SetupScreen.tsx

import React, { useState, useEffect } from 'react';
import { cryptoService } from '../../services/crypto.service';
import type { RecoveryPhrase } from '../../types/data.types';

const SetupScreen: React.FC = () => {
  const [recoveryPhrase, setRecoveryPhrase] = useState<RecoveryPhrase | null>(null);

  useEffect(() => {
    generatePhrase();
  }, []);

  const generatePhrase = async () => {
    const phrase = await cryptoService.generateRecoveryPhrase();
    setRecoveryPhrase(phrase);
  };

  return (
    <div>
      <h1>Setup Recovery Phrase</h1>
      <p>Please write down this recovery phrase and store it in a safe place.</p>
      {recoveryPhrase && (
        <ol>
          {recoveryPhrase.words.map((word, index) => (
            <li key={index}>{word}</li>
          ))}
        </ol>
      )}
      <button onClick={generatePhrase}>Generate New Phrase</button>
      <button>Confirm</button>
    </div>
  );
};

export default SetupScreen;

