// src/components/credit-cards/CreditCardQuickView.tsx
import React from 'react';
import type { CreditCardEntry } from '../../types/data.types';
import { QuickViewRow, QuickViewCell } from './CreditCardQuickView.styled';

interface CreditCardQuickViewProps {
  entry: CreditCardEntry;
  onSelect: (entry: CreditCardEntry) => void;
}

const CreditCardQuickView: React.FC<CreditCardQuickViewProps> = ({ entry, onSelect }) => {
  return (
    <QuickViewRow onClick={() => onSelect(entry)}>
      <QuickViewCell>{entry.accountName}</QuickViewCell>
      <QuickViewCell>{entry.cardNumber}</QuickViewCell>
      <QuickViewCell>{entry.expirationDate}</QuickViewCell>
      <QuickViewCell>{entry.cscCode}</QuickViewCell>
    </QuickViewRow>
  );
};

export default CreditCardQuickView;
