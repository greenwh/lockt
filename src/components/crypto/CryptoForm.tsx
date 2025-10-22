// src/components/crypto/CryptoForm.tsx
import React, { useState } from 'react';
import type { CryptoEntry } from '../../types/data.types';
import Button from '../common/Button';
import Input from '../common/Input';
import { v4 as uuidv4 } from 'uuid';

interface CryptoFormProps {
  onSave: (entry: CryptoEntry) => void;
  onCancel: () => void;
  existingEntry?: CryptoEntry;
}

const CryptoForm: React.FC<CryptoFormProps> = ({ onSave, onCancel, existingEntry }) => {
  const [entry, setEntry] = useState<Omit<CryptoEntry, 'id' | 'createdAt' | 'updatedAt'>>(
    existingEntry || {
      account: '',
      username: '',
      password: '',
      pin: '',
      accountNumber: '',
      routingNumber: '',
      recoveryPhrase: '',
      email: '',
      phone: '',
      fax: '',
      walletAddressEth: '',
      walletAddressBtc: '',
      walletAddressSol: '',
      walletAddressOther: '',
    }
  );

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setEntry((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const now = Date.now();
    const finalEntry: CryptoEntry = {
      id: existingEntry?.id || uuidv4(),
      ...entry,
      createdAt: existingEntry?.createdAt || now,
      updatedAt: now,
    };
    onSave(finalEntry);
  };

  return (
    <form onSubmit={handleSubmit}>
      <Input label="Account" id="account" name="account" value={entry.account} onChange={handleChange} required />
      <Input label="Username" id="username" name="username" value={entry.username} onChange={handleChange} />
      <Input label="Password" id="password" name="password" type="text" value={entry.password} onChange={handleChange} />
      <Input label="PIN" id="pin" name="pin" type="text" value={entry.pin} onChange={handleChange} />
      <Input label="Account Number" id="accountNumber" name="accountNumber" value={entry.accountNumber} onChange={handleChange} />
      <Input label="Routing Number" id="routingNumber" name="routingNumber" value={entry.routingNumber} onChange={handleChange} />
      <Input label="Recovery Phrase" id="recoveryPhrase" name="recoveryPhrase" value={entry.recoveryPhrase} onChange={handleChange} />
      <Input label="Email" id="email" name="email" type="email" value={entry.email} onChange={handleChange} />
      <Input label="Phone" id="phone" name="phone" type="tel" value={entry.phone} onChange={handleChange} />
      <Input label="Fax" id="fax" name="fax" type="tel" value={entry.fax} onChange={handleChange} />
      <Input label="ETH Wallet Address" id="walletAddressEth" name="walletAddressEth" value={entry.walletAddressEth} onChange={handleChange} />
      <Input label="BTC Wallet Address" id="walletAddressBtc" name="walletAddressBtc" value={entry.walletAddressBtc} onChange={handleChange} />
      <Input label="SOL Wallet Address" id="walletAddressSol" name="walletAddressSol" value={entry.walletAddressSol} onChange={handleChange} />
      <Input label="Other Wallet Address" id="walletAddressOther" name="walletAddressOther" value={entry.walletAddressOther} onChange={handleChange} />
      <Button type="submit">Save</Button>
      <Button type="button" onClick={onCancel}>Cancel</Button>
    </form>
  );
};

export default CryptoForm;
