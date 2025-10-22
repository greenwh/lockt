// src/components/passwords/PasswordQuickView.tsx
import React from 'react';
import type { PasswordEntry } from '../../types/data.types';
import { QuickViewRow, QuickViewCell } from './PasswordQuickView.styled';

interface PasswordQuickViewProps {
  entry: PasswordEntry;
  onSelect: (entry: PasswordEntry) => void;
}

const PasswordQuickView: React.FC<PasswordQuickViewProps> = ({ entry, onSelect }) => {
  return (
    <QuickViewRow onClick={() => onSelect(entry)}>
      <QuickViewCell>{entry.account}</QuickViewCell>
      <QuickViewCell>{entry.username}</QuickViewCell>
      <QuickViewCell>{entry.password}</QuickViewCell>
      <QuickViewCell>{entry.pin}</QuickViewCell>
    </QuickViewRow>
  );
};

export default PasswordQuickView;
