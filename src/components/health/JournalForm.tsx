// src/components/health/JournalForm.tsx
import React, { useState } from 'react';
import type { HealthJournalEntry } from '../../types/data.types';
import Button from '../common/Button';
import Input from '../common/Input';
import { v4 as uuidv4 } from 'uuid';

interface JournalFormProps {
    onSave: (entry: HealthJournalEntry) => void;
    onCancel: () => void;
    existingEntry?: HealthJournalEntry;
}

const JournalForm: React.FC<JournalFormProps> = ({ onSave, onCancel, existingEntry }) => {
    const [entry, setEntry] = useState<Omit<HealthJournalEntry, 'id' | 'createdAt' | 'updatedAt'>>(
        existingEntry || {
            date: Date.now(),
            reasonForEntry: '',
            painLevel: 0,
            entry: '',
        }
    );

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value, type } = e.target;
        setEntry(prev => ({ ...prev, [name]: type === 'number' ? parseInt(value, 10) : value }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const now = Date.now();
        const id = existingEntry?.id || uuidv4();
        onSave({ ...entry, id, createdAt: existingEntry?.createdAt || now, updatedAt: now });
    };

    return (
        <form onSubmit={handleSubmit}>
            <h3>{existingEntry ? 'Edit' : 'Add'} Journal Entry</h3>
            <Input id="reasonForEntry" name="reasonForEntry" label="Reason for Entry" value={entry.reasonForEntry} onChange={handleChange} required />
            <Input id="painLevel" name="painLevel" label="Pain Level (0-10)" type="number" min="0" max="10" value={entry.painLevel} onChange={handleChange} required />
            <label htmlFor="entry">Entry</label>
            <textarea id="entry" name="entry" value={entry.entry} onChange={handleChange} rows={10} style={{width: '100%'}}/>
            <Button type="submit">Save</Button>
            <Button type="button" onClick={onCancel} style={{ marginLeft: '10px' }}>Cancel</Button>
        </form>
    );
};

export default JournalForm;