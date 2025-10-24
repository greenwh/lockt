// src/components/health/ConditionDetail.tsx
import React from 'react';
import type { HealthCondition } from '../../types/data.types';
import Button from '../common/Button';
import { format } from 'date-fns';

interface ConditionDetailProps {
    entry: HealthCondition;
    onClose: () => void;
    onEdit: (entry: HealthCondition) => void;
}

const ConditionDetail: React.FC<ConditionDetailProps> = ({ entry, onClose, onEdit }) => {
    return (
        <div>
            <h3>{entry.condition}</h3>
            {entry.dateOfDiagnosis && <p><strong>Date of Diagnosis:</strong> {format(new Date(entry.dateOfDiagnosis), 'MM/dd/yyyy')}</p>}
            <p><strong>Diagnosing Doctor/Agency:</strong> {entry.diagnosingDoctorOrAgency}</p>
            <p><strong>Symptomology:</strong> {entry.symptomology}</p>
            <Button onClick={() => onEdit(entry)}>Edit</Button>
            <Button onClick={onClose} style={{ marginLeft: '10px' }}>Close</Button>
        </div>
    );
};

export default ConditionDetail;