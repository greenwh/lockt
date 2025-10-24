// src/components/credit-cards/CreditCardList.tsx
import React, { useState } from 'react';
import { useData } from '../../context/DataContext';
import type { CreditCardEntry } from '../../types/data.types';
import Button from '../common/Button';
import CreditCardForm from './CreditCardForm';
import CreditCardQuickView from './CreditCardQuickView';
import CreditCardDetail from './CreditCardDetail';

const CreditCardList: React.FC = () => {
  const { appData, addEntry, updateEntry } = useData();
  const [selectedEntry, setSelectedEntry] = useState<CreditCardEntry | null>(null);
  const [editingEntry, setEditingEntry] = useState<CreditCardEntry | undefined>(undefined);
  const [isCreating, setIsCreating] = useState(false);

  const handleSave = (entry: CreditCardEntry) => {
    if (editingEntry) {
      updateEntry('creditCards', entry.id, entry);
    } else {
      addEntry('creditCards', entry);
    }
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
        {appData.creditCards.map((entry) => (
          <CreditCardQuickView key={entry.id} entry={entry} onSelect={handleSelect} />
        ))}
      </div>
    </div>
  );
};

export default CreditCardList;