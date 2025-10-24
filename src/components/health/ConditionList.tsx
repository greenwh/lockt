// src/components/health/ConditionList.tsx
import React, { useState } from 'react';
import { useData } from '../../context/DataContext';
import type { HealthCondition } from '../../types/data.types';
import Button from '../common/Button';
import ConditionForm from './ConditionForm';
import ConditionQuickView from './ConditionQuickView';
import ConditionDetail from './ConditionDetail';

const ConditionList: React.FC = () => {
  const { appData, updateHealthData } = useData();
  const [selectedEntry, setSelectedEntry] = useState<HealthCondition | null>(null);
  const [editingEntry, setEditingEntry] = useState<HealthCondition | undefined>(undefined);
  const [isCreating, setIsCreating] = useState(false);

  const handleSave = (entry: HealthCondition) => {
    const conditions = appData.health.conditions;
    const existingIndex = conditions.findIndex((c) => c.id === entry.id);
    let newConditions;
    if (existingIndex > -1) {
        newConditions = [...conditions];
        newConditions[existingIndex] = entry;
    } else {
        newConditions = [...conditions, entry];
    }
    updateHealthData({ conditions: newConditions });

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
      <h4>Health Conditions</h4>
      <Button onClick={() => setIsCreating(true)}>Add New Condition</Button>
      <div>
        {appData.health.conditions.map((entry) => (
          <ConditionQuickView key={entry.id} entry={entry} onSelect={handleSelect} />
        ))}
      </div>
    </div>
  );
};

export default ConditionList;