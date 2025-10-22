// src/components/freetext/FreetextForm.tsx
import React, { useState } from 'react';
import type { FreetextEntry } from '../../types/data.types';
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
      // Initialize other optional fields if needed
    }
  );

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setEntry((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const now = Date.now();
    const finalEntry: FreetextEntry = {
      id: existingEntry?.id || uuidv4(),
      ...entry,
      createdAt: existingEntry?.createdAt || now,
      updatedAt: now,
    };
    onSave(finalEntry);
  };

  return (
    <form onSubmit={handleSubmit}>
      <Input label="Title" id="title" name="title" value={entry.title} onChange={handleChange} required />
      <Input label="Description" id="description" name="description" value={entry.description} onChange={handleChange} />
      <label htmlFor="content">Content</label>
      <textarea id="content" name="content" value={entry.content} onChange={handleChange} style={{ width: '100%', minHeight: '150px' }} />
      {/* Add other fields from FreetextEntry as needed */}
      <Button type="submit">Save</Button>
      <Button type="button" onClick={onCancel}>Cancel</Button>
    </form>
  );
};

export default FreetextForm;
