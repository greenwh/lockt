// src/components/health/ProviderDetail.tsx
import React from 'react';
import type { HealthProvider } from '../../types/data.types';
import Button from '../common/Button';

interface ProviderDetailProps {
  entry: HealthProvider;
  onClose: () => void;
  onEdit: (entry: HealthProvider) => void;
  onDelete?: (entryId: string) => void;
}

const ProviderDetail: React.FC<ProviderDetailProps> = ({ entry, onClose, onEdit, onDelete }) => {
  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    alert(`${label} copied to clipboard!`);
  };

  return (
    <div>
      <h3>{entry.drName}</h3>
      <p><strong>Specialty:</strong> {entry.specialty}</p>
      <p>
        <strong>Email:</strong> {entry.email}{' '}
        {entry.email && (
          <button onClick={() => copyToClipboard(entry.email || '', 'Email')} style={{ marginLeft: '4px' }}>
            📋
          </button>
        )}
      </p>
      <p>
        <strong>Phone:</strong> {entry.phone}{' '}
        {entry.phone && (
          <button onClick={() => copyToClipboard(entry.phone || '', 'Phone')} style={{ marginLeft: '4px' }}>
            📋
          </button>
        )}
      </p>
      {entry.fax && (
        <p>
          <strong>Fax:</strong> {entry.fax}{' '}
          <button onClick={() => copyToClipboard(entry.fax || '', 'Fax')} style={{ marginLeft: '4px' }}>
            📋
          </button>
        </p>
      )}
      {entry.account && <p><strong>Account:</strong> {entry.account}</p>}
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

export default ProviderDetail;
