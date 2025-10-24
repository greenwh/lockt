// src/components/credit-cards/CreditCardDetail.tsx
import React from 'react';
import type { CreditCardEntry } from '../../types/data.types';
import Button from '../common/Button';

interface CreditCardDetailProps {
    entry: CreditCardEntry;
    onClose: () => void;
    onEdit: (entry: CreditCardEntry) => void;
}

const CreditCardDetail: React.FC<CreditCardDetailProps> = ({ entry, onClose, onEdit }) => {
    return (
        <div>
            <h3>{entry.accountName}</h3>
            <p><strong>Card Number:</strong> {entry.cardNumber}</p>
            <p><strong>Expiration Date:</strong> {entry.expirationDate}</p>
            <p><strong>CSC:</strong> {entry.cscCode}</p>
            <p><strong>Email:</strong> {entry.email}</p>
            <p><strong>Phone:</strong> {entry.phone}</p>
            <p><strong>URL:</strong> {entry.url}</p>
            <p><strong>Notes:</strong> {entry.notes}</p>
            <Button onClick={() => onEdit(entry)}>Edit</Button>
            <Button onClick={onClose} style={{ marginLeft: '10px' }}>Close</Button>
        </div>
    );
};

export default CreditCardDetail;