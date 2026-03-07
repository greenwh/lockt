// src/components/vso/RatingForm.tsx
import React, { useState } from 'react';
import type { VSORating, VSOCurrentlyMet } from '../../types/data.types';
import Button from '../common/Button';
import Input from '../common/Input';
import { v4 as uuidv4 } from 'uuid';

interface RatingFormProps {
  onSave: (entry: VSORating) => void;
  onCancel: () => void;
  existingEntry?: VSORating;
}

const RatingForm: React.FC<RatingFormProps> = ({ onSave, onCancel, existingEntry }) => {
  const [entry, setEntry] = useState<Omit<VSORating, 'id' | 'createdAt' | 'updatedAt'>>(
    existingEntry || {
      diagnosticCode: '',
      conditionName: '',
      ratingPercent: 0,
      criteria: '',
      currentlyMet: 'unknown-need-testing' as VSOCurrentlyMet,
      veteranEvidence: '',
      notes: '',
    }
  );

  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    if (name === 'ratingPercent') {
      setEntry((prev) => ({ ...prev, [name]: Number(value) }));
    } else {
      setEntry((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const now = Date.now();
      const finalEntry: VSORating = {
        id: existingEntry?.id || uuidv4(),
        ...entry,
        currentlyMet: entry.currentlyMet as VSOCurrentlyMet,
        createdAt: existingEntry?.createdAt || now,
        updatedAt: now,
      };
      onSave(finalEntry);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <h4>{existingEntry ? 'Edit Rating Criteria' : 'Add Rating Criteria'}</h4>
      <Input label="Diagnostic Code" id="diagnosticCode" name="diagnosticCode" value={entry.diagnosticCode} onChange={handleChange} required />
      <Input label="Condition Name" id="conditionName" name="conditionName" value={entry.conditionName} onChange={handleChange} required />
      <Input label="Rating Percent" id="ratingPercent" name="ratingPercent" type="number" value={String(entry.ratingPercent)} onChange={handleChange} required />

      <label htmlFor="currentlyMet">Currently Met</label>
      <select id="currentlyMet" name="currentlyMet" value={entry.currentlyMet} onChange={handleChange}
        style={{ width: '100%', padding: '8px', marginBottom: '10px', borderRadius: '4px', border: '1px solid #ccc' }}>
        <option value="met">Met</option>
        <option value="partially-met">Partially Met</option>
        <option value="not-met">Not Met</option>
        <option value="unknown-need-testing">Unknown - Need Testing</option>
      </select>

      <label htmlFor="criteria">Criteria</label>
      <textarea id="criteria" name="criteria" value={entry.criteria} onChange={handleChange} required
        style={{ width: '100%', minHeight: '80px', marginBottom: '10px' }} />

      <label htmlFor="veteranEvidence">Veteran Evidence</label>
      <textarea id="veteranEvidence" name="veteranEvidence" value={entry.veteranEvidence || ''} onChange={handleChange}
        style={{ width: '100%', minHeight: '80px', marginBottom: '10px' }} />

      <label htmlFor="notes">Notes</label>
      <textarea id="notes" name="notes" value={entry.notes || ''} onChange={handleChange}
        style={{ width: '100%', minHeight: '80px', marginBottom: '10px' }} />

      <Button type="submit" disabled={isLoading}>
        {isLoading ? 'Saving...' : 'Save Rating Criteria'}
      </Button>
      <Button type="button" onClick={onCancel}>Cancel</Button>
    </form>
  );
};

export default RatingForm;
