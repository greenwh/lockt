// src/components/credit-cards/CreditCardForm.tsx
import React, { useState } from 'react';
import type { CreditCardEntry } from '../../types/data.types';
import Button from '../common/Button';
import Input from '../common/Input';

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
            url: '',
            notes: '',
        }
    );

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setEntry(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const now = Date.now();
        const id = existingEntry?.id || ''; // ID will be generated in context if new
        onSave({ ...entry, id, createdAt: existingEntry?.createdAt || now, updatedAt: now });
    };

    return (
        <form onSubmit={handleSubmit}>
            <h3>{existingEntry ? 'Edit' : 'Add'} Credit Card</h3>
            <Input id="accountName" name="accountName" label="Account Name" value={entry.accountName} onChange={handleChange} required />
            <Input id="cardNumber" name="cardNumber" label="Card Number" value={entry.cardNumber} onChange={handleChange} required />
            <Input id="expirationDate" name="expirationDate" label="Expiration (MM/YY)" value={entry.expirationDate} onChange={handleChange} required />
            <Input id="cscCode" name="cscCode" label="CSC" value={entry.cscCode} onChange={handleChange} required />
            <Input id="email" name="email" label="Email" value={entry.email || ''} onChange={handleChange} />
            <Input id="phone" name="phone" label="Phone" value={entry.phone || ''} onChange={handleChange} />
            <Input id="url" name="url" label="URL" value={entry.url || ''} onChange={handleChange} />
            <Input id="notes" name="notes" label="Notes" value={entry.notes || ''} onChange={handleChange} />
            <Button type="submit">Save</Button>
            <Button type="button" onClick={onCancel} style={{ marginLeft: '10px' }}>Cancel</Button>
        </form>
    );
};

export default CreditCardForm;