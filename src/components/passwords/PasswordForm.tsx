// src/components/passwords/PasswordForm.tsx
import React, { useState } from 'react';
import type { PasswordEntry } from '../../types/data.types';
import Button from '../common/Button';
import Input from '../common/Input';
import { v4 as uuidv4 } from 'uuid';

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

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setEntry((prev) => ({ ...prev, [name]: value }));
  };

  const handleTagsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { value } = e.target;
    setEntry((prev) => ({ ...prev, tags: value.split(',').map(tag => tag.trim()) }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const now = Date.now();
    const finalEntry: PasswordEntry = {
      id: existingEntry?.id || uuidv4(),
      ...entry,
      createdAt: existingEntry?.createdAt || now,
      updatedAt: now,
    };
    onSave(finalEntry);
  };

  return (
    <form onSubmit={handleSubmit}>
      <Input label="Account" id="account" name="account" value={entry.account} onChange={handleChange} required />
      <Input label="Username" id="username" name="username" value={entry.username} onChange={handleChange} required />
      <Input label="Password" id="password" name="password" type="text" value={entry.password} onChange={handleChange} required />
      <Input label="PIN" id="pin" name="pin" type="text" value={entry.pin} onChange={handleChange} />
      <Input label="Account Number" id="accountNumber" name="accountNumber" value={entry.accountNumber} onChange={handleChange} />
      <Input label="Routing Number" id="routingNumber" name="routingNumber" value={entry.routingNumber} onChange={handleChange} />
      <Input label="Email" id="email" name="email" type="email" value={entry.email} onChange={handleChange} />
      <Input label="Phone" id="phone" name="phone" type="tel" value={entry.phone} onChange={handleChange} />
      <Input label="Fax" id="fax" name="fax" type="tel" value={entry.fax} onChange={handleChange} />
      <Input label="Mailing Address" id="mailingAddress" name="mailingAddress" value={entry.mailingAddress} onChange={handleChange} />
      <Input label="URL" id="url" name="url" value={entry.url} onChange={handleChange} />
      <Input label="Notes" id="notes" name="notes" value={entry.notes} onChange={handleChange} />
      <Input label="Tags (comma-separated)" id="tags" name="tags" value={entry.tags?.join(', ')} onChange={handleTagsChange} />
      <Button type="submit">Save</Button>
      <Button type="button" onClick={onCancel}>Cancel</Button>
    </form>
  );
};

export default PasswordForm;
