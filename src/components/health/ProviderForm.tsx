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
    setEntry((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const now = Date.now();
    const finalEntry: HealthProvider = {
      id: existingEntry?.id || uuidv4(),
      ...entry,
      createdAt: existingEntry?.createdAt || now,
      updatedAt: now,
    };
    onSave(finalEntry);
  };

  return (
    <form onSubmit={handleSubmit}>
      <Input label="Doctor Name" id="drName" name="drName" value={entry.drName} onChange={handleChange} required />
      <Input label="Specialty" id="specialty" name="specialty" value={entry.specialty} onChange={handleChange} />
      <Input label="Email" id="email" name="email" type="email" value={entry.email} onChange={handleChange} />
      <Input label="Phone" id="phone" name="phone" type="tel" value={entry.phone} onChange={handleChange} />
      <Input label="Fax" id="fax" name="fax" type="tel" value={entry.fax} onChange={handleChange} />
      <Input label="Account" id="account" name="account" value={entry.account} onChange={handleChange} />
      <Button type="submit">Save Provider</Button>
      <Button type="button" onClick={onCancel}>Cancel</Button>
    </form>
  );
};

export default ProviderForm;
