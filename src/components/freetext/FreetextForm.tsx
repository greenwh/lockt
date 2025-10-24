// src/components/freetext/FreetextForm.tsx
import React, { useState } from 'react';
import type { FreetextEntry } from '../../types/data.types';
import Button from '../common/Button';
import Input from '../common/Input';
import { v4 as uuidv4 } from 'uuid';
import {
  validateEmail,
  validatePhone,
  validateURL,
} from '../../utils/validation';

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
      email: '',
      phone: '',
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

    // Validate optional fields
    if (entry.email) {
      const emailResult = validateEmail(entry.email);
      if (!emailResult.isValid && emailResult.error) {
        newErrors.email = emailResult.error;
      }
    }

    if (entry.phone) {
      const phoneResult = validatePhone(entry.phone);
      if (!phoneResult.isValid && phoneResult.error) {
        newErrors.phone = phoneResult.error;
      }
    }

    if (entry.url) {
      const urlResult = validateURL(entry.url);
      if (!urlResult.isValid && urlResult.error) {
        newErrors.url = urlResult.error;
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
      const finalEntry: FreetextEntry = {
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

  const handleTagsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { value } = e.target;
    setEntry((prev) => ({ ...prev, tags: value.split(',').map(tag => tag.trim()) }));
  };

  return (
    <form onSubmit={handleSubmit}>
      <Input label="Title" id="title" name="title" value={entry.title} onChange={handleChange} required />
      <Input label="Description" id="description" name="description" value={entry.description} onChange={handleChange} />
      <label htmlFor="content">Content</label>
      <textarea id="content" name="content" value={entry.content} onChange={handleChange} style={{ width: '100%', minHeight: '150px' }} />
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

export default FreetextForm;
