// src/components/crypto/CryptoList.tsx
import React, { useState } from 'react';
import { useData } from '../../context/DataContext';
import type { CryptoEntry } from '../../types/data.types';
import Button from '../common/Button';
import CryptoForm from './CryptoForm';
import CryptoQuickView from './CryptoQuickView';
import CryptoDetail from './CryptoDetail';

const CryptoList: React.FC = () => {
  const { appData, addEntry, updateEntry } = useData();
  const [selectedEntry, setSelectedEntry] = useState<CryptoEntry | null>(null);
  const [editingEntry, setEditingEntry] = useState<CryptoEntry | undefined>(undefined);
  const [isCreating, setIsCreating] = useState(false);

  const handleSave = (entry: CryptoEntry) => {
    if (editingEntry) {
      updateEntry('crypto', entry.id, entry);
    } else {
      addEntry('crypto', entry);
    }
    setIsCreating(false);
    setEditingEntry(undefined);
    setSelectedEntry(entry);
  };

  const handleCancel = () => {
    setIsCreating(false);
    setEditingEntry(undefined);
  };

  const handleSelect = (entry: CryptoEntry) => {
    setSelectedEntry(entry);
  };

  const handleCloseDetail = () => {
    setSelectedEntry(null);
  };

  const handleEdit = (entry: CryptoEntry) => {
    setSelectedEntry(null);
    setEditingEntry(entry);
  };

  if (selectedEntry) {
    return <CryptoDetail entry={selectedEntry} onClose={handleCloseDetail} onEdit={handleEdit} />;
  }

  if (isCreating || editingEntry) {
    return (
      <CryptoForm
        onSave={handleSave}
        onCancel={handleCancel}
        existingEntry={editingEntry}
      />
    );
  }

  return (
    <div>
      <h2>Crypto Accounts</h2>
      <Button onClick={() => setIsCreating(true)}>Add New Crypto Account</Button>
      <div>
        {appData.crypto.map((entry) => (
          <CryptoQuickView key={entry.id} entry={entry} onSelect={handleSelect} />
        ))}
      </div>
    </div>
  );
};

export default CryptoList;