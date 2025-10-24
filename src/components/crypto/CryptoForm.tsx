// src/components/crypto/CryptoForm.tsx
import React, { useState } from 'react';
import type { CryptoEntry } from '../../types/data.types';
import Button from '../common/Button';
import Input from '../common/Input';

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
            recoveryPhrase: '',
            walletAddressBtc: '',
            walletAddressEth: '',
            walletAddressSol: '',
            walletAddressOther: '',
        }
    );

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setEntry(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const now = Date.now();
        const id = existingEntry?.id || '';
        onSave({ ...entry, id, createdAt: existingEntry?.createdAt || now, updatedAt: now });
    };

    return (
        <form onSubmit={handleSubmit}>
            <h3>{existingEntry ? 'Edit' : 'Add'} Crypto Account</h3>
            <Input id="account" name="account" label="Account Name" value={entry.account} onChange={handleChange} required />
            <Input id="username" name="username" label="Username" value={entry.username} onChange={handleChange} required />
            <Input id="password" name="password" label="Password" type="password" value={entry.password} onChange={handleChange} required />
            <Input id="pin" name="pin" label="PIN" value={entry.pin} onChange={handleChange} />
            <Input id="recoveryPhrase" name="recoveryPhrase" label="Recovery Phrase" value={entry.recoveryPhrase || ''} onChange={handleChange} />
            <Input id="walletAddressBtc" name="walletAddressBtc" label="BTC Wallet Address" value={entry.walletAddressBtc || ''} onChange={handleChange} />
            <Input id="walletAddressEth" name="walletAddressEth" label="ETH Wallet Address" value={entry.walletAddressEth || ''} onChange={handleChange} />
            <Input id="walletAddressSol" name="walletAddressSol" label="SOL Wallet Address" value={entry.walletAddressSol || ''} onChange={handleChange} />
            <Input id="walletAddressOther" name="walletAddressOther" label="Other Wallet Address" value={entry.walletAddressOther || ''} onChange={handleChange} />
            <Button type="submit">Save</Button>
            <Button type="button" onClick={onCancel} style={{ marginLeft: '10px' }}>Cancel</Button>
        </form>
    );
};

export default CryptoForm;