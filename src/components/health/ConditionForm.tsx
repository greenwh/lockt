// src/components/health/ConditionForm.tsx
import React, { useState } from 'react';
import type { HealthCondition } from '../../types/data.types';
import Button from '../common/Button';
import Input from '../common/Input';
import { v4 as uuidv4 } from 'uuid';

interface ConditionFormProps {
    onSave: (entry: HealthCondition) => void;
    onCancel: () => void;
    existingEntry?: HealthCondition;
}

const ConditionForm: React.FC<ConditionFormProps> = ({ onSave, onCancel, existingEntry }) => {
    const [entry, setEntry] = useState<Omit<HealthCondition, 'id' | 'createdAt' | 'updatedAt'>>(
        existingEntry || {
            condition: '',
            diagnosingDoctorOrAgency: '',
            symptomology: '',
            dateOfDiagnosis: undefined,
        }
    );

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setEntry(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const now = Date.now();
        const id = existingEntry?.id || uuidv4();
        const dateOfDiagnosis = entry.dateOfDiagnosis ? new Date(entry.dateOfDiagnosis).getTime() : undefined;
        onSave({ ...entry, id, dateOfDiagnosis, createdAt: existingEntry?.createdAt || now, updatedAt: now });
    };

    return (
        <form onSubmit={handleSubmit}>
            <h3>{existingEntry ? 'Edit' : 'Add'} Condition</h3>
            <Input id="condition" name="condition" label="Condition" value={entry.condition} onChange={handleChange} required />
            <Input id="dateOfDiagnosis" name="dateOfDiagnosis" label="Date of Diagnosis" type="date" value={entry.dateOfDiagnosis ? new Date(entry.dateOfDiagnosis).toISOString().split('T')[0] : ''} onChange={handleChange} />
            <Input id="diagnosingDoctorOrAgency" name="diagnosingDoctorOrAgency" label="Diagnosing Doctor/Agency" value={entry.diagnosingDoctorOrAgency || ''} onChange={handleChange} />
            <Input id="symptomology" name="symptomology" label="Symptomology" value={entry.symptomology || ''} onChange={handleChange} />
            <Button type="submit">Save</Button>
            <Button type="button" onClick={onCancel} style={{ marginLeft: '10px' }}>Cancel</Button>
        </form>
    );
};

export default ConditionForm;