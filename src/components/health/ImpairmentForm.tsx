// src/components/health/ImpairmentForm.tsx
import React, { useState } from 'react';
import type { HealthImpairment, HealthCondition } from '../../types/data.types';
import Button from '../common/Button';
import Input from '../common/Input';
import { v4 as uuidv4 } from 'uuid';

interface ImpairmentFormProps {
  onSave: (entry: HealthImpairment) => void;
  onCancel: () => void;
  existingEntry?: HealthImpairment;
  conditions: HealthCondition[]; // To link impairments to conditions
}

const ImpairmentForm: React.FC<ImpairmentFormProps> = ({ onSave, onCancel, existingEntry, conditions }) => {
  const [entry, setEntry] = useState<Omit<HealthImpairment, 'id' | 'createdAt' | 'updatedAt'>>(
    existingEntry || {
      description: '',
      dateOfOnset: Date.now(),
      contributingConditionIds: [],
      elaboration: '',
    }
  );

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setEntry((prev) => ({ ...prev, [name]: value }));
  };

  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { value } = e.target;
    setEntry((prev) => ({ ...prev, dateOfOnset: new Date(value).getTime() }));
  };
  
  const handleConditionChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedIds = Array.from(e.target.selectedOptions, option => option.value);
    setEntry(prev => ({ ...prev, contributingConditionIds: selectedIds }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const now = Date.now();
    const finalEntry: HealthImpairment = {
      id: existingEntry?.id || uuidv4(),
      ...entry,
      createdAt: existingEntry?.createdAt || now,
      updatedAt: now,
    };
    onSave(finalEntry);
  };

  return (
    <form onSubmit={handleSubmit}>
      <Input label="Impairment Description" id="description" name="description" value={entry.description} onChange={handleChange} required />
      <Input label="Date of Onset" id="dateOfOnset" name="dateOfOnset" type="date" value={entry.dateOfOnset ? new Date(entry.dateOfOnset).toISOString().split('T')[0] : ''} onChange={handleDateChange} />
      <div>
        <label htmlFor="contributingConditionIds">Contributing Conditions</label>
        <select id="contributingConditionIds" name="contributingConditionIds" multiple value={entry.contributingConditionIds} onChange={handleConditionChange}>
          {conditions.map(c => (
            <option key={c.id} value={c.id}>{c.condition}</option>
          ))}
        </select>
      </div>
      <div>
        <label htmlFor="elaboration">Elaboration</label>
        <textarea id="elaboration" name="elaboration" value={entry.elaboration} onChange={handleChange} style={{ width: '100%', minHeight: '120px' }} />
      </div>
      <Button type="submit">Save Impairment</Button>
      <Button type="button" onClick={onCancel}>Cancel</Button>
    </form>
  );
};

export default ImpairmentForm;
