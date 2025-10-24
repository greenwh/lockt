// src/components/health/JournalList.tsx
import React, { useState } from 'react';
import { useData } from '../../context/DataContext';
import type { HealthJournalEntry } from '../../types/data.types';
import Button from '../common/Button';
import JournalForm from './JournalForm';
import JournalQuickView from './JournalQuickView';
import JournalDetail from './JournalDetail';

const JournalList: React.FC = () => {
  const { appData, updateHealthData } = useData();
  const [selectedEntry, setSelectedEntry] = useState<HealthJournalEntry | null>(null);
  const [editingEntry, setEditingEntry] = useState<HealthJournalEntry | undefined>(undefined);
  const [isCreating, setIsCreating] = useState(false);

  const handleSave = (entry: HealthJournalEntry) => {
    const journal = appData.health.journal;
    const existingIndex = journal.findIndex((j) => j.id === entry.id);
    let newJournal;
    if (existingIndex > -1) {
        newJournal = [...journal];
        newJournal[existingIndex] = entry;
    } else {
        newJournal = [...journal, entry];
    }
    updateHealthData({ journal: newJournal });

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
      <h4>Health Journal</h4>
      <Button onClick={() => setIsCreating(true)}>Add New Journal Entry</Button>
      <div>
        {appData.health.journal.sort((a, b) => b.date - a.date).map((entry) => (
          <JournalQuickView key={entry.id} entry={entry} onSelect={handleSelect} />
        ))}
      </div>
    </div>
  );
};

export default JournalList;