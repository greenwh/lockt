// src/components/health/ImpairmentDetail.tsx
import React from 'react';
import type { HealthImpairment } from '../../types/data.types';
import Button from '../common/Button';
import { format } from 'date-fns';
import { useData } from '../../context/DataContext';

interface ImpairmentDetailProps {
    entry: HealthImpairment;
    onClose: () => void;
    onEdit: (entry: HealthImpairment) => void;
}

const ImpairmentDetail: React.FC<ImpairmentDetailProps> = ({ entry, onClose, onEdit }) => {
    const { appData } = useData();
    const associatedConditions = appData.health.conditions
        .filter(c => entry.contributingConditionIds?.includes(c.id))
        .map(c => c.condition)
        .join(', ');

    return (
        <div>
            <h3>{entry.description}</h3>
            {entry.dateOfOnset && <p><strong>Date of Onset:</strong> {format(new Date(entry.dateOfOnset), 'MM/dd/yyyy')}</p>}
            {associatedConditions && <p><strong>Associated Conditions:</strong> {associatedConditions}</p>}
            <p><strong>Elaboration:</strong></p>
            <pre>{entry.elaboration}</pre>
            <Button onClick={() => onEdit(entry)}>Edit</Button>
            <Button onClick={onClose} style={{ marginLeft: '10px' }}>Close</Button>
        </div>
    );
};

export default ImpairmentDetail;