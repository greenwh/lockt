// src/components/health/ConditionQuickView.tsx
import React from 'react';
import type { HealthCondition } from '../../types/data.types';
import { QuickViewRow, QuickViewCell } from './ConditionQuickView.styled';

interface ConditionQuickViewProps {
  entry: HealthCondition;
  onSelect: (entry: HealthCondition) => void;
  onDelete?: (entryId: string) => void;
}

const ConditionQuickView: React.FC<ConditionQuickViewProps> = ({ entry, onSelect, onDelete }) => {
  const diagnosisDate = entry.dateOfDiagnosis
    ? new Date(entry.dateOfDiagnosis).toLocaleDateString()
    : 'N/A';

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onDelete) {
      onDelete(entry.id);
    }
  };

  return (
    <QuickViewRow onClick={() => onSelect(entry)}>
      <QuickViewCell>{entry.condition}</QuickViewCell>
      <QuickViewCell>{diagnosisDate}</QuickViewCell>
      <QuickViewCell>{entry.diagnosingDoctorOrAgency}</QuickViewCell>
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

export default ConditionQuickView;
