// src/components/freetext/FreetextForm.tsx
import React, { useState } from 'react';
import type { FreetextEntry, FreetextField } from '../../types/data.types';
import Button from '../common/Button';
import Input from '../common/Input';
import { v4 as uuidv4 } from 'uuid';

interface FreetextFormProps {
    onSave: (entry: FreetextEntry) => void;
    onCancel: () => void;
    existingEntry?: FreetextEntry;
}

const FreetextForm: React.FC<FreetextFormProps> = ({ onSave, onCancel, existingEntry }) => {
    const [entry, setEntry] = useState<Omit<FreetextEntry, 'id' | 'createdAt' | 'updatedAt'>>(
        existingEntry || {
            title: '',
            description: '',
            content: '',
            fields: [],
        }
    );

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setEntry(prev => ({ ...prev, [name]: value }));
    };

    const handleFieldChange = (index: number, field: 'label' | 'value', value: string) => {
        const newFields = [...(entry.fields || [])];
        newFields[index] = { ...newFields[index], [field]: value };
        setEntry(prev => ({ ...prev, fields: newFields }));
    };

    const addField = () => {
        const newField: FreetextField = { id: uuidv4(), label: '', value: '', type: 'text' };
        setEntry(prev => ({ ...prev, fields: [...(prev.fields || []), newField] }));
    };

    const removeField = (index: number) => {
        const newFields = [...(entry.fields || [])];
        newFields.splice(index, 1);
        setEntry(prev => ({ ...prev, fields: newFields }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const now = Date.now();
        const id = existingEntry?.id || '';
        onSave({ ...entry, id, createdAt: existingEntry?.createdAt || now, updatedAt: now });
    };

    return (
        <form onSubmit={handleSubmit}>
            <h3>{existingEntry ? 'Edit' : 'Add'} Note</h3>
            <Input id="title" name="title" label="Title" value={entry.title} onChange={handleChange} required />
            <Input id="description" name="description" label="Description" value={entry.description} onChange={handleChange} required />
            <label htmlFor="content">Content</label>
            <textarea id="content" name="content" value={entry.content} onChange={handleChange} rows={10} style={{width: '100%'}}/>

            <h4>Custom Fields</h4>
            {entry.fields?.map((field, index) => (
                <div key={index} style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                    <Input id={`field-label-${index}`} name={`field-label-${index}`} label="Label" value={field.label} onChange={(e) => handleFieldChange(index, 'label', e.target.value)} />
                    <Input id={`field-value-${index}`} name={`field-value-${index}`} label="Value" value={field.value} onChange={(e) => handleFieldChange(index, 'value', e.target.value)} />
                    <Button type="button" onClick={() => removeField(index)}>Remove</Button>
                </div>
            ))}
            <Button type="button" onClick={addField}>Add Field</Button>

            <div style={{ marginTop: '20px' }}>
                <Button type="submit">Save</Button>
                <Button type="button" onClick={onCancel} style={{ marginLeft: '10px' }}>Cancel</Button>
            </div>
        </form>
    );
};

export default FreetextForm;