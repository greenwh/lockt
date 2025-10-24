// src/components/health/JournalDetail.tsx
import React from 'react';
import type { HealthJournalEntry } from '../../types/data.types';
import Button from '../common/Button';

interface JournalDetailProps {
  entry: HealthJournalEntry;
  onClose: () => void;
  onEdit: (entry: HealthJournalEntry) => void;
  onDelete?: (entryId: string) => void;
}

const JournalDetail: React.FC<JournalDetailProps> = ({ entry, onClose, onEdit, onDelete }) => {
  const entryDate = new Date(entry.date).toLocaleDateString();

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    alert(`${label} copied to clipboard!`);
  };

  return (
    <div>
      <h3>Journal Entry for {entryDate}</h3>
      <p><strong>Reason for Entry:</strong> {entry.reasonForEntry}</p>
      <p><strong>Pain Level:</strong> {entry.painLevel}/10</p>
      <div style={{ whiteSpace: 'pre-wrap', background: '#f4f4f4', padding: '15px', borderRadius: '5px', margin: '15px 0' }}>
        <strong>Entry:</strong>
        <p>{entry.entry}</p>
        <button onClick={() => copyToClipboard(entry.entry, 'Journal Entry')} style={{ marginTop: '8px' }}>
          📋 Copy
        </button>
      </div>
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

export default JournalDetail;
