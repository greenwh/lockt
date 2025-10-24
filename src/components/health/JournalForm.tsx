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
    setEntry((prev) => ({ ...prev, date: new Date(value).getTime() }));
  };

  const validatePainLevel = (level: number): { isValid: boolean; error?: string } => {
    const numLevel = Number(level);
    if (isNaN(numLevel)) {
      return { isValid: false, error: 'Pain level must be a number' };
    }
    if (numLevel < 0 || numLevel > 10) {
      return { isValid: false, error: 'Pain level must be between 0 and 10' };
    }
    return { isValid: true };
  };

  const handleBlur = (fieldName: string) => {
    if (fieldName === 'painLevel') {
      const result = validatePainLevel(entry.painLevel);
      if (!result.isValid && result.error) {
        setErrors((prev) => ({ ...prev, [fieldName]: result.error! }));
      } else {
        setErrors((prev) => {
          const newErrors = { ...prev };
          delete newErrors[fieldName];
          return newErrors;
        });
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate pain level
    const newErrors: Record<string, string> = {};
    const painLevelResult = validatePainLevel(entry.painLevel);
    if (!painLevelResult.isValid && painLevelResult.error) {
      newErrors.painLevel = painLevelResult.error;
    }

    // If there are errors, don't submit
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setIsLoading(true);
    try {
      const now = Date.now();
      const finalEntry: HealthJournalEntry = {
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
      <Input label="Date" id="date" name="date" type="date" value={new Date(entry.date).toISOString().split('T')[0]} onChange={handleDateChange} required />
      <Input label="Reason for Entry" id="reasonForEntry" name="reasonForEntry" value={entry.reasonForEntry} onChange={handleChange} required />
      <Input
        label="Pain Level (0-10)"
        id="painLevel"
        name="painLevel"
        type="number"
        min="0"
        max="10"
        value={entry.painLevel}
        onChange={handleChange}
        onBlur={() => handleBlur('painLevel')}
        error={errors.painLevel}
        required
      />
      <label htmlFor="entry">Journal Entry</label>
      <textarea id="entry" name="entry" value={entry.entry} onChange={handleChange} style={{ width: '100%', minHeight: '150px' }} required />
      <Button type="submit" disabled={isLoading}>
        {isLoading ? 'Saving...' : 'Save Journal Entry'}
      </Button>
      <Button type="button" onClick={onCancel}>Cancel</Button>
    </form>
  );
};

export default JournalForm;
