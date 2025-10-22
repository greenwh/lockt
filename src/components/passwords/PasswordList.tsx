// src/components/passwords/PasswordList.tsx
import React, { useState } from 'react';
import type { PasswordEntry } from '../../types/data.types';
import Button from '../common/Button';
import PasswordForm from './PasswordForm';
import PasswordQuickView from './PasswordQuickView';
import PasswordDetail from './PasswordDetail';

const PasswordList: React.FC = () => {
  const [entries, setEntries] = useState<PasswordEntry[]>([]);
  const [selectedEntry, setSelectedEntry] = useState<PasswordEntry | null>(null);
  const [editingEntry, setEditingEntry] = useState<PasswordEntry | undefined>(undefined);
  const [isCreating, setIsCreating] = useState(false);

  const handleSave = (entry: PasswordEntry) => {
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
        {entries.map((entry) => (
          <PasswordQuickView key={entry.id} entry={entry} onSelect={handleSelect} />
        ))}
      </div>
    </div>
  );
};

export default PasswordList;
