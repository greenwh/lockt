// src/components/freetext/FreetextQuickView.tsx
import React from 'react';
import type { FreetextEntry } from '../../types/data.types';
import { QuickViewRow, QuickViewCell } from './FreetextQuickView.styled';

interface FreetextQuickViewProps {
  entry: FreetextEntry;
  onSelect: (entry: FreetextEntry) => void;
  onDelete?: (entryId: string) => void;
}

const FreetextQuickView: React.FC<FreetextQuickViewProps> = ({ entry, onSelect, onDelete }) => {
  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onDelete) {
      onDelete(entry.id);
    }
  };

  return (
    <QuickViewRow onClick={() => onSelect(entry)}>
      <QuickViewCell><strong>{entry.title}</strong></QuickViewCell>
      <QuickViewCell>{entry.description || '-'}</QuickViewCell>
      <QuickViewCell>{entry.category || '-'}</QuickViewCell>
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

export default FreetextQuickView;
