// src/components/health/ConditionList.tsx
import React, { useState } from 'react';
import type { HealthCondition } from '../../types/data.types';
import Button from '../common/Button';
import ConditionForm from './ConditionForm';
import ConditionQuickView from './ConditionQuickView';
import ConditionDetail from './ConditionDetail';

interface ConditionListProps {
  entries: HealthCondition[];
  setEntries: React.Dispatch<React.SetStateAction<HealthCondition[]>>;
}

const ConditionList: React.FC<ConditionListProps> = ({ entries, setEntries }) => {
  const [selectedEntry, setSelectedEntry] = useState<HealthCondition | null>(null);
  const [editingEntry, setEditingEntry] = useState<HealthCondition | undefined>(undefined);
  const [isCreating, setIsCreating] = useState(false);

  const handleSave = (entry: HealthCondition) => {
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

  const handleSelect = (entry: HealthCondition) => {
    setSelectedEntry(entry);
  };

  const handleCloseDetail = () => {
    setSelectedEntry(null);
  };

  const handleEdit = (entry: HealthCondition) => {
    setSelectedEntry(null);
    setEditingEntry(entry);
  };

  if (selectedEntry) {
    return <ConditionDetail entry={selectedEntry} onClose={handleCloseDetail} onEdit={handleEdit} />;
  }

  if (isCreating || editingEntry) {
    return (
      <ConditionForm
        onSave={handleSave}
        onCancel={handleCancel}
        existingEntry={editingEntry}
      />
    );
  }

  return (
    <div>
      <h4>Conditions</h4>
      <Button onClick={() => setIsCreating(true)}>Add New Condition</Button>
      <div>
        {entries.map((entry) => (
          <ConditionQuickView key={entry.id} entry={entry} onSelect={handleSelect} />
        ))}
      </div>
    </div>
  );
};

export default ConditionList;
