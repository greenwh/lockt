// src/components/passwords/PasswordDetail.tsx
import React, { useState } from 'react';
import type { PasswordEntry } from '../../types/data.types';
import Button from '../common/Button';

interface PasswordDetailProps {
  entry: PasswordEntry;
  onClose: () => void;
  onEdit: (entry: PasswordEntry) => void;
  onDelete?: (entryId: string) => void;
}

const PasswordDetail: React.FC<PasswordDetailProps> = ({ entry, onClose, onEdit, onDelete }) => {
  const [showPassword, setShowPassword] = useState(false);
  const [showPin, setShowPin] = useState(false);

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    alert(`${label} copied to clipboard!`);
  };

  return (
    <div>
      <h2>{entry.account}</h2>
      <p><strong>Username:</strong> {entry.username}</p>
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
      <p>
        <strong>PIN:</strong>{' '}
        {entry.pin ? (
          <>
            {showPin ? entry.pin : '•'.repeat(4)}{' '}
            <button onClick={() => setShowPin(!showPin)} style={{ marginLeft: '8px' }}>
              {showPin ? '👁️' : '👁️‍🗨️'}
            </button>
            <button onClick={() => copyToClipboard(entry.pin, 'PIN')} style={{ marginLeft: '4px' }}>
              📋
            </button>
          </>
        ) : (
          'Not set'
        )}
      </p>
      {entry.accountNumber && <p><strong>Account Number:</strong> {entry.accountNumber}</p>}
      {entry.routingNumber && <p><strong>Routing Number:</strong> {entry.routingNumber}</p>}
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

export default PasswordDetail;
