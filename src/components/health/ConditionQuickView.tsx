// src/components/health/ConditionQuickView.tsx
import React from 'react';
import type { HealthCondition } from '../../types/data.types';
import { QuickViewRow, QuickViewCell } from './ConditionQuickView.styled';

interface ConditionQuickViewProps {
  entry: HealthCondition;
  onSelect: (entry: HealthCondition) => void;
}

const ConditionQuickView: React.FC<ConditionQuickViewProps> = ({ entry, onSelect }) => {
  const diagnosisDate = entry.dateOfDiagnosis
    ? new Date(entry.dateOfDiagnosis).toLocaleDateString()
    : 'N/A';

  return (
    <QuickViewRow onClick={() => onSelect(entry)}>
      <QuickViewCell>{entry.condition}</QuickViewCell>
      <QuickViewCell>{diagnosisDate}</QuickViewCell>
      <QuickViewCell>{entry.diagnosingDoctorOrAgency}</QuickViewCell>
    </QuickViewRow>
  );
};

export default ConditionQuickView;
