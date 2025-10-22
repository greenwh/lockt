// src/components/health/ImpairmentQuickView.tsx
import React from 'react';
import type { HealthImpairment } from '../../types/data.types';
import { QuickViewRow, QuickViewCell } from './ImpairmentQuickView.styled';

interface ImpairmentQuickViewProps {
  entry: HealthImpairment;
  onSelect: (entry: HealthImpairment) => void;
}

const ImpairmentQuickView: React.FC<ImpairmentQuickViewProps> = ({ entry, onSelect }) => {
  const onsetDate = entry.dateOfOnset
    ? new Date(entry.dateOfOnset).toLocaleDateString()
    : 'N/A';

  return (
    <QuickViewRow onClick={() => onSelect(entry)}>
      <QuickViewCell>{entry.description}</QuickViewCell>
      <QuickViewCell>{onsetDate}</QuickViewCell>
    </QuickViewRow>
  );
};

export default ImpairmentQuickView;
