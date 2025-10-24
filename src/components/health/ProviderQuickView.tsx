// src/components/health/ProviderQuickView.tsx
import React from 'react';
import type { HealthProvider } from '../../types/data.types';
import { QuickViewRow, QuickViewCell } from './ProviderQuickView.styled';

interface ProviderQuickViewProps {
  entry: HealthProvider;
  onSelect: (entry: HealthProvider) => void;
  onDelete?: (entryId: string) => void;
}

const ProviderQuickView: React.FC<ProviderQuickViewProps> = ({ entry, onSelect, onDelete }) => {
  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onDelete) {
      onDelete(entry.id);
    }
  };

  return (
    <QuickViewRow onClick={() => onSelect(entry)}>
      <QuickViewCell>{entry.drName}</QuickViewCell>
      <QuickViewCell>{entry.specialty}</QuickViewCell>
      <QuickViewCell>{entry.phone}</QuickViewCell>
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

export default ProviderQuickView;
