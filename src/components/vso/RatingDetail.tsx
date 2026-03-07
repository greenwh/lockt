// src/components/vso/RatingDetail.tsx
import React from 'react';
import type { VSORating } from '../../types/data.types';
import Button from '../common/Button';

interface RatingDetailProps {
  entry: VSORating;
  onClose: () => void;
  onEdit: (entry: VSORating) => void;
  onDelete?: (entryId: string) => void;
}

const currentlyMetLabels: Record<string, string> = {
  met: 'Met',
  'partially-met': 'Partially Met',
  'not-met': 'Not Met',
  'unknown-need-testing': 'Unknown - Need Testing',
};

const currentlyMetColors: Record<string, { bg: string; color: string }> = {
  met: { bg: '#d4edda', color: '#155724' },
  'partially-met': { bg: '#fff3cd', color: '#856404' },
  'not-met': { bg: '#f5b7b1', color: '#922b21' },
  'unknown-need-testing': { bg: '#cce5ff', color: '#004085' },
};

const RatingDetail: React.FC<RatingDetailProps> = ({ entry, onClose, onEdit, onDelete }) => {
  const metStyle = currentlyMetColors[entry.currentlyMet] || currentlyMetColors.met;

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    alert(`${label} copied to clipboard!`);
  };

  return (
    <div>
      <h3>{entry.conditionName}</h3>

      <div style={{ display: 'flex', gap: '8px', marginBottom: '15px', alignItems: 'center' }}>
        <span style={{
          fontSize: '1.8em', fontWeight: 700, color: '#333',
        }}>
          {entry.ratingPercent}%
        </span>
        <span style={{
          padding: '4px 12px', borderRadius: '12px', fontSize: '0.85em', fontWeight: 600,
          background: metStyle.bg, color: metStyle.color,
        }}>
          {currentlyMetLabels[entry.currentlyMet] || entry.currentlyMet}
        </span>
      </div>

      <p><strong>Diagnostic Code:</strong> {entry.diagnosticCode}</p>

      <div style={{ display: 'flex', gap: '15px', flexWrap: 'wrap', margin: '15px 0' }}>
        <div style={{ flex: '1 1 45%', minWidth: '250px' }}>
          <div style={{ whiteSpace: 'pre-wrap', background: '#f4f4f4', padding: '15px', borderRadius: '5px' }}>
            <strong>Criteria:</strong>
            <p>{entry.criteria}</p>
            <button onClick={() => copyToClipboard(entry.criteria, 'Criteria')} style={{ marginTop: '8px' }}>
              Copy
            </button>
          </div>
        </div>
        {entry.veteranEvidence && (
          <div style={{ flex: '1 1 45%', minWidth: '250px' }}>
            <div style={{ whiteSpace: 'pre-wrap', background: '#f4f4f4', padding: '15px', borderRadius: '5px' }}>
              <strong>Veteran Evidence:</strong>
              <p>{entry.veteranEvidence}</p>
              <button onClick={() => copyToClipboard(entry.veteranEvidence || '', 'Veteran evidence')} style={{ marginTop: '8px' }}>
                Copy
              </button>
            </div>
          </div>
        )}
      </div>

      {entry.notes && (
        <div style={{ whiteSpace: 'pre-wrap', background: '#f4f4f4', padding: '15px', borderRadius: '5px', margin: '15px 0' }}>
          <strong>Notes:</strong>
          <p>{entry.notes}</p>
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

export default RatingDetail;
