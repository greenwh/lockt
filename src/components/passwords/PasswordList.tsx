// src/components/passwords/PasswordList.tsx
import React, { useState } from 'react';
import { useData } from '../../context/DataContext';
import type { PasswordEntry } from '../../types/data.types';
import Button from '../common/Button';
import PasswordForm from './PasswordForm';
import PasswordQuickView from './PasswordQuickView';
import PasswordDetail from './PasswordDetail';

const PasswordList: React.FC = () => {
  const { appData, addEntry, updateEntry } = useData();
  const [selectedEntry, setSelectedEntry] = useState<PasswordEntry | null>(null);
  const [editingEntry, setEditingEntry] = useState<PasswordEntry | undefined>(undefined);
  const [isCreating, setIsCreating] = useState(false);

  const handleSave = (entry: PasswordEntry) => {
    if (editingEntry) {
      updateEntry('passwords', entry.id, entry);
    } else {
      addEntry('passwords', entry);
    }
    setIsCreating(false);
    setEditingEntry(undefined);
    setSelectedEntry(entry); // Show detail view after save
  };

  const handleCancel = () => {
    setIsCreating(false);
    setEditingEntry(undefined);
  };

  const handleSelect = (entry: PasswordEntry) => {
    setSelectedEntry(entry);
  };

  const handleCloseDetail = () => {
    setSelectedEntry(null);
  };

  const handleEdit = (entry: PasswordEntry) => {
    setSelectedEntry(null);
    setEditingEntry(entry);
  };

  if (selectedEntry) {
    return <PasswordDetail entry={selectedEntry} onClose={handleCloseDetail} onEdit={handleEdit} />;
  }

  if (isCreating || editingEntry) {
    return (
      <PasswordForm
        onSave={handleSave}
        onCancel={handleCancel}
        existingEntry={editingEntry}
      />
    );
  }

  return (
    <div>
      <h2>Passwords</h2>
      <Button onClick={() => setIsCreating(true)}>Add New Password</Button>
      <div>
        {appData.passwords.map((entry) => (
          <PasswordQuickView key={entry.id} entry={entry} onSelect={handleSelect} />
        ))}
      </div>
    </div>
  );
};

export default PasswordList;
