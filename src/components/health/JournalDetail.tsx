// src/components/health/JournalDetail.tsx
import React from 'react';
import type { HealthJournalEntry } from '../../types/data.types';
import Button from '../common/Button';

interface JournalDetailProps {
  entry: HealthJournalEntry;
  onClose: () => void;
  onEdit: (entry: HealthJournalEntry) => void;
}

const JournalDetail: React.FC<JournalDetailProps> = ({ entry, onClose, onEdit }) => {
  const entryDate = new Date(entry.date).toLocaleDateString();

  return (
    <div>
      <h3>Journal Entry for {entryDate}</h3>
      <p><strong>Reason for Entry:</strong> {entry.reasonForEntry}</p>
      <p><strong>Pain Level:</strong> {entry.painLevel}/10</p>
      <div style={{ whiteSpace: 'pre-wrap', background: '#f4f4f4', padding: '15px', borderRadius: '5px', margin: '15px 0' }}>
        <strong>Entry:</strong>
        <p>{entry.entry}</p>
      </div>
      <Button onClick={() => onEdit(entry)}>Edit</Button>
      <Button onClick={onClose}>Close</Button>
    </div>
  );
};

export default JournalDetail;
