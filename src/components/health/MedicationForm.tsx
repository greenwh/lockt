// src/components/health/MedicationForm.tsx
import React, { useState } from 'react';
import type { HealthMedication, MedicationType, MedicationStatus } from '../../types/data.types';
import Button from '../common/Button';
import Input from '../common/Input';
import { v4 as uuidv4 } from 'uuid';

interface MedicationFormProps {
  onSave: (entry: HealthMedication) => void;
  onCancel: () => void;
  existingEntry?: HealthMedication;
}

const MedicationForm: React.FC<MedicationFormProps> = ({ onSave, onCancel, existingEntry }) => {
  const [entry, setEntry] = useState<Omit<HealthMedication, 'id' | 'createdAt' | 'updatedAt'>>(
    existingEntry || {
      name: '',
      dose: '',
      frequency: '',
      timing: '',
      type: 'prescription' as MedicationType,
      status: 'active' as MedicationStatus,
      purpose: '',
      prescriber: '',
      interactionNotes: '',
      depletionNotes: '',
      startDate: '',
      notes: '',
    }
  );

  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setEntry((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const now = Date.now();
      const finalEntry: HealthMedication = {
        id: existingEntry?.id || uuidv4(),
        ...entry,
        type: entry.type as MedicationType,
        status: entry.status as MedicationStatus,
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
      <h4>{existingEntry ? 'Edit Medication' : 'Add Medication'}</h4>
      <Input label="Name" id="name" name="name" value={entry.name} onChange={handleChange} required />
      <Input label="Dose" id="dose" name="dose" value={entry.dose} onChange={handleChange} required />
      <Input label="Frequency" id="frequency" name="frequency" value={entry.frequency} onChange={handleChange} required />
      <Input label="Timing" id="timing" name="timing" value={entry.timing || ''} onChange={handleChange} />

      <label htmlFor="type">Type</label>
      <select id="type" name="type" value={entry.type} onChange={handleChange}
        style={{ width: '100%', padding: '8px', marginBottom: '10px', borderRadius: '4px', border: '1px solid #ccc' }}>
        <option value="prescription">Prescription</option>
        <option value="supplement">Supplement</option>
        <option value="otc">OTC</option>
      </select>

      <label htmlFor="status">Status</label>
      <select id="status" name="status" value={entry.status} onChange={handleChange}
        style={{ width: '100%', padding: '8px', marginBottom: '10px', borderRadius: '4px', border: '1px solid #ccc' }}>
        <option value="active">Active</option>
        <option value="planned">Planned</option>
        <option value="prn">PRN (As Needed)</option>
        <option value="not-taking">Not Taking</option>
      </select>

      <Input label="Purpose" id="purpose" name="purpose" value={entry.purpose} onChange={handleChange} required />
      <Input label="Prescriber" id="prescriber" name="prescriber" value={entry.prescriber || ''} onChange={handleChange} />

      <label htmlFor="interactionNotes">Interaction Notes</label>
      <textarea id="interactionNotes" name="interactionNotes" value={entry.interactionNotes || ''} onChange={handleChange}
        style={{ width: '100%', minHeight: '80px', marginBottom: '10px' }} />

      <label htmlFor="depletionNotes">Depletion Notes</label>
      <textarea id="depletionNotes" name="depletionNotes" value={entry.depletionNotes || ''} onChange={handleChange}
        style={{ width: '100%', minHeight: '80px', marginBottom: '10px' }} />

      <Input label="Start Date" id="startDate" name="startDate" value={entry.startDate || ''} onChange={handleChange} />

      <label htmlFor="notes">Notes</label>
      <textarea id="notes" name="notes" value={entry.notes || ''} onChange={handleChange}
        style={{ width: '100%', minHeight: '80px', marginBottom: '10px' }} />

      <Button type="submit" disabled={isLoading}>
        {isLoading ? 'Saving...' : 'Save Medication'}
      </Button>
      <Button type="button" onClick={onCancel}>Cancel</Button>
    </form>
  );
};

export default MedicationForm;
