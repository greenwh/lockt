// src/components/freetext/FreetextQuickView.tsx
import React from 'react';
import type { FreetextEntry } from '../../types/data.types';
import { QuickViewRow, QuickViewCell } from './FreetextQuickView.styled';

interface FreetextQuickViewProps {
    entry: FreetextEntry;
    onSelect: (entry: FreetextEntry) => void;
}

const FreetextQuickView: React.FC<FreetextQuickViewProps> = ({ entry, onSelect }) => {
    return (
        <QuickViewRow onClick={() => onSelect(entry)}>
            <QuickViewCell>{entry.title}</QuickViewCell>
            <QuickViewCell>{entry.description}</QuickViewCell>
        </QuickViewRow>
    );
};

export default FreetextQuickView;