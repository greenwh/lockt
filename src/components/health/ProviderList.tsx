// src/components/health/ProviderList.tsx
import React, { useState } from 'react';
import type { HealthProvider } from '../../types/data.types';
import Button from '../common/Button';
import ProviderForm from './ProviderForm';
import ProviderQuickView from './ProviderQuickView';
import ProviderDetail from './ProviderDetail';

interface ProviderListProps {
  entries: HealthProvider[];
  setEntries: React.Dispatch<React.SetStateAction<HealthProvider[]>>;
}

const ProviderList: React.FC<ProviderListProps> = ({ entries, setEntries }) => {
  const [selectedEntry, setSelectedEntry] = useState<HealthProvider | null>(null);
  const [editingEntry, setEditingEntry] = useState<HealthProvider | undefined>(undefined);
  const [isCreating, setIsCreating] = useState(false);

  const handleSave = (entry: HealthProvider) => {
    setEntries((prev) => {
      const existingIndex = prev.findIndex((e) => e.id === entry.id);
      if (existingIndex > -1) {
        const newEntries = [...prev];
        newEntries[existingIndex] = entry;
        return newEntries;
      }
      return [...prev, entry];
    });
    setIsCreating(false);
    setEditingEntry(undefined);
    setSelectedEntry(entry);
  };

  const handleCancel = () => {
    setIsCreating(false);
    setEditingEntry(undefined);
  };

  const handleSelect = (entry: HealthProvider) => {
    setSelectedEntry(entry);
  };

  const handleCloseDetail = () => {
    setSelectedEntry(null);
  };

  const handleEdit = (entry: HealthProvider) => {
    setSelectedEntry(null);
    setEditingEntry(entry);
  };

  if (selectedEntry) {
    return <ProviderDetail entry={selectedEntry} onClose={handleCloseDetail} onEdit={handleEdit} />;
  }

  if (isCreating || editingEntry) {
    return (
      <ProviderForm
        onSave={handleSave}
        onCancel={handleCancel}
        existingEntry={editingEntry}
      />
    );
  }

  return (
    <div>
      <h4>Providers</h4>
      <Button onClick={() => setIsCreating(true)}>Add New Provider</Button>
      <div>
        {entries.map((entry) => (
          <ProviderQuickView key={entry.id} entry={entry} onSelect={handleSelect} />
        ))}
      </div>
    </div>
  );
};

export default ProviderList;
