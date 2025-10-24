// src/components/health/JournalQuickView.tsx
import React from 'react';
import type { HealthJournalEntry } from '../../types/data.types';
import { QuickViewRow, QuickViewCell } from './JournalQuickView.styled';

interface JournalQuickViewProps {
  entry: HealthJournalEntry;
  onSelect: (entry: HealthJournalEntry) => void;
  onDelete?: (entryId: string) => void;
}

const JournalQuickView: React.FC<JournalQuickViewProps> = ({ entry, onSelect, onDelete }) => {
  const entryDate = new Date(entry.date).toLocaleDateString();

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onDelete) {
      onDelete(entry.id);
    }
  };

  return (
    <QuickViewRow onClick={() => onSelect(entry)}>
      <QuickViewCell>{entryDate}</QuickViewCell>
      <QuickViewCell>{entry.reasonForEntry}</QuickViewCell>
      <QuickViewCell>Pain: {entry.painLevel}/10</QuickViewCell>
      {onDelete && (
        <QuickViewCell>
          <button
            onClick={handleDelete}
            style={{
              background: 'none',
              border: 'none',
              color: '#dc3545',
              cursor: 'pointer',
              fontSize: '1.2em',
            }}
            aria-label="Delete entry"
          >
            🗑️
          </button>
        </QuickViewCell>
      )}
    </QuickViewRow>
  );
};

export default JournalQuickView;
