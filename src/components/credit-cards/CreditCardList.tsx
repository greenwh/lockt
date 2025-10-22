// src/components/credit-cards/CreditCardList.tsx
import React, { useState } from 'react';
import type { CreditCardEntry } from '../../types/data.types';
import Button from '../common/Button';
import CreditCardForm from './CreditCardForm';
import CreditCardQuickView from './CreditCardQuickView';
import CreditCardDetail from './CreditCardDetail';

const CreditCardList: React.FC = () => {
  const [entries, setEntries] = useState<CreditCardEntry[]>([]);
  const [selectedEntry, setSelectedEntry] = useState<CreditCardEntry | null>(null);
  const [editingEntry, setEditingEntry] = useState<CreditCardEntry | undefined>(undefined);
  const [isCreating, setIsCreating] = useState(false);

  const handleSave = (entry: CreditCardEntry) => {
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

  const handleSelect = (entry: CreditCardEntry) => {
    setSelectedEntry(entry);
  };

  const handleCloseDetail = () => {
    setSelectedEntry(null);
  };

  const handleEdit = (entry: CreditCardEntry) => {
    setSelectedEntry(null);
    setEditingEntry(entry);
  };

  if (selectedEntry) {
    return <CreditCardDetail entry={selectedEntry} onClose={handleCloseDetail} onEdit={handleEdit} />;
  }

  if (isCreating || editingEntry) {
    return (
      <CreditCardForm
        onSave={handleSave}
        onCancel={handleCancel}
        existingEntry={editingEntry}
      />
    );
  }

  return (
    <div>
      <h2>Credit Cards</h2>
      <Button onClick={() => setIsCreating(true)}>Add New Credit Card</Button>
      <div>
        {entries.map((entry) => (
          <CreditCardQuickView key={entry.id} entry={entry} onSelect={handleSelect} />
        ))}
      </div>
    </div>
  );
};

export default CreditCardList;
