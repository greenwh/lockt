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
            <h3>{entry.account}</h3>
            <p><strong>Username:</strong> {entry.username}</p>
            <p><strong>Password:</strong> ********</p>
            {entry.pin && <p><strong>PIN:</strong> {entry.pin}</p>}
            {entry.recoveryPhrase && <p><strong>Recovery Phrase:</strong> {entry.recoveryPhrase}</p>}
            {entry.walletAddressBtc && <p><strong>BTC Address:</strong> {entry.walletAddressBtc}</p>}
            {entry.walletAddressEth && <p><strong>ETH Address:</strong> {entry.walletAddressEth}</p>}
            {entry.walletAddressSol && <p><strong>SOL Address:</strong> {entry.walletAddressSol}</p>}
            {entry.walletAddressOther && <p><strong>Other Address:</strong> {entry.walletAddressOther}</p>}
            <Button onClick={() => onEdit(entry)}>Edit</Button>
            <Button onClick={onClose} style={{ marginLeft: '10px' }}>Close</Button>
        </div>
    );
};

export default CryptoDetail;