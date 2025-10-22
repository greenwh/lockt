// src/components/credit-cards/CreditCardForm.tsx
import React, { useState } from 'react';
import type { CreditCardEntry } from '../../types/data.types';
import Button from '../common/Button';
import Input from '../common/Input';
import { v4 as uuidv4 } from 'uuid';

interface CreditCardFormProps {
  onSave: (entry: CreditCardEntry) => void;
  onCancel: () => void;
  existingEntry?: CreditCardEntry;
}

const CreditCardForm: React.FC<CreditCardFormProps> = ({ onSave, onCancel, existingEntry }) => {
  const [entry, setEntry] = useState<Omit<CreditCardEntry, 'id' | 'createdAt' | 'updatedAt'>>(
    existingEntry || {
      accountName: '',
      cardNumber: '',
      expirationDate: '',
      cscCode: '',
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
    const finalEntry: CreditCardEntry = {
      id: existingEntry?.id || uuidv4(),
      ...entry,
      createdAt: existingEntry?.createdAt || now,
      updatedAt: now,
    };
    onSave(finalEntry);
  };

  return (
    <form onSubmit={handleSubmit}>
      <Input label="Account Name" id="accountName" name="accountName" value={entry.accountName} onChange={handleChange} required />
      <Input label="Card Number" id="cardNumber" name="cardNumber" value={entry.cardNumber} onChange={handleChange} required />
      <Input label="Expiration Date (MM/YY)" id="expirationDate" name="expirationDate" value={entry.expirationDate} onChange={handleChange} required />
      <Input label="CSC Code" id="cscCode" name="cscCode" value={entry.cscCode} onChange={handleChange} required />
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

export default CreditCardForm;
