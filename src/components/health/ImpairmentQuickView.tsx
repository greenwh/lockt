// src/components/health/ImpairmentQuickView.tsx
import React from 'react';
import type { HealthImpairment } from '../../types/data.types';
import { QuickViewRow, QuickViewCell } from './ImpairmentQuickView.styled';
import { format } from 'date-fns';

interface ImpairmentQuickViewProps {
    entry: HealthImpairment;
    onSelect: (entry: HealthImpairment) => void;
}

const ImpairmentQuickView: React.FC<ImpairmentQuickViewProps> = ({ entry, onSelect }) => {
    return (
        <QuickViewRow onClick={() => onSelect(entry)}>
            <QuickViewCell>{entry.description}</QuickViewCell>
            <QuickViewCell>{entry.dateOfOnset ? format(new Date(entry.dateOfOnset), 'MM/dd/yyyy') : ''}</QuickViewCell>
        </QuickViewRow>
    );
};

export default ImpairmentQuickView;