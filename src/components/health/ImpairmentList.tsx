// src/components/health/ImpairmentList.tsx
import React, { useState } from 'react';
import { useData } from '../../context/DataContext';
import type { HealthImpairment } from '../../types/data.types';
import Button from '../common/Button';
import ImpairmentForm from './ImpairmentForm';
import ImpairmentQuickView from './ImpairmentQuickView';
import ImpairmentDetail from './ImpairmentDetail';

const ImpairmentList: React.FC = () => {
  const { appData, updateHealthData } = useData();
  const [selectedEntry, setSelectedEntry] = useState<HealthImpairment | null>(null);
  const [editingEntry, setEditingEntry] = useState<HealthImpairment | undefined>(undefined);
  const [isCreating, setIsCreating] = useState(false);

  const handleSave = (entry: HealthImpairment) => {
    const impairments = appData.health.impairments;
    const existingIndex = impairments.findIndex((i) => i.id === entry.id);
    let newImpairments;
    if (existingIndex > -1) {
        newImpairments = [...impairments];
        newImpairments[existingIndex] = entry;
    } else {
        newImpairments = [...impairments, entry];
    }
    updateHealthData({ impairments: newImpairments });

    setIsCreating(false);
    setEditingEntry(undefined);
    setSelectedEntry(entry);
  };

  const handleCancel = () => {
    setIsCreating(false);
    setEditingEntry(undefined);
  };

  const handleSelect = (entry: HealthImpairment) => {
    setSelectedEntry(entry);
  };

  const handleCloseDetail = () => {
    setSelectedEntry(null);
  };

  const handleEdit = (entry: HealthImpairment) => {
    setSelectedEntry(null);
    setEditingEntry(entry);
  };

  if (selectedEntry) {
    return <ImpairmentDetail entry={selectedEntry} onClose={handleCloseDetail} onEdit={handleEdit} />;
  }

  if (isCreating || editingEntry) {
    return (
      <ImpairmentForm
        onSave={handleSave}
        onCancel={handleCancel}
        existingEntry={editingEntry}
      />
    );
  }

  return (
    <div>
      <h4>Health Impairments</h4>
      <Button onClick={() => setIsCreating(true)}>Add New Impairment</Button>
      <div>
        {appData.health.impairments.map((entry) => (
          <ImpairmentQuickView key={entry.id} entry={entry} onSelect={handleSelect} />
        ))}
      </div>
    </div>
  );
};

export default ImpairmentList;