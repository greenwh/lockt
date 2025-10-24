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
      dateOfDiagnosis: Date.now(),
      diagnosingDoctorOrAgency: '',
      symptomology: '',
    }
  );

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setEntry((prev) => ({ ...prev, [name]: value }));

    // Clear error when user types
    if (errors[name]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { value } = e.target;
    setEntry((prev) => ({ ...prev, dateOfDiagnosis: new Date(value).getTime() }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    setIsLoading(true);
    try {
      const now = Date.now();
      const finalEntry: HealthCondition = {
        id: existingEntry?.id || uuidv4(),
        ...entry,
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
      <Input label="Condition" id="condition" name="condition" value={entry.condition} onChange={handleChange} required />
      <Input label="Date of Diagnosis" id="dateOfDiagnosis" name="dateOfDiagnosis" type="date" value={entry.dateOfDiagnosis ? new Date(entry.dateOfDiagnosis).toISOString().split('T')[0] : ''} onChange={handleDateChange} />
      <Input label="Diagnosing Doctor/Agency" id="diagnosingDoctorOrAgency" name="diagnosingDoctorOrAgency" value={entry.diagnosingDoctorOrAgency} onChange={handleChange} />
      <label htmlFor="symptomology">Symptomology</label>
      <textarea id="symptomology" name="symptomology" value={entry.symptomology} onChange={handleChange} style={{ width: '100%', minHeight: '100px' }} />
      <Button type="submit" disabled={isLoading}>
        {isLoading ? 'Saving...' : 'Save Condition'}
      </Button>
      <Button type="button" onClick={onCancel}>Cancel</Button>
    </form>
  );
};

export default ConditionForm;
