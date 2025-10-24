// src/components/crypto/CryptoForm.tsx
import React, { useState } from 'react';
import type { CryptoEntry } from '../../types/data.types';
import Button from '../common/Button';
import Input from '../common/Input';
import { v4 as uuidv4 } from 'uuid';
import {
  validateEmail,
  validatePhone,
  validateWalletAddress,
  validateAccountNumber,
  validateRoutingNumber,
} from '../../utils/validation';

interface CryptoFormProps {
  onSave: (entry: CryptoEntry) => void;
  onCancel: () => void;
  existingEntry?: CryptoEntry;
}

const CryptoForm: React.FC<CryptoFormProps> = ({ onSave, onCancel, existingEntry }) => {
  const [entry, setEntry] = useState<Omit<CryptoEntry, 'id' | 'createdAt' | 'updatedAt'>>(
    existingEntry || {
      account: '',
      username: '',
      password: '',
      pin: '',
      accountNumber: '',
      routingNumber: '',
      recoveryPhrase: '',
      email: '',
      phone: '',
      fax: '',
      walletAddressEth: '',
      walletAddressBtc: '',
      walletAddressSol: '',
      walletAddressOther: '',
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
      case 'accountNumber':
        result = validateAccountNumber(value || '');
        break;
      case 'routingNumber':
        result = validateRoutingNumber(value || '');
        break;
      case 'walletAddressEth':
        result = validateWalletAddress(value || '', 'ETH');
        break;
      case 'walletAddressBtc':
        result = validateWalletAddress(value || '', 'BTC');
        break;
      case 'walletAddressSol':
        result = validateWalletAddress(value || '', 'SOL');
        break;
      case 'walletAddressOther':
        result = validateWalletAddress(value || '', 'Other');
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

    if (entry.accountNumber) {
      const accountResult = validateAccountNumber(entry.accountNumber);
      if (!accountResult.isValid && accountResult.error) {
        newErrors.accountNumber = accountResult.error;
      }
    }

    if (entry.routingNumber) {
      const routingResult = validateRoutingNumber(entry.routingNumber);
      if (!routingResult.isValid && routingResult.error) {
        newErrors.routingNumber = routingResult.error;
      }
    }

    if (entry.walletAddressEth) {
      const ethResult = validateWalletAddress(entry.walletAddressEth, 'ETH');
      if (!ethResult.isValid && ethResult.error) {
        newErrors.walletAddressEth = ethResult.error;
      }
    }

    if (entry.walletAddressBtc) {
      const btcResult = validateWalletAddress(entry.walletAddressBtc, 'BTC');
      if (!btcResult.isValid && btcResult.error) {
        newErrors.walletAddressBtc = btcResult.error;
      }
    }

    if (entry.walletAddressSol) {
      const solResult = validateWalletAddress(entry.walletAddressSol, 'SOL');
      if (!solResult.isValid && solResult.error) {
        newErrors.walletAddressSol = solResult.error;
      }
    }

    if (entry.walletAddressOther) {
      const otherResult = validateWalletAddress(entry.walletAddressOther, 'Other');
      if (!otherResult.isValid && otherResult.error) {
        newErrors.walletAddressOther = otherResult.error;
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
      const finalEntry: CryptoEntry = {
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
      <Input label="Username" id="username" name="username" value={entry.username} onChange={handleChange} />
      <Input label="Password" id="password" name="password" type="text" value={entry.password} onChange={handleChange} />
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
      <Input label="Recovery Phrase" id="recoveryPhrase" name="recoveryPhrase" value={entry.recoveryPhrase} onChange={handleChange} />
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
      <Input
        label="ETH Wallet Address"
        id="walletAddressEth"
        name="walletAddressEth"
        value={entry.walletAddressEth}
        onChange={handleChange}
        onBlur={() => handleBlur('walletAddressEth')}
        error={errors.walletAddressEth}
      />
      <Input
        label="BTC Wallet Address"
        id="walletAddressBtc"
        name="walletAddressBtc"
        value={entry.walletAddressBtc}
        onChange={handleChange}
        onBlur={() => handleBlur('walletAddressBtc')}
        error={errors.walletAddressBtc}
      />
      <Input
        label="SOL Wallet Address"
        id="walletAddressSol"
        name="walletAddressSol"
        value={entry.walletAddressSol}
        onChange={handleChange}
        onBlur={() => handleBlur('walletAddressSol')}
        error={errors.walletAddressSol}
      />
      <Input
        label="Other Wallet Address"
        id="walletAddressOther"
        name="walletAddressOther"
        value={entry.walletAddressOther}
        onChange={handleChange}
        onBlur={() => handleBlur('walletAddressOther')}
        error={errors.walletAddressOther}
      />
      <Button type="submit" disabled={isLoading}>
        {isLoading ? 'Saving...' : 'Save'}
      </Button>
      <Button type="button" onClick={onCancel}>Cancel</Button>
    </form>
  );
};

export default CryptoForm;
