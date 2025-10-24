// src/components/credit-cards/CreditCardQuickView.tsx
import React from 'react';
import type { CreditCardEntry } from '../../types/data.types';
import { QuickViewRow, QuickViewCell } from './CreditCardQuickView.styled';

interface CreditCardQuickViewProps {
  entry: CreditCardEntry;
  onSelect: (entry: CreditCardEntry) => void;
  onDelete?: (entryId: string) => void;
}

const CreditCardQuickView: React.FC<CreditCardQuickViewProps> = ({ entry, onSelect, onDelete }) => {
  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onDelete) {
      onDelete(entry.id);
    }
  };

  // Show last 4 digits of card number
  const cardNumberDisplay = `•••• ${entry.cardNumber.slice(-4)}`;

  return (
    <QuickViewRow onClick={() => onSelect(entry)}>
      <QuickViewCell>{entry.accountName}</QuickViewCell>
      <QuickViewCell>{cardNumberDisplay}</QuickViewCell>
      <QuickViewCell>{entry.expirationDate}</QuickViewCell>
      <QuickViewCell>{'•'.repeat(3)}</QuickViewCell>
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

export default CreditCardQuickView;
