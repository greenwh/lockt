// src/components/health/ProviderQuickView.tsx
import React from 'react';
import type { HealthProvider } from '../../types/data.types';
import { QuickViewRow, QuickViewCell } from './ProviderQuickView.styled';

interface ProviderQuickViewProps {
  entry: HealthProvider;
  onSelect: (entry: HealthProvider) => void;
}

const ProviderQuickView: React.FC<ProviderQuickViewProps> = ({ entry, onSelect }) => {
  return (
    <QuickViewRow onClick={() => onSelect(entry)}>
      <QuickViewCell>{entry.drName}</QuickViewCell>
      <QuickViewCell>{entry.specialty}</QuickViewCell>
      <QuickViewCell>{entry.phone}</QuickViewCell>
    </QuickViewRow>
  );
};

export default ProviderQuickView;
