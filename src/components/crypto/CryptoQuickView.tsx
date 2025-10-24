// src/components/crypto/CryptoQuickView.tsx
import React from 'react';
import type { CryptoEntry } from '../../types/data.types';
import { QuickViewRow, QuickViewCell } from './CryptoQuickView.styled';

interface CryptoQuickViewProps {
  entry: CryptoEntry;
  onSelect: (entry: CryptoEntry) => void;
  onDelete?: (entryId: string) => void;
}

const CryptoQuickView: React.FC<CryptoQuickViewProps> = ({ entry, onSelect, onDelete }) => {
  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onDelete) {
      onDelete(entry.id);
    }
  };

  return (
    <QuickViewRow onClick={() => onSelect(entry)}>
      <QuickViewCell>{entry.account}</QuickViewCell>
      <QuickViewCell>{entry.username || '-'}</QuickViewCell>
      <QuickViewCell>{'•'.repeat(8)}</QuickViewCell>
      <QuickViewCell>{entry.pin ? '•'.repeat(4) : '-'}</QuickViewCell>
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

export default CryptoQuickView;
