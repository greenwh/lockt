// src/components/freetext/FreetextList.tsx
import React, { useState } from 'react';
import { useData } from '../../context/DataContext';
import type { FreetextEntry } from '../../types/data.types';
import Button from '../common/Button';
import FreetextForm from './FreetextForm';
import FreetextQuickView from './FreetextQuickView';
import FreetextDetail from './FreetextDetail';

const FreetextList: React.FC = () => {
  const { appData, addEntry, updateEntry } = useData();
  const [selectedEntry, setSelectedEntry] = useState<FreetextEntry | null>(null);
  const [editingEntry, setEditingEntry] = useState<FreetextEntry | undefined>(undefined);
  const [isCreating, setIsCreating] = useState(false);

  const handleSave = (entry: FreetextEntry) => {
    if (editingEntry) {
      updateEntry('freetext', entry.id, entry);
    } else {
      addEntry('freetext', entry);
    }
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
      <h2>Freetext Notes</h2>
      <Button onClick={() => setIsCreating(true)}>Add New Note</Button>
      <div>
        {appData.freetext.map((entry) => (
          <FreetextQuickView key={entry.id} entry={entry} onSelect={handleSelect} />
        ))}
      </div>
    </div>
  );
};

export default FreetextList;