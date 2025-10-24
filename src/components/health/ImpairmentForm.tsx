// src/components/health/ImpairmentForm.tsx
import React, { useState } from 'react';
import type { HealthImpairment } from '../../types/data.types';
import Button from '../common/Button';
import Input from '../common/Input';
import { v4 as uuidv4 } from 'uuid';
import { useData } from '../../context/DataContext';

interface ImpairmentFormProps {
    onSave: (entry: HealthImpairment) => void;
    onCancel: () => void;
    existingEntry?: HealthImpairment;
}

const ImpairmentForm: React.FC<ImpairmentFormProps> = ({ onSave, onCancel, existingEntry }) => {
    const { appData } = useData();
    const [entry, setEntry] = useState<Omit<HealthImpairment, 'id' | 'createdAt' | 'updatedAt'>>(
        existingEntry || {
            description: '',
            elaboration: '',
            dateOfOnset: undefined,
            contributingConditionIds: [],
        }
    );

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value, type } = e.target;
        if (type === 'select-multiple') {
            const selectedOptions = Array.from((e.target as HTMLSelectElement).selectedOptions).map(option => option.value);
            setEntry(prev => ({ ...prev, [name]: selectedOptions }));
        } else {
            setEntry(prev => ({ ...prev, [name]: value }));
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const now = Date.now();
        const id = existingEntry?.id || uuidv4();
        const dateOfOnset = entry.dateOfOnset ? new Date(entry.dateOfOnset).getTime() : undefined;
        onSave({ ...entry, id, dateOfOnset, createdAt: existingEntry?.createdAt || now, updatedAt: now });
    };

    return (
        <form onSubmit={handleSubmit}>
            <h3>{existingEntry ? 'Edit' : 'Add'} Impairment</h3>
            <Input id="description" name="description" label="Description" value={entry.description} onChange={handleChange} required />
            <Input id="dateOfOnset" name="dateOfOnset" label="Date of Onset" type="date" value={entry.dateOfOnset ? new Date(entry.dateOfOnset).toISOString().split('T')[0] : ''} onChange={handleChange} />
            
            <label htmlFor="contributingConditionIds">Associated Conditions</label>
            <select id="contributingConditionIds" name="contributingConditionIds" multiple value={entry.contributingConditionIds} onChange={handleChange} style={{ width: '100%', minHeight: '100px' }}>
                {appData.health.conditions.map(condition => (
                    <option key={condition.id} value={condition.id}>{condition.condition}</option>
                ))}
            </select>

            <label htmlFor="elaboration" style={{ marginTop: '16px', display: 'block' }}>Elaboration</label>
            <textarea id="elaboration" name="elaboration" value={entry.elaboration || ''} onChange={handleChange} rows={5} style={{width: '100%'}}/>
            
            <div style={{ marginTop: '20px' }}>
                <Button type="submit">Save</Button>
                <Button type="button" onClick={onCancel} style={{ marginLeft: '10px' }}>Cancel</Button>
            </div>
        </form>
    );
};

export default ImpairmentForm;