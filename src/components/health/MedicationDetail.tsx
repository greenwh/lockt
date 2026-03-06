// src/components/health/MedicationDetail.tsx
import React from 'react';
import type { HealthMedication } from '../../types/data.types';
import Button from '../common/Button';

interface MedicationDetailProps {
  entry: HealthMedication;
  onClose: () => void;
  onEdit: (entry: HealthMedication) => void;
  onDelete?: (entryId: string) => void;
}

const statusLabels: Record<string, string> = {
  active: 'Active',
  planned: 'Planned',
  prn: 'PRN (As Needed)',
  'not-taking': 'Not Taking',
};

const typeLabels: Record<string, string> = {
  prescription: 'Prescription',
  supplement: 'Supplement',
  otc: 'Over-the-Counter',
};

const statusColors: Record<string, { bg: string; color: string }> = {
  active: { bg: '#d4edda', color: '#155724' },
  planned: { bg: '#cce5ff', color: '#004085' },
  prn: { bg: '#fff3cd', color: '#856404' },
  'not-taking': { bg: '#e2e3e5', color: '#383d41' },
};

const MedicationDetail: React.FC<MedicationDetailProps> = ({ entry, onClose, onEdit, onDelete }) => {
  const statusStyle = statusColors[entry.status] || statusColors.active;
  const hasWarning = entry.interactionNotes?.includes('\u26A0\uFE0F');

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    alert(`${label} copied to clipboard!`);
  };

  return (
    <div>
      <h3>
        {hasWarning && <span style={{ marginRight: '8px' }}>{'\u26A0\uFE0F'}</span>}
        {entry.name}
      </h3>

      <div style={{ display: 'flex', gap: '8px', marginBottom: '15px' }}>
        <span style={{
          padding: '4px 12px', borderRadius: '12px', fontSize: '0.85em', fontWeight: 600,
          background: statusStyle.bg, color: statusStyle.color,
        }}>
          {statusLabels[entry.status] || entry.status}
        </span>
        <span style={{
          padding: '4px 12px', borderRadius: '12px', fontSize: '0.85em', fontWeight: 600,
          background: '#f0f0f0', color: '#333',
        }}>
          {typeLabels[entry.type] || entry.type}
        </span>
      </div>

      <p><strong>Dose:</strong> {entry.dose}</p>
      <p><strong>Frequency:</strong> {entry.frequency}</p>
      {entry.timing && <p><strong>Timing:</strong> {entry.timing}</p>}
      <p><strong>Purpose:</strong> {entry.purpose}</p>
      {entry.prescriber && <p><strong>Prescriber:</strong> {entry.prescriber}</p>}
      {entry.startDate && <p><strong>Start Date:</strong> {entry.startDate}</p>}

      {entry.interactionNotes && (
        <div style={{
          whiteSpace: 'pre-wrap', padding: '15px', borderRadius: '5px', margin: '15px 0',
          background: hasWarning ? '#fff3cd' : '#f4f4f4',
          border: hasWarning ? '1px solid #ffc107' : '1px solid #ddd',
        }}>
          <strong>Interaction Notes:</strong>
          <p>{entry.interactionNotes}</p>
          <button onClick={() => copyToClipboard(entry.interactionNotes || '', 'Interaction notes')} style={{ marginTop: '8px' }}>
            Copy
          </button>
        </div>
      )}

      {entry.depletionNotes && (
        <div style={{ whiteSpace: 'pre-wrap', background: '#f4f4f4', padding: '15px', borderRadius: '5px', margin: '15px 0' }}>
          <strong>Depletion Notes:</strong>
          <p>{entry.depletionNotes}</p>
        </div>
      )}

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

export default MedicationDetail;
