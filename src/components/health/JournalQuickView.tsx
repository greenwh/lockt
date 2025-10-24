// src/components/health/JournalQuickView.tsx
import React from 'react';
import type { HealthJournalEntry } from '../../types/data.types';
import { QuickViewRow, QuickViewCell } from './JournalQuickView.styled';
import { format } from 'date-fns';

interface JournalQuickViewProps {
    entry: HealthJournalEntry;
    onSelect: (entry: HealthJournalEntry) => void;
}

const JournalQuickView: React.FC<JournalQuickViewProps> = ({ entry, onSelect }) => {
    return (
        <QuickViewRow onClick={() => onSelect(entry)}>
            <QuickViewCell>{format(new Date(entry.date), 'MM/dd/yyyy')}</QuickViewCell>
            <QuickViewCell>{entry.reasonForEntry}</QuickViewCell>
            <QuickViewCell>Pain: {entry.painLevel}/10</QuickViewCell>
        </QuickViewRow>
    );
};

export default JournalQuickView;