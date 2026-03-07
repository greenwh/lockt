// src/components/vso/EvidenceDetail.tsx
import React from 'react';
import type { VSOEvidence } from '../../types/data.types';
import Button from '../common/Button';

interface EvidenceDetailProps {
  entry: VSOEvidence;
  onClose: () => void;
  onEdit: (entry: VSOEvidence) => void;
  onDelete?: (entryId: string) => void;
}

const statusLabels: Record<string, string> = {
  'obtained': 'Obtained',
  'pending-request': 'Pending Request',
  'needed': 'Needed',
  'in-progress': 'In Progress',
  'submitted-to-va': 'Submitted to VA',
};

const typeLabels: Record<string, string> = {
  'medical-record': 'Medical Record',
  'imaging': 'Imaging',
  'lab-result': 'Lab Result',
  'pft': 'PFT',
  'personal-statement': 'Personal Statement',
  'buddy-statement': 'Buddy Statement',
  'nexus-opinion': 'Nexus Opinion',
  'military-record': 'Military Record',
  'va-record': 'VA Record',
  'research-literature': 'Research Literature',
  'va-form': 'VA Form',
  'other': 'Other',
};

const priorityLabels: Record<string, string> = {
  'critical': 'Critical',
  'high': 'High',
  'moderate': 'Moderate',
  'low': 'Low',
};

const statusColors: Record<string, { bg: string; color: string }> = {
  'obtained': { bg: '#d4edda', color: '#155724' },
  'pending-request': { bg: '#fff3cd', color: '#856404' },
  'needed': { bg: '#f5b7b1', color: '#922b21' },
  'in-progress': { bg: '#cce5ff', color: '#004085' },
  'submitted-to-va': { bg: '#abebc6', color: '#1e8449' },
};

const priorityColors: Record<string, { bg: string; color: string }> = {
  'critical': { bg: '#f5b7b1', color: '#922b21' },
  'high': { bg: '#fdebd0', color: '#935116' },
  'moderate': { bg: '#fff3cd', color: '#856404' },
  'low': { bg: '#e2e3e5', color: '#383d41' },
};

const EvidenceDetail: React.FC<EvidenceDetailProps> = ({ entry, onClose, onEdit, onDelete }) => {
  const statusStyle = statusColors[entry.status] || statusColors.obtained;
  const priorityStyle = priorityColors[entry.priority] || priorityColors.moderate;

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    alert(`${label} copied to clipboard!`);
  };

  return (
    <div>
      <h3>{entry.evidenceName}</h3>

      <div style={{ display: 'flex', gap: '8px', marginBottom: '15px', flexWrap: 'wrap' }}>
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
        <span style={{
          padding: '4px 12px', borderRadius: '12px', fontSize: '0.85em', fontWeight: 600,
          background: '#f0f0f0', color: '#333',
        }}>
          {typeLabels[entry.evidenceType] || entry.evidenceType}
        </span>
      </div>

      <p><strong>Linked Claims:</strong> {entry.linkedClaimNames}</p>
      <p><strong>Source:</strong> {entry.source}</p>
      {entry.dateOfEvidence && <p><strong>Date of Evidence:</strong> {entry.dateOfEvidence}</p>}
      {entry.dateObtained && <p><strong>Date Obtained:</strong> {entry.dateObtained}</p>}
      {entry.dateSubmitted && <p><strong>Date Submitted:</strong> {entry.dateSubmitted}</p>}
      {entry.location && <p><strong>Location:</strong> {entry.location}</p>}

      {entry.status === 'needed' && entry.gapNotes && (
        <div style={{
          whiteSpace: 'pre-wrap', padding: '15px', borderRadius: '5px', margin: '15px 0',
          background: '#f5b7b1', border: '1px solid #e74c3c',
        }}>
          <strong>Gap Notes (Evidence Needed):</strong>
          <p>{entry.gapNotes}</p>
        </div>
      )}

      {entry.status !== 'needed' && entry.gapNotes && (
        <div style={{ whiteSpace: 'pre-wrap', background: '#f4f4f4', padding: '15px', borderRadius: '5px', margin: '15px 0' }}>
          <strong>Gap Notes:</strong>
          <p>{entry.gapNotes}</p>
        </div>
      )}

      <div style={{
        whiteSpace: 'pre-wrap', padding: '15px', borderRadius: '5px', margin: '15px 0',
        background: '#f4f4f4', border: '1px solid #ddd',
      }}>
        <strong>Description:</strong>
        <p>{entry.description}</p>
        <button onClick={() => copyToClipboard(entry.description, 'Description')} style={{ marginTop: '8px' }}>
          Copy
        </button>
      </div>

      {entry.relevanceNotes && (
        <div style={{
          whiteSpace: 'pre-wrap', padding: '15px', borderRadius: '5px', margin: '15px 0',
          background: '#f4f4f4', border: '1px solid #ddd',
        }}>
          <strong>Relevance Notes:</strong>
          <p>{entry.relevanceNotes}</p>
          <button onClick={() => copyToClipboard(entry.relevanceNotes || '', 'Relevance notes')} style={{ marginTop: '8px' }}>
            Copy
          </button>
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

export default EvidenceDetail;
