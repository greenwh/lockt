// src/components/health/ImpairmentQuickView.tsx
import React from 'react';
import type { HealthImpairment } from '../../types/data.types';
import { QuickViewRow, QuickViewCell } from './ImpairmentQuickView.styled';

interface ImpairmentQuickViewProps {
  entry: HealthImpairment;
  onSelect: (entry: HealthImpairment) => void;
  onDelete?: (entryId: string) => void;
}

const ImpairmentQuickView: React.FC<ImpairmentQuickViewProps> = ({ entry, onSelect, onDelete }) => {
  const onsetDate = entry.dateOfOnset
    ? new Date(entry.dateOfOnset).toLocaleDateString()
    : 'N/A';

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onDelete) {
      onDelete(entry.id);
    }
  };

  return (
    <QuickViewRow onClick={() => onSelect(entry)}>
      <QuickViewCell>{entry.description}</QuickViewCell>
      <QuickViewCell>{onsetDate}</QuickViewCell>
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

export default ImpairmentQuickView;
