// src/components/passwords/PasswordForm.tsx
import React, { useState } from 'react';
import type { PasswordEntry } from '../../types/data.types';
import Button from '../common/Button';
import Input from '../common/Input';
import { v4 as uuidv4 } from 'uuid';
import {
  validateEmail,
  validatePhone,
  validateURL,
  validateAccountNumber,
  validateRoutingNumber,
} from '../../utils/validation';

interface PasswordFormProps {
  onSave: (entry: PasswordEntry) => void;
  onCancel: () => void;
  existingEntry?: PasswordEntry;
}

const PasswordForm: React.FC<PasswordFormProps> = ({ onSave, onCancel, existingEntry }) => {
  const [entry, setEntry] = useState<Omit<PasswordEntry, 'id' | 'createdAt' | 'updatedAt'>>(
    existingEntry || {
      account: '',
      username: '',
      password: '',
      pin: '',
      accountNumber: '',
      routingNumber: '',
      email: '',
      phone: '',
      fax: '',
      mailingAddress: '',
      url: '',
      notes: '',
      tags: [],
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

  const handleTagsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { value } = e.target;
    setEntry((prev) => ({ ...prev, tags: value.split(',').map(tag => tag.trim()) }));
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
      case 'url':
        result = validateURL(value || '');
        break;
      case 'accountNumber':
        result = validateAccountNumber(value || '');
        break;
      case 'routingNumber':
        result = validateRoutingNumber(value || '');
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

    // Validate URL
    if (entry.url) {
      const urlResult = validateURL(entry.url);
      if (!urlResult.isValid && urlResult.error) {
        newErrors.url = urlResult.error;
      }
    }

    // Validate account number
    if (entry.accountNumber) {
      const accountResult = validateAccountNumber(entry.accountNumber);
      if (!accountResult.isValid && accountResult.error) {
        newErrors.accountNumber = accountResult.error;
      }
    }

    // Validate routing number
    if (entry.routingNumber) {
      const routingResult = validateRoutingNumber(entry.routingNumber);
      if (!routingResult.isValid && routingResult.error) {
        newErrors.routingNumber = routingResult.error;
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
      const finalEntry: PasswordEntry = {
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
      <Input label="Account" id="account" name="account" value={entry.account} onChange={handleChange} required />
      <Input label="Username" id="username" name="username" value={entry.username} onChange={handleChange} required />
      <Input label="Password" id="password" name="password" type="text" value={entry.password} onChange={handleChange} required />
      <Input label="PIN" id="pin" name="pin" type="text" value={entry.pin} onChange={handleChange} />
      <Input
        label="Account Number"
        id="accountNumber"
        name="accountNumber"
        value={entry.accountNumber}
        onChange={handleChange}
        onBlur={() => handleBlur('accountNumber')}
        error={errors.accountNumber}
      />
      <Input
        label="Routing Number"
        id="routingNumber"
        name="routingNumber"
        value={entry.routingNumber}
        onChange={handleChange}
        onBlur={() => handleBlur('routingNumber')}
        error={errors.routingNumber}
      />
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
      <Input label="Fax" id="fax" name="fax" type="tel" value={entry.fax} onChange={handleChange} />
      <Input label="Mailing Address" id="mailingAddress" name="mailingAddress" value={entry.mailingAddress} onChange={handleChange} />
      <Input
        label="URL"
        id="url"
        name="url"
        value={entry.url}
        onChange={handleChange}
        onBlur={() => handleBlur('url')}
        error={errors.url}
      />
      <Input label="Notes" id="notes" name="notes" value={entry.notes} onChange={handleChange} />
      <Input label="Tags (comma-separated)" id="tags" name="tags" value={entry.tags?.join(', ')} onChange={handleTagsChange} />
      <Button type="submit" disabled={isLoading}>
        {isLoading ? 'Saving...' : 'Save'}
      </Button>
      <Button type="button" onClick={onCancel}>Cancel</Button>
    </form>
  );
};

export default PasswordForm;
