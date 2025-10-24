// src/components/credit-cards/CreditCardDetail.tsx
import React, { useState } from 'react';
import type { CreditCardEntry } from '../../types/data.types';
import Button from '../common/Button';

interface CreditCardDetailProps {
  entry: CreditCardEntry;
  onClose: () => void;
  onEdit: (entry: CreditCardEntry) => void;
  onDelete?: (entryId: string) => void;
}

const CreditCardDetail: React.FC<CreditCardDetailProps> = ({ entry, onClose, onEdit, onDelete }) => {
  const [showCardNumber, setShowCardNumber] = useState(false);
  const [showCscCode, setShowCscCode] = useState(false);

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    alert(`${label} copied to clipboard!`);
  };

  return (
    <div>
      <h2>{entry.accountName}</h2>
      <p>
        <strong>Card Number:</strong>{' '}
        {showCardNumber ? entry.cardNumber : '•'.repeat(16)}{' '}
        <button onClick={() => setShowCardNumber(!showCardNumber)} style={{ marginLeft: '8px' }}>
          {showCardNumber ? '👁️' : '👁️‍🗨️'}
        </button>
        <button onClick={() => copyToClipboard(entry.cardNumber, 'Card Number')} style={{ marginLeft: '4px' }}>
          📋
        </button>
      </p>
      <p><strong>Expiration Date:</strong> {entry.expirationDate}</p>
      <p>
        <strong>CSC Code:</strong>{' '}
        {showCscCode ? entry.cscCode : '•'.repeat(3)}{' '}
        <button onClick={() => setShowCscCode(!showCscCode)} style={{ marginLeft: '8px' }}>
          {showCscCode ? '👁️' : '👁️‍🗨️'}
        </button>
        <button onClick={() => copyToClipboard(entry.cscCode, 'CSC Code')} style={{ marginLeft: '4px' }}>
          📋
        </button>
      </p>
      {entry.email && <p><strong>Email:</strong> {entry.email}</p>}
      {entry.phone && <p><strong>Phone:</strong> {entry.phone}</p>}
      {entry.fax && <p><strong>Fax:</strong> {entry.fax}</p>}
      {entry.mailingAddress && <p><strong>Mailing Address:</strong> {entry.mailingAddress}</p>}
      {entry.url && <p><strong>URL:</strong> <a href={entry.url} target="_blank" rel="noopener noreferrer">{entry.url}</a></p>}
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

export default CreditCardDetail;
