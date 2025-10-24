// src/components/freetext/FreetextDetail.tsx
import React, { useState } from 'react';
import type { FreetextEntry } from '../../types/data.types';
import Button from '../common/Button';

interface FreetextDetailProps {
  entry: FreetextEntry;
  onClose: () => void;
  onEdit: (entry: FreetextEntry) => void;
  onDelete?: (entryId: string) => void;
}

const FreetextDetail: React.FC<FreetextDetailProps> = ({ entry, onClose, onEdit, onDelete }) => {
  const [showContent, setShowContent] = useState(true);

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    alert(`${label} copied to clipboard!`);
  };

  return (
    <div>
      <h2>{entry.title}</h2>
      {entry.description && <p><strong>Description:</strong> {entry.description}</p>}
      {entry.category && <p><strong>Category:</strong> {entry.category}</p>}
      {entry.content && (
        <div>
          <p>
            <strong>Content:</strong>{' '}
            <button onClick={() => setShowContent(!showContent)} style={{ marginLeft: '8px' }}>
              {showContent ? '👁️' : '👁️‍🗨️'}
            </button>
            <button onClick={() => copyToClipboard(entry.content || '', 'Content')} style={{ marginLeft: '4px' }}>
              📋
            </button>
          </p>
          {showContent && (
            <div style={{ whiteSpace: 'pre-wrap', background: '#f4f4f4', padding: '15px', borderRadius: '5px', margin: '15px 0' }}>
              {entry.content}
            </div>
          )}
        </div>
      )}
      {entry.notes && <p><strong>Notes:</strong> {entry.notes}</p>}
      {entry.tags && entry.tags.length > 0 && <p><strong>Tags:</strong> {entry.tags.join(', ')}</p>}
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

export default FreetextDetail;
