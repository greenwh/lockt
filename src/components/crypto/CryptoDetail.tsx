// src/components/crypto/CryptoDetail.tsx
import React, { useState } from 'react';
import type { CryptoEntry } from '../../types/data.types';
import Button from '../common/Button';

interface CryptoDetailProps {
  entry: CryptoEntry;
  onClose: () => void;
  onEdit: (entry: CryptoEntry) => void;
  onDelete?: (entryId: string) => void;
}

const CryptoDetail: React.FC<CryptoDetailProps> = ({ entry, onClose, onEdit, onDelete }) => {
  const [showPassword, setShowPassword] = useState(false);
  const [showPin, setShowPin] = useState(false);
  const [showRecoveryPhrase, setShowRecoveryPhrase] = useState(false);
  const [showWalletAddresses, setShowWalletAddresses] = useState(false);

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    alert(`${label} copied to clipboard!`);
  };

  return (
    <div>
      <h2>{entry.account}</h2>
      {entry.username && <p><strong>Username:</strong> {entry.username}</p>}
      {entry.password && (
        <p>
          <strong>Password:</strong>{' '}
          {showPassword ? entry.password : '•'.repeat(12)}{' '}
          <button onClick={() => setShowPassword(!showPassword)} style={{ marginLeft: '8px' }}>
            {showPassword ? '👁️' : '👁️‍🗨️'}
          </button>
          <button onClick={() => copyToClipboard(entry.password, 'Password')} style={{ marginLeft: '4px' }}>
            📋
          </button>
        </p>
      )}
      {entry.pin && (
        <p>
          <strong>PIN:</strong>{' '}
          {showPin ? entry.pin : '•'.repeat(4)}{' '}
          <button onClick={() => setShowPin(!showPin)} style={{ marginLeft: '8px' }}>
            {showPin ? '👁️' : '👁️‍🗨️'}
          </button>
          <button onClick={() => copyToClipboard(entry.pin, 'PIN')} style={{ marginLeft: '4px' }}>
            📋
          </button>
        </p>
      )}
      {entry.accountNumber && <p><strong>Account Number:</strong> {entry.accountNumber}</p>}
      {entry.routingNumber && <p><strong>Routing Number:</strong> {entry.routingNumber}</p>}
      {entry.recoveryPhrase && (
        <p>
          <strong>Recovery Phrase:</strong>{' '}
          {showRecoveryPhrase ? entry.recoveryPhrase : '•'.repeat(24)}{' '}
          <button onClick={() => setShowRecoveryPhrase(!showRecoveryPhrase)} style={{ marginLeft: '8px' }}>
            {showRecoveryPhrase ? '👁️' : '👁️‍🗨️'}
          </button>
          <button onClick={() => copyToClipboard(entry.recoveryPhrase || '', 'Recovery Phrase')} style={{ marginLeft: '4px' }}>
            📋
          </button>
        </p>
      )}
      {entry.email && <p><strong>Email:</strong> {entry.email}</p>}
      {entry.phone && <p><strong>Phone:</strong> {entry.phone}</p>}
      {entry.fax && <p><strong>Fax:</strong> {entry.fax}</p>}
      {entry.walletAddressEth && (
        <p>
          <strong>ETH Wallet Address:</strong>{' '}
          {showWalletAddresses ? entry.walletAddressEth : '•'.repeat(20)}{' '}
          <button onClick={() => copyToClipboard(entry.walletAddressEth || '', 'ETH Wallet Address')} style={{ marginLeft: '4px' }}>
            📋
          </button>
        </p>
      )}
      {entry.walletAddressBtc && (
        <p>
          <strong>BTC Wallet Address:</strong>{' '}
          {showWalletAddresses ? entry.walletAddressBtc : '•'.repeat(20)}{' '}
          <button onClick={() => copyToClipboard(entry.walletAddressBtc || '', 'BTC Wallet Address')} style={{ marginLeft: '4px' }}>
            📋
          </button>
        </p>
      )}
      {entry.walletAddressSol && (
        <p>
          <strong>SOL Wallet Address:</strong>{' '}
          {showWalletAddresses ? entry.walletAddressSol : '•'.repeat(20)}{' '}
          <button onClick={() => copyToClipboard(entry.walletAddressSol || '', 'SOL Wallet Address')} style={{ marginLeft: '4px' }}>
            📋
          </button>
        </p>
      )}
      {entry.walletAddressOther && (
        <p>
          <strong>Other Wallet Address:</strong>{' '}
          {showWalletAddresses ? entry.walletAddressOther : '•'.repeat(20)}{' '}
          <button onClick={() => copyToClipboard(entry.walletAddressOther || '', 'Other Wallet Address')} style={{ marginLeft: '4px' }}>
            📋
          </button>
        </p>
      )}
      {(entry.walletAddressEth || entry.walletAddressBtc || entry.walletAddressSol || entry.walletAddressOther) && (
        <p>
          <button onClick={() => setShowWalletAddresses(!showWalletAddresses)}>
            {showWalletAddresses ? 'Hide' : 'Show'} Wallet Addresses
          </button>
        </p>
      )}
      {entry.notes && <p><strong>Notes:</strong> {entry.notes}</p>}
      {entry.tags && entry.tags.length > 0 && <p><strong>Tags:</strong> {entry.tags.join(', ')}</p>}
      <div style={{ marginTop: '1.5rem', display: 'flex', gap: '1rem' }}>
        <Button onClick={() => onEdit(entry)}>Edit</Button>
        <Button onClick={onClose}>Close</Button>
        {onDelete && (
          <Button onClick={() => onDelete(entry.id)} style={{ background: '#dc3545' }}>
            Delete
          </Button>
        )}
      </div>
    </div>
  );
};

export default CryptoDetail;
