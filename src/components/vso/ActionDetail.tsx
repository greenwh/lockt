// src/components/vso/ActionDetail.tsx
import React from 'react';
import type { VSOAction } from '../../types/data.types';
import Button from '../common/Button';

interface ActionDetailProps {
  entry: VSOAction;
  onClose: () => void;
  onEdit: (entry: VSOAction) => void;
  onDelete?: (entryId: string) => void;
}

const statusLabels: Record<string, string> = {
  'not-started': 'Not Started',
  'in-progress': 'In Progress',
  blocked: 'Blocked',
  completed: 'Completed',
};

const phaseLabels: Record<string, string> = {
  'phase-1-foundation': 'Phase 1: Foundation',
  'phase-2-evidence': 'Phase 2: Evidence',
  'phase-3-nexus': 'Phase 3: Nexus',
  'phase-4-filing': 'Phase 4: Filing',
  ongoing: 'Ongoing',
};

const priorityLabels: Record<string, string> = {
  critical: 'Critical',
  high: 'High',
  moderate: 'Moderate',
  low: 'Low',
};

const statusColors: Record<string, { bg: string; color: string }> = {
  'not-started': { bg: '#e2e3e5', color: '#383d41' },
  'in-progress': { bg: '#cce5ff', color: '#004085' },
  blocked: { bg: '#f5b7b1', color: '#922b21' },
  completed: { bg: '#d4edda', color: '#155724' },
};

const phaseColors: Record<string, { bg: string; color: string }> = {
  'phase-1-foundation': { bg: '#d6eaf8', color: '#2e4053' },
  'phase-2-evidence': { bg: '#e8daef', color: '#6c3483' },
  'phase-3-nexus': { bg: '#fdebd0', color: '#935116' },
  'phase-4-filing': { bg: '#fadbd8', color: '#922b21' },
  ongoing: { bg: '#d5f5e3', color: '#1e8449' },
};

const priorityColors: Record<string, { bg: string; color: string }> = {
  critical: { bg: '#f5b7b1', color: '#922b21' },
  high: { bg: '#fdebd0', color: '#935116' },
  moderate: { bg: '#fff3cd', color: '#856404' },
  low: { bg: '#e2e3e5', color: '#383d41' },
};

const ActionDetail: React.FC<ActionDetailProps> = ({ entry, onClose, onEdit, onDelete }) => {
  const statusStyle = statusColors[entry.status] || statusColors['not-started'];
  const phaseStyle = phaseColors[entry.phase] || phaseColors['phase-1-foundation'];
  const priorityStyle = priorityColors[entry.priority] || priorityColors.moderate;

  return (
    <div>
      <h3>{entry.actionItem}</h3>

      <div style={{ display: 'flex', gap: '8px', marginBottom: '15px', flexWrap: 'wrap' }}>
        <span style={{
          padding: '4px 12px', borderRadius: '12px', fontSize: '0.85em', fontWeight: 600,
          background: phaseStyle.bg, color: phaseStyle.color,
        }}>
          {phaseLabels[entry.phase] || entry.phase}
        </span>
        <span style={{
          padding: '4px 12px', borderRadius: '12px', fontSize: '0.85em', fontWeight: 600,
          background: statusStyle.bg, color: statusStyle.color,
        }}>
          {statusLabels[entry.status] || entry.status}
        </span>
        <span style={{
          padding: '4px 12px', borderRadius: '12px', fontSize: '0.85em', fontWeight: 600,
          background: priorityStyle.bg, color: priorityStyle.color,
        }}>
          {priorityLabels[entry.priority] || entry.priority}
        </span>
      </div>

      {entry.dueDate && (
        <p style={{ fontSize: '1.1em', fontWeight: 600 }}>
          <strong>Due Date:</strong> {entry.dueDate}
        </p>
      )}
      {entry.completedDate && <p><strong>Completed Date:</strong> {entry.completedDate}</p>}
      {entry.assignedTo && <p><strong>Assigned To:</strong> {entry.assignedTo}</p>}
      {entry.linkedClaimNames && <p><strong>Linked Claims:</strong> {entry.linkedClaimNames}</p>}
      {entry.linkedEvidenceNames && <p><strong>Linked Evidence:</strong> {entry.linkedEvidenceNames}</p>}

      {entry.dependsOn && (
        <div style={{ whiteSpace: 'pre-wrap', background: '#f4f4f4', padding: '15px', borderRadius: '5px', margin: '15px 0', border: '1px solid #ddd' }}>
          <strong>Dependencies:</strong>
          <p>{entry.dependsOn}</p>
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

export default ActionDetail;
