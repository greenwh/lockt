// src/components/health/ConditionDetail.tsx
import React from 'react';
import type { HealthCondition } from '../../types/data.types';
import Button from '../common/Button';

interface ConditionDetailProps {
  entry: HealthCondition;
  onClose: () => void;
  onEdit: (entry: HealthCondition) => void;
}

const ConditionDetail: React.FC<ConditionDetailProps> = ({ entry, onClose, onEdit }) => {
  const diagnosisDate = entry.dateOfDiagnosis
    ? new Date(entry.dateOfDiagnosis).toLocaleDateString()
    : 'N/A';

  return (
    <div>
      <h3>{entry.condition}</h3>
      <p><strong>Date of Diagnosis:</strong> {diagnosisDate}</p>
      <p><strong>Diagnosing Doctor/Agency:</strong> {entry.diagnosingDoctorOrAgency}</p>
      <div style={{ whiteSpace: 'pre-wrap', background: '#f4f4f4', padding: '15px', borderRadius: '5px', margin: '15px 0' }}>
        <strong>Symptomology:</strong>
        <p>{entry.symptomology}</p>
      </div>
      <Button onClick={() => onEdit(entry)}>Edit</Button>
      <Button onClick={onClose}>Close</Button>
    </div>
  );
};

export default ConditionDetail;
