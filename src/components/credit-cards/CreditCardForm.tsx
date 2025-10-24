// src/components/credit-cards/CreditCardForm.tsx
import React, { useState } from 'react';
import type { CreditCardEntry } from '../../types/data.types';
import Button from '../common/Button';
import Input from '../common/Input';
import { v4 as uuidv4 } from 'uuid';
import {
  validateCreditCardNumber,
  validateExpirationDate,
  validateCSC,
  validateEmail,
  validatePhone,
  validateURL,
} from '../../utils/validation';

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
      case 'cardNumber':
        result = validateCreditCardNumber(value || '');
        break;
      case 'expirationDate':
        result = validateExpirationDate(value || '');
        break;
      case 'cscCode':
        result = validateCSC(value || '');
        break;
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

    // Validate required fields
    const cardNumberResult = validateCreditCardNumber(entry.cardNumber);
    if (!cardNumberResult.isValid && cardNumberResult.error) {
      newErrors.cardNumber = cardNumberResult.error;
    }

    const expirationResult = validateExpirationDate(entry.expirationDate);
    if (!expirationResult.isValid && expirationResult.error) {
      newErrors.expirationDate = expirationResult.error;
    }

    const cscResult = validateCSC(entry.cscCode);
    if (!cscResult.isValid && cscResult.error) {
      newErrors.cscCode = cscResult.error;
    }

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
      const finalEntry: CreditCardEntry = {
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
      <Input label="Account Name" id="accountName" name="accountName" value={entry.accountName} onChange={handleChange} required />
      <Input
        label="Card Number"
        id="cardNumber"
        name="cardNumber"
        value={entry.cardNumber}
        onChange={handleChange}
        onBlur={() => handleBlur('cardNumber')}
        error={errors.cardNumber}
        required
      />
      <Input
        label="Expiration Date (MM/YY)"
        id="expirationDate"
        name="expirationDate"
        value={entry.expirationDate}
        onChange={handleChange}
        onBlur={() => handleBlur('expirationDate')}
        error={errors.expirationDate}
        required
      />
      <Input
        label="CSC Code"
        id="cscCode"
        name="cscCode"
        value={entry.cscCode}
        onChange={handleChange}
        onBlur={() => handleBlur('cscCode')}
        error={errors.cscCode}
        required
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

export default CreditCardForm;
