// src/components/vso/ExposureDetail.tsx
import React from 'react';
import type { VSOExposure } from '../../types/data.types';
import Button from '../common/Button';

interface ExposureDetailProps {
  entry: VSOExposure;
  onClose: () => void;
  onEdit: (entry: VSOExposure) => void;
  onDelete?: (entryId: string) => void;
}

const exposureTypeColors: Record<string, { bg: string; color: string }> = {
  'rf-radiation': { bg: '#fadbd8', color: '#922b21' },
  chemical: { bg: '#e8daef', color: '#6c3483' },
  fuel: { bg: '#fdebd0', color: '#935116' },
  paint: { bg: '#d6eaf8', color: '#2e4053' },
  solvent: { bg: '#fff3cd', color: '#856404' },
  particulate: { bg: '#e2e3e5', color: '#383d41' },
  noise: { bg: '#d5f5e3', color: '#1e8449' },
  nuclear: { bg: '#f5b7b1', color: '#922b21' },
  other: { bg: '#e2e3e5', color: '#383d41' },
};

const exposureTypeLabels: Record<string, string> = {
  'rf-radiation': 'RF/Microwave Radiation',
  chemical: 'Chemical',
  fuel: 'Fuel',
  paint: 'Paint/Coating',
  solvent: 'Solvent',
  particulate: 'Particulate',
  noise: 'Noise',
  nuclear: 'Nuclear/Ionizing',
  other: 'Other',
};

const ExposureDetail: React.FC<ExposureDetailProps> = ({ entry, onClose, onEdit, onDelete }) => {
  const typeStyle = exposureTypeColors[entry.exposureType] || exposureTypeColors.other;

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    alert(`${label} copied to clipboard!`);
  };

  return (
    <div>
      <h3>{entry.substance}</h3>

      <div style={{ display: 'flex', gap: '8px', marginBottom: '15px' }}>
        <span style={{
          padding: '4px 12px', borderRadius: '12px', fontSize: '0.85em', fontWeight: 600,
          background: typeStyle.bg, color: typeStyle.color,
        }}>
          {exposureTypeLabels[entry.exposureType] || entry.exposureType}
        </span>
      </div>

      <p><strong>Weapon System:</strong> {entry.weaponSystem}</p>
      {entry.mosAtTimeOfExposure && <p><strong>MOS at Time of Exposure:</strong> {entry.mosAtTimeOfExposure}</p>}
      <p><strong>Frequency:</strong> {entry.frequency}</p>
      <p><strong>Duration:</strong> {entry.duration}</p>
      <p><strong>PPE Provided:</strong> {entry.ppeProvided}</p>
      <p><strong>Linked Claims:</strong> {entry.linkedClaimNames}</p>
      {entry.witnessAvailable !== undefined && (
        <p><strong>Witness Available:</strong> {entry.witnessAvailable ? 'Yes' : 'No'}</p>
      )}

      {entry.description && (
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
      )}

      {entry.healthEffectPathway && (
        <div style={{
          whiteSpace: 'pre-wrap', padding: '15px', borderRadius: '5px', margin: '15px 0',
          background: '#f4f4f4', border: '1px solid #ddd',
        }}>
          <strong>Health Effect Pathway:</strong>
          <p>{entry.healthEffectPathway}</p>
          <button onClick={() => copyToClipboard(entry.healthEffectPathway || '', 'Health effect pathway')} style={{ marginTop: '8px' }}>
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

export default ExposureDetail;
