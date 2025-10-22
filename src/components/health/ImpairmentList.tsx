// src/components/health/ImpairmentList.tsx
import React, { useState } from 'react';
import type { HealthImpairment, HealthCondition } from '../../types/data.types';
import Button from '../common/Button';
import ImpairmentForm from './ImpairmentForm';
import ImpairmentQuickView from './ImpairmentQuickView';
import ImpairmentDetail from './ImpairmentDetail';

interface ImpairmentListProps {
  entries: HealthImpairment[];
  setEntries: React.Dispatch<React.SetStateAction<HealthImpairment[]>>;
  conditions: HealthCondition[]; // Passed from parent
}

const ImpairmentList: React.FC<ImpairmentListProps> = ({ entries, setEntries, conditions }) => {
  const [selectedEntry, setSelectedEntry] = useState<HealthImpairment | null>(null);
  const [editingEntry, setEditingEntry] = useState<HealthImpairment | undefined>(undefined);
  const [isCreating, setIsCreating] = useState(false);

  const handleSave = (entry: HealthImpairment) => {
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
    return <ImpairmentDetail entry={selectedEntry} conditions={conditions} onClose={handleCloseDetail} onEdit={handleEdit} />;
  }

  if (isCreating || editingEntry) {
    return (
      <ImpairmentForm
        onSave={handleSave}
        onCancel={handleCancel}
        existingEntry={editingEntry}
        conditions={conditions}
      />
    );
  }

  return (
    <div>
      <h4>Impairments</h4>
      <Button onClick={() => setIsCreating(true)}>Add New Impairment</Button>
      <div>
        {entries.map((entry) => (
          <ImpairmentQuickView key={entry.id} entry={entry} onSelect={handleSelect} />
        ))}
      </div>
    </div>
  );
};

export default ImpairmentList;
