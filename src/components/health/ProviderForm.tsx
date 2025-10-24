// src/components/health/ProviderForm.tsx
import React, { useState } from 'react';
import type { HealthProvider } from '../../types/data.types';
import Button from '../common/Button';
import Input from '../common/Input';
import { v4 as uuidv4 } from 'uuid';

interface ProviderFormProps {
    onSave: (entry: HealthProvider) => void;
    onCancel: () => void;
    existingEntry?: HealthProvider;
}

const ProviderForm: React.FC<ProviderFormProps> = ({ onSave, onCancel, existingEntry }) => {
    const [entry, setEntry] = useState<Omit<HealthProvider, 'id' | 'createdAt' | 'updatedAt'>>(
        existingEntry || {
            drName: '',
            specialty: '',
            email: '',
            phone: '',
            fax: '',
            account: '',
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
        onSave({ ...entry, id, createdAt: existingEntry?.createdAt || now, updatedAt: now });
    };

    return (
        <form onSubmit={handleSubmit}>
            <h3>{existingEntry ? 'Edit' : 'Add'} Provider</h3>
            <Input id="drName" name="drName" label="Doctor Name" value={entry.drName} onChange={handleChange} required />
            <Input id="specialty" name="specialty" label="Specialty" value={entry.specialty} onChange={handleChange} required />
            <Input id="email" name="email" label="Email" value={entry.email || ''} onChange={handleChange} />
            <Input id="phone" name="phone" label="Phone" value={entry.phone || ''} onChange={handleChange} />
            <Input id="fax" name="fax" label="Fax" value={entry.fax || ''} onChange={handleChange} />
            <Input id="account" name="account" label="Account" value={entry.account || ''} onChange={handleChange} />
            <Button type="submit">Save</Button>
            <Button type="button" onClick={onCancel} style={{ marginLeft: '10px' }}>Cancel</Button>
        </form>
    );
};

export default ProviderForm;