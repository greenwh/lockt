// src/components/health/ImpairmentDetail.tsx
import React from 'react';
import type { HealthImpairment, HealthCondition } from '../../types/data.types';
import Button from '../common/Button';

interface ImpairmentDetailProps {
  entry: HealthImpairment;
  conditions: HealthCondition[];
  onClose: () => void;
  onEdit: (entry: HealthImpairment) => void;
}

const ImpairmentDetail: React.FC<ImpairmentDetailProps> = ({ entry, conditions, onClose, onEdit }) => {
  const onsetDate = entry.dateOfOnset
    ? new Date(entry.dateOfOnset).toLocaleDateString()
    : 'N/A';

  const contributingConditions = conditions
    .filter(c => entry.contributingConditionIds?.includes(c.id))
    .map(c => c.condition)
    .join(', ');

  return (
    <div>
      <h3>{entry.description}</h3>
      <p><strong>Date of Onset:</strong> {onsetDate}</p>
      <p><strong>Contributing Conditions:</strong> {contributingConditions}</p>
      {entry.elaboration && (
        <div style={{ whiteSpace: 'pre-wrap', background: '#f4f4f4', padding: '15px', borderRadius: '5px', margin: '15px 0' }}>
          <strong>Elaboration:</strong>
          <p>{entry.elaboration}</p>
        </div>
      )}
      <Button onClick={() => onEdit(entry)}>Edit</Button>
      <Button onClick={onClose}>Close</Button>
    </div>
  );
};

export default ImpairmentDetail;
