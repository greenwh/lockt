// src/components/crypto/CryptoDetail.tsx
import React from 'react';
import type { CryptoEntry } from '../../types/data.types';
import Button from '../common/Button';

interface CryptoDetailProps {
  entry: CryptoEntry;
  onClose: () => void;
  onEdit: (entry: CryptoEntry) => void;
}

const CryptoDetail: React.FC<CryptoDetailProps> = ({ entry, onClose, onEdit }) => {
  return (
    <div>
      <h2>{entry.account}</h2>
      <p><strong>Username:</strong> {entry.username}</p>
      <p><strong>Password:</strong> {entry.password}</p>
      <p><strong>PIN:</strong> {entry.pin}</p>
      <p><strong>Account Number:</strong> {entry.accountNumber}</p>
      <p><strong>Routing Number:</strong> {entry.routingNumber}</p>
      <p><strong>Recovery Phrase:</strong> {entry.recoveryPhrase}</p>
      <p><strong>Email:</strong> {entry.email}</p>
      <p><strong>Phone:</strong> {entry.phone}</p>
      <p><strong>Fax:</strong> {entry.fax}</p>
      <p><strong>ETH Wallet Address:</strong> {entry.walletAddressEth}</p>
      <p><strong>BTC Wallet Address:</strong> {entry.walletAddressBtc}</p>
      <p><strong>SOL Wallet Address:</strong> {entry.walletAddressSol}</p>
      <p><strong>Other Wallet Address:</strong> {entry.walletAddressOther}</p>
      <Button onClick={() => onEdit(entry)}>Edit</Button>
      <Button onClick={onClose}>Close</Button>
    </div>
  );
};

export default CryptoDetail;
