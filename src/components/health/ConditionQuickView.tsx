// src/components/health/ConditionQuickView.tsx
import React from 'react';
import type { HealthCondition } from '../../types/data.types';
import { QuickViewRow, QuickViewCell } from './ConditionQuickView.styled';
import { format } from 'date-fns';

interface ConditionQuickViewProps {
    entry: HealthCondition;
    onSelect: (entry: HealthCondition) => void;
}

const ConditionQuickView: React.FC<ConditionQuickViewProps> = ({ entry, onSelect }) => {
    return (
        <QuickViewRow onClick={() => onSelect(entry)}>
            <QuickViewCell>{entry.condition}</QuickViewCell>
            <QuickViewCell>{entry.dateOfDiagnosis ? format(new Date(entry.dateOfDiagnosis), 'MM/dd/yyyy') : ''}</QuickViewCell>
            <QuickViewCell>{entry.diagnosingDoctorOrAgency}</QuickViewCell>
        </QuickViewRow>
    );
};

export default ConditionQuickView;