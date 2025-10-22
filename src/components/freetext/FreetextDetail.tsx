// src/components/freetext/FreetextDetail.tsx
import React from 'react';
import type { FreetextEntry } from '../../types/data.types';
import Button from '../common/Button';

interface FreetextDetailProps {
  entry: FreetextEntry;
  onClose: () => void;
  onEdit: (entry: FreetextEntry) => void;
}

const FreetextDetail: React.FC<FreetextDetailProps> = ({ entry, onClose, onEdit }) => {
  return (
    <div>
      <h2>{entry.title}</h2>
      <p><strong>Description:</strong> {entry.description}</p>
      <div style={{ whiteSpace: 'pre-wrap', background: '#f4f4f4', padding: '15px', borderRadius: '5px', margin: '15px 0' }}>
        {entry.content}
      </div>
      {/* Render other fields as needed */}
      <Button onClick={() => onEdit(entry)}>Edit</Button>
      <Button onClick={onClose}>Close</Button>
    </div>
  );
};

export default FreetextDetail;
