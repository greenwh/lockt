// src/components/health/ProviderDetail.tsx
import React from 'react';
import type { HealthProvider } from '../../types/data.types';
import Button from '../common/Button';

interface ProviderDetailProps {
  entry: HealthProvider;
  onClose: () => void;
  onEdit: (entry: HealthProvider) => void;
}

const ProviderDetail: React.FC<ProviderDetailProps> = ({ entry, onClose, onEdit }) => {
  return (
    <div>
      <h3>{entry.drName}</h3>
      <p><strong>Specialty:</strong> {entry.specialty}</p>
      <p><strong>Email:</strong> {entry.email}</p>
      <p><strong>Phone:</strong> {entry.phone}</p>
      <p><strong>Fax:</strong> {entry.fax}</p>
      <p><strong>Account:</strong> {entry.account}</p>
      <Button onClick={() => onEdit(entry)}>Edit</Button>
      <Button onClick={onClose}>Close</Button>
    </div>
  );
};

export default ProviderDetail;
