// src/components/health/JournalQuickView.tsx
import React from 'react';
import type { HealthJournalEntry } from '../../types/data.types';
import { QuickViewRow, QuickViewCell } from './JournalQuickView.styled';

interface JournalQuickViewProps {
  entry: HealthJournalEntry;
  onSelect: (entry: HealthJournalEntry) => void;
}

const JournalQuickView: React.FC<JournalQuickViewProps> = ({ entry, onSelect }) => {
  const entryDate = new Date(entry.date).toLocaleDateString();

  return (
    <QuickViewRow onClick={() => onSelect(entry)}>
      <QuickViewCell>{entryDate}</QuickViewCell>
      <QuickViewCell>{entry.reasonForEntry}</QuickViewCell>
      <QuickViewCell>Pain: {entry.painLevel}/10</QuickViewCell>
    </QuickViewRow>
  );
};

export default JournalQuickView;
