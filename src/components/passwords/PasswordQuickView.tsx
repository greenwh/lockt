// src/components/passwords/PasswordQuickView.tsx
import React from 'react';
import type { PasswordEntry } from '../../types/data.types';
import { QuickViewRow, QuickViewCell } from './PasswordQuickView.styled';

interface PasswordQuickViewProps {
  entry: PasswordEntry;
  onSelect: (entry: PasswordEntry) => void;
  onDelete?: (entryId: string) => void;
}

const PasswordQuickView: React.FC<PasswordQuickViewProps> = ({ entry, onSelect, onDelete }) => {
  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onDelete) {
      onDelete(entry.id);
    }
  };

  return (
    <QuickViewRow onClick={() => onSelect(entry)}>
      <QuickViewCell>{entry.account}</QuickViewCell>
      <QuickViewCell>{entry.username}</QuickViewCell>
      <QuickViewCell>{entry.password}</QuickViewCell>
      <QuickViewCell>{entry.pin || ''}</QuickViewCell>
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

export default PasswordQuickView;
