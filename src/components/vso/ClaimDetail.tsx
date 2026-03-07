// src/components/vso/ClaimDetail.tsx
import React from 'react';
import type { VSOClaim } from '../../types/data.types';
import Button from '../common/Button';

interface ClaimDetailProps {
  entry: VSOClaim;
  onClose: () => void;
  onEdit: (entry: VSOClaim) => void;
  onDelete?: (entryId: string) => void;
}

const statusLabels: Record<string, string> = {
  'planning': 'Planning',
  'intent-filed': 'Intent Filed',
  'filed': 'Filed',
  'pending-development': 'Pending Development',
  'c-and-p-scheduled': 'C&P Scheduled',
  'c-and-p-completed': 'C&P Completed',
  'rating-decision': 'Rating Decision',
  'appealing': 'Appealing',
  'granted': 'Granted',
  'denied': 'Denied',
};

const typeLabels: Record<string, string> = {
  'direct': 'Direct',
  'secondary': 'Secondary',
  'presumptive': 'Presumptive',
  'aggravation': 'Aggravation',
  'increase': 'Increase',
};

const trackLabels: Record<string, string> = {
  'cervical-spine': 'Cervical Spine',
  'secondary-conditions': 'Secondary Conditions',
  'tera-toxic-exposure': 'TERA / Toxic Exposure',
  'mental-health': 'Mental Health',
  'rating-increase': 'Rating Increase',
};

const statusColors: Record<string, { bg: string; color: string }> = {
  'planning': { bg: '#cce5ff', color: '#004085' },
  'intent-filed': { bg: '#fff3cd', color: '#856404' },
  'filed': { bg: '#d4edda', color: '#155724' },
  'pending-development': { bg: '#e8daef', color: '#6c3483' },
  'c-and-p-scheduled': { bg: '#fdebd0', color: '#935116' },
  'c-and-p-completed': { bg: '#d5f5e3', color: '#1e8449' },
  'rating-decision': { bg: '#d6eaf8', color: '#2e4053' },
  'appealing': { bg: '#fadbd8', color: '#922b21' },
  'granted': { bg: '#abebc6', color: '#1e8449' },
  'denied': { bg: '#f5b7b1', color: '#922b21' },
};

const isDeadlineApproaching = (deadline: string | undefined): boolean => {
  if (!deadline) return false;
  const deadlineDate = new Date(deadline);
  const now = new Date();
  const daysRemaining = (deadlineDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24);
  return daysRemaining >= 0 && daysRemaining <= 30;
};

const ClaimDetail: React.FC<ClaimDetailProps> = ({ entry, onClose, onEdit, onDelete }) => {
  const statusStyle = statusColors[entry.status] || statusColors.planning;
  const deadlineWarning = isDeadlineApproaching(entry.filingDeadline);

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    alert(`${label} copied to clipboard!`);
  };

  return (
    <div>
      <h3>{entry.claimName}</h3>

      <div style={{ display: 'flex', gap: '8px', marginBottom: '15px', flexWrap: 'wrap' }}>
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
          {typeLabels[entry.claimType] || entry.claimType}
        </span>
        <span style={{
          padding: '4px 12px', borderRadius: '12px', fontSize: '0.85em', fontWeight: 600,
          background: '#e8e8e8', color: '#444',
        }}>
          {trackLabels[entry.claimTrack] || entry.claimTrack}
        </span>
      </div>

      <p><strong>Condition Claimed:</strong> {entry.conditionClaimed}</p>
      <p><strong>ICD-10:</strong> {entry.icd10}</p>
      <p><strong>Diagnostic Code:</strong> {entry.diagnosticCode}</p>

      {entry.filingDeadline && (
        <p style={{
          padding: '8px 12px', borderRadius: '6px', fontWeight: 600,
          background: deadlineWarning ? '#fff3cd' : '#f4f4f4',
          border: deadlineWarning ? '1px solid #ffc107' : '1px solid #ddd',
          color: deadlineWarning ? '#856404' : 'inherit',
        }}>
          <strong>Filing Deadline:</strong> {entry.filingDeadline}
          {deadlineWarning && ' - APPROACHING'}
        </p>
      )}

      <div style={{
        whiteSpace: 'pre-wrap', padding: '15px', borderRadius: '5px', margin: '15px 0',
        background: '#f4f4f4', border: '1px solid #ddd',
      }}>
        <strong>Theory of Connection:</strong>
        <p>{entry.theoryOfConnection}</p>
        <button onClick={() => copyToClipboard(entry.theoryOfConnection, 'Theory of connection')} style={{ marginTop: '8px' }}>
          Copy
        </button>
      </div>

      {entry.alternativeTheory && (
        <div style={{ whiteSpace: 'pre-wrap', background: '#f4f4f4', padding: '15px', borderRadius: '5px', margin: '15px 0' }}>
          <strong>Alternative Theory:</strong>
          <p>{entry.alternativeTheory}</p>
        </div>
      )}

      <div style={{ whiteSpace: 'pre-wrap', background: '#f4f4f4', padding: '15px', borderRadius: '5px', margin: '15px 0' }}>
        <strong>In-Service Event:</strong>
        <p>{entry.inServiceEvent}</p>
      </div>

      {entry.estimatedRating && <p><strong>Estimated Rating:</strong> {entry.estimatedRating}</p>}
      {entry.currentRating && <p><strong>Current Rating:</strong> {entry.currentRating}</p>}
      {entry.effectiveDate && <p><strong>Effective Date:</strong> {entry.effectiveDate}</p>}
      {entry.intentToFileDate && <p><strong>Intent to File Date:</strong> {entry.intentToFileDate}</p>}
      {entry.filingDate && <p><strong>Filing Date:</strong> {entry.filingDate}</p>}
      {entry.ratingDecisionDate && <p><strong>Rating Decision Date:</strong> {entry.ratingDecisionDate}</p>}
      {entry.linkedConditionIds && <p><strong>Linked Condition IDs:</strong> {entry.linkedConditionIds}</p>}
      {entry.assignedVSO && <p><strong>Assigned VSO:</strong> {entry.assignedVSO}</p>}

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

export default ClaimDetail;
