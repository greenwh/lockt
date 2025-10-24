// src/components/health/ConditionDetail.tsx
import React from 'react';
import type { HealthCondition } from '../../types/data.types';
import Button from '../common/Button';

interface ConditionDetailProps {
  entry: HealthCondition;
  onClose: () => void;
  onEdit: (entry: HealthCondition) => void;
  onDelete?: (entryId: string) => void;
}

const ConditionDetail: React.FC<ConditionDetailProps> = ({ entry, onClose, onEdit, onDelete }) => {
  const diagnosisDate = entry.dateOfDiagnosis
    ? new Date(entry.dateOfDiagnosis).toLocaleDateString()
    : 'N/A';

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    alert(`${label} copied to clipboard!`);
  };

  return (
    <div>
      <h3>{entry.condition}</h3>
      <p><strong>Date of Diagnosis:</strong> {diagnosisDate}</p>
      <p><strong>Diagnosing Doctor/Agency:</strong> {entry.diagnosingDoctorOrAgency}</p>
      {entry.symptomology && (
        <div style={{ whiteSpace: 'pre-wrap', background: '#f4f4f4', padding: '15px', borderRadius: '5px', margin: '15px 0' }}>
          <strong>Symptomology:</strong>
          <p>{entry.symptomology}</p>
          <button onClick={() => copyToClipboard(entry.symptomology || '', 'Symptomology')} style={{ marginTop: '8px' }}>
            📋 Copy
          </button>
        </div>
      )}
      <div style={{ marginTop: '1.5rem', display: 'flex', gap: '1rem' }}>
        <Button onClick={() => onEdit(entry)}>Edit</Button>
        <Button onClick={onClose}>Close</Button>
        {onDelete && (
          <Button onClick={() => onDelete(entry.id)} style={{ background: '#dc3545' }}>
            Delete
          </Button>
        )}
      </div>
    </div>
  );
};

export default ConditionDetail;
