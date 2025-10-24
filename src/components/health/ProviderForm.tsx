// src/components/health/ProviderForm.tsx
import React, { useState } from 'react';
import type { HealthProvider } from '../../types/data.types';
import Button from '../common/Button';
import Input from '../common/Input';
import { v4 as uuidv4 } from 'uuid';
import { validateEmail, validatePhone } from '../../utils/validation';

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

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
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

  const handleBlur = (fieldName: string) => {
    const value = entry[fieldName as keyof typeof entry] as string;

    let result;
    switch (fieldName) {
      case 'email':
        result = validateEmail(value || '');
        break;
      case 'phone':
        result = validatePhone(value || '');
        break;
      case 'fax':
        result = validatePhone(value || '');
        break;
      default:
        return;
    }

    if (!result.isValid && result.error) {
      setErrors((prev) => ({ ...prev, [fieldName]: result.error! }));
    } else {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[fieldName];
        return newErrors;
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate all fields
    const newErrors: Record<string, string> = {};

    // Validate email
    if (entry.email) {
      const emailResult = validateEmail(entry.email);
      if (!emailResult.isValid && emailResult.error) {
        newErrors.email = emailResult.error;
      }
    }

    // Validate phone
    if (entry.phone) {
      const phoneResult = validatePhone(entry.phone);
      if (!phoneResult.isValid && phoneResult.error) {
        newErrors.phone = phoneResult.error;
      }
    }

    // Validate fax
    if (entry.fax) {
      const faxResult = validatePhone(entry.fax);
      if (!faxResult.isValid && faxResult.error) {
        newErrors.fax = faxResult.error;
      }
    }

    // If there are errors, don't submit
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setIsLoading(true);
    try {
      const now = Date.now();
      const finalEntry: HealthProvider = {
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
      <Input label="Doctor Name" id="drName" name="drName" value={entry.drName} onChange={handleChange} required />
      <Input label="Specialty" id="specialty" name="specialty" value={entry.specialty} onChange={handleChange} />
      <Input
        label="Email"
        id="email"
        name="email"
        type="email"
        value={entry.email}
        onChange={handleChange}
        onBlur={() => handleBlur('email')}
        error={errors.email}
      />
      <Input
        label="Phone"
        id="phone"
        name="phone"
        type="tel"
        value={entry.phone}
        onChange={handleChange}
        onBlur={() => handleBlur('phone')}
        error={errors.phone}
      />
      <Input
        label="Fax"
        id="fax"
        name="fax"
        type="tel"
        value={entry.fax}
        onChange={handleChange}
        onBlur={() => handleBlur('fax')}
        error={errors.fax}
      />
      <Input label="Account" id="account" name="account" value={entry.account} onChange={handleChange} />
      <Button type="submit" disabled={isLoading}>
        {isLoading ? 'Saving...' : 'Save Provider'}
      </Button>
      <Button type="button" onClick={onCancel}>Cancel</Button>
    </form>
  );
};

export default ProviderForm;
