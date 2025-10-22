// src/components/freetext/FreetextList.tsx
import React, { useState } from 'react';
import type { FreetextEntry } from '../../types/data.types';
import Button from '../common/Button';
import FreetextForm from './FreetextForm';
import FreetextQuickView from './FreetextQuickView';
import FreetextDetail from './FreetextDetail';

const FreetextList: React.FC = () => {
  const [entries, setEntries] = useState<FreetextEntry[]>([]);
  const [selectedEntry, setSelectedEntry] = useState<FreetextEntry | null>(null);
  const [editingEntry, setEditingEntry] = useState<FreetextEntry | undefined>(undefined);
  const [isCreating, setIsCreating] = useState(false);

  const handleSave = (entry: FreetextEntry) => {
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

  const handleSelect = (entry: FreetextEntry) => {
    setSelectedEntry(entry);
  };

  const handleCloseDetail = () => {
    setSelectedEntry(null);
  };

  const handleEdit = (entry: FreetextEntry) => {
    setSelectedEntry(null);
    setEditingEntry(entry);
  };

  if (selectedEntry) {
    return <FreetextDetail entry={selectedEntry} onClose={handleCloseDetail} onEdit={handleEdit} />;
  }

  if (isCreating || editingEntry) {
    return (
      <FreetextForm
        onSave={handleSave}
        onCancel={handleCancel}
        existingEntry={editingEntry}
      />
    );
  }

  return (
    <div>
      <h2>Freetext</h2>
      <Button onClick={() => setIsCreating(true)}>Add New Freetext Entry</Button>
      <div>
        {entries.map((entry) => (
          <FreetextQuickView key={entry.id} entry={entry} onSelect={handleSelect} />
        ))}
      </div>
    </div>
  );
};

export default FreetextList;
