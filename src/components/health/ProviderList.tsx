// src/components/health/ProviderList.tsx
import React, { useState } from 'react';
import { useData } from '../../context/DataContext';
import type { HealthProvider } from '../../types/data.types';
import Button from '../common/Button';
import ProviderForm from './ProviderForm';
import ProviderQuickView from './ProviderQuickView';
import ProviderDetail from './ProviderDetail';

const ProviderList: React.FC = () => {
  const { appData, updateHealthData } = useData();
  const [selectedEntry, setSelectedEntry] = useState<HealthProvider | null>(null);
  const [editingEntry, setEditingEntry] = useState<HealthProvider | undefined>(undefined);
  const [isCreating, setIsCreating] = useState(false);

  const handleSave = (entry: HealthProvider) => {
    const providers = appData.health.providers;
    const existingIndex = providers.findIndex((p) => p.id === entry.id);
    let newProviders;
    if (existingIndex > -1) {
        newProviders = [...providers];
        newProviders[existingIndex] = entry;
    } else {
        newProviders = [...providers, entry];
    }
    updateHealthData({ providers: newProviders });

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
      <h4>Health Providers</h4>
      <Button onClick={() => setIsCreating(true)}>Add New Provider</Button>
      <div>
        {appData.health.providers.map((entry) => (
          <ProviderQuickView key={entry.id} entry={entry} onSelect={handleSelect} />
        ))}
      </div>
    </div>
  );
};

export default ProviderList;