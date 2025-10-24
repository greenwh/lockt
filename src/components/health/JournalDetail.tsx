// src/components/health/JournalDetail.tsx
import React from 'react';
import type { HealthJournalEntry } from '../../types/data.types';
import Button from '../common/Button';
import { format } from 'date-fns';

interface JournalDetailProps {
    entry: HealthJournalEntry;
    onClose: () => void;
    onEdit: (entry: HealthJournalEntry) => void;
}

const JournalDetail: React.FC<JournalDetailProps> = ({ entry, onClose, onEdit }) => {
    return (
        <div>
            <h3>Journal Entry - {format(new Date(entry.date), 'MM/dd/yyyy')}</h3>
            <p><strong>Reason for Entry:</strong> {entry.reasonForEntry}</p>
            <p><strong>Pain Level:</strong> {entry.painLevel}/10</p>
            <p><strong>Entry:</strong></p>
            <pre>{entry.entry}</pre>
            <Button onClick={() => onEdit(entry)}>Edit</Button>
            <Button onClick={onClose} style={{ marginLeft: '10px' }}>Close</Button>
        </div>
    );
};

export default JournalDetail;