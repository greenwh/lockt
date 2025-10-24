// src/components/health/ImpairmentDetail.tsx
import React from 'react';
import type { HealthImpairment, HealthCondition } from '../../types/data.types';
import Button from '../common/Button';

interface ImpairmentDetailProps {
  entry: HealthImpairment;
  conditions: HealthCondition[];
  onClose: () => void;
  onEdit: (entry: HealthImpairment) => void;
  onDelete?: (entryId: string) => void;
}

const ImpairmentDetail: React.FC<ImpairmentDetailProps> = ({ entry, conditions, onClose, onEdit, onDelete }) => {
  const onsetDate = entry.dateOfOnset
    ? new Date(entry.dateOfOnset).toLocaleDateString()
    : 'N/A';

  const contributingConditions = conditions
    .filter(c => entry.contributingConditionIds?.includes(c.id))
    .map(c => c.condition)
    .join(', ');

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    alert(`${label} copied to clipboard!`);
  };

  return (
    <div>
      <h3>{entry.description}</h3>
      <p><strong>Date of Onset:</strong> {onsetDate}</p>
      {contributingConditions && (
        <p><strong>Contributing Conditions:</strong> {contributingConditions}</p>
      )}
      {entry.elaboration && (
        <div style={{ whiteSpace: 'pre-wrap', background: '#f4f4f4', padding: '15px', borderRadius: '5px', margin: '15px 0' }}>
          <strong>Elaboration:</strong>
          <p>{entry.elaboration}</p>
          <button onClick={() => copyToClipboard(entry.elaboration || '', 'Elaboration')} style={{ marginTop: '8px' }}>
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

export default ImpairmentDetail;
