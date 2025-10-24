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
            <h3>{entry.title}</h3>
            <p><strong>Description:</strong> {entry.description}</p>
            <pre>{entry.content}</pre>
            {entry.fields && entry.fields.length > 0 && (
                <div>
                    <h4>Fields:</h4>
                    {entry.fields.map(field => (
                        <p key={field.id}><strong>{field.label}:</strong> {field.value}</p>
                    ))}
                </div>
            )}
            <Button onClick={() => onEdit(entry)}>Edit</Button>
            <Button onClick={onClose} style={{ marginLeft: '10px' }}>Close</Button>
        </div>
    );
};

export default FreetextDetail;