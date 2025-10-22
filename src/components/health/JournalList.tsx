// src/components/health/JournalList.tsx
import React, { useState } from 'react';
import type { HealthJournalEntry } from '../../types/data.types';
import Button from '../common/Button';
import JournalForm from './JournalForm';
import JournalQuickView from './JournalQuickView';
import JournalDetail from './JournalDetail';

interface JournalListProps {
  entries: HealthJournalEntry[];
  setEntries: React.Dispatch<React.SetStateAction<HealthJournalEntry[]>>;
}

const JournalList: React.FC<JournalListProps> = ({ entries, setEntries }) => {
  const [selectedEntry, setSelectedEntry] = useState<HealthJournalEntry | null>(null);
  const [editingEntry, setEditingEntry] = useState<HealthJournalEntry | undefined>(undefined);
  const [isCreating, setIsCreating] = useState(false);

  const handleSave = (entry: HealthJournalEntry) => {
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

  const handleSelect = (entry: HealthJournalEntry) => {
    setSelectedEntry(entry);
  };

  const handleCloseDetail = () => {
    setSelectedEntry(null);
  };

  const handleEdit = (entry: HealthJournalEntry) => {
    setSelectedEntry(null);
    setEditingEntry(entry);
  };

  if (selectedEntry) {
    return <JournalDetail entry={selectedEntry} onClose={handleCloseDetail} onEdit={handleEdit} />;
  }

  if (isCreating || editingEntry) {
    return (
      <JournalForm
        onSave={handleSave}
        onCancel={handleCancel}
        existingEntry={editingEntry}
      />
    );
  }

  return (
    <div>
      <h4>Journal</h4>
      <Button onClick={() => setIsCreating(true)}>Add New Journal Entry</Button>
      <div>
        {entries.map((entry) => (
          <JournalQuickView key={entry.id} entry={entry} onSelect={handleSelect} />
        ))}
      </div>
    </div>
  );
};

export default JournalList;
