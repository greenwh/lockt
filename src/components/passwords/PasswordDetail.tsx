// src/components/passwords/PasswordDetail.tsx
import React from 'react';
import type { PasswordEntry } from '../../types/data.types';
import Button from '../common/Button';

interface PasswordDetailProps {
  entry: PasswordEntry;
  onClose: () => void;
  onEdit: (entry: PasswordEntry) => void;
}

const PasswordDetail: React.FC<PasswordDetailProps> = ({ entry, onClose, onEdit }) => {
  return (
    <div>
      <h2>{entry.account}</h2>
      <p><strong>Username:</strong> {entry.username}</p>
      <p><strong>Password:</strong> {entry.password}</p>
      <p><strong>PIN:</strong> {entry.pin}</p>
      <p><strong>Account Number:</strong> {entry.accountNumber}</p>
      <p><strong>Routing Number:</strong> {entry.routingNumber}</p>
      <p><strong>Email:</strong> {entry.email}</p>
      <p><strong>Phone:</strong> {entry.phone}</p>
      <p><strong>Fax:</strong> {entry.fax}</p>
      <p><strong>Mailing Address:</strong> {entry.mailingAddress}</p>
      <p><strong>URL:</strong> {entry.url}</p>
      <p><strong>Notes:</strong> {entry.notes}</p>
      <p><strong>Tags:</strong> {entry.tags?.join(', ')}</p>
      <Button onClick={() => onEdit(entry)}>Edit</Button>
      <Button onClick={onClose}>Close</Button>
    </div>
  );
};

export default PasswordDetail;
