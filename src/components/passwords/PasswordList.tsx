// src/components/passwords/PasswordList.tsx
import React, { useState } from 'react';
import type { PasswordEntry } from '../../types/data.types';
import Button from '../common/Button';
import SearchBar from '../common/SearchBar';
import Modal from '../common/Modal';
import PasswordForm from './PasswordForm';
import PasswordQuickView from './PasswordQuickView';
import PasswordDetail from './PasswordDetail';

const PasswordList: React.FC = () => {
  const [entries, setEntries] = useState<PasswordEntry[]>([]);
  const [selectedEntry, setSelectedEntry] = useState<PasswordEntry | null>(null);
  const [editingEntry, setEditingEntry] = useState<PasswordEntry | undefined>(undefined);
  const [isCreating, setIsCreating] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [deleteConfirmModal, setDeleteConfirmModal] = useState<{ isOpen: boolean; entryId: string | null }>({
    isOpen: false,
    entryId: null,
  });

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

  const handleDeleteClick = (entryId: string) => {
    setDeleteConfirmModal({ isOpen: true, entryId });
  };

  const handleDeleteConfirm = () => {
    if (deleteConfirmModal.entryId) {
      setEntries((prev) => prev.filter((e) => e.id !== deleteConfirmModal.entryId));
      setDeleteConfirmModal({ isOpen: false, entryId: null });
    }
  };

  const handleDeleteCancel = () => {
    setDeleteConfirmModal({ isOpen: false, entryId: null });
  };

  // Filter entries based on search query
  const filteredEntries = entries.filter((entry) => {
    const query = searchQuery.toLowerCase();
    return (
      entry.account.toLowerCase().includes(query) ||
      entry.username.toLowerCase().includes(query) ||
      entry.email?.toLowerCase().includes(query) ||
      entry.url?.toLowerCase().includes(query) ||
      entry.notes?.toLowerCase().includes(query) ||
      entry.tags?.some((tag) => tag.toLowerCase().includes(query))
    );
  });

  if (selectedEntry) {
    return (
      <PasswordDetail
        entry={selectedEntry}
        onClose={handleCloseDetail}
        onEdit={handleEdit}
        onDelete={handleDeleteClick}
      />
    );
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
      <SearchBar
        value={searchQuery}
        onChange={setSearchQuery}
        placeholder="Search passwords by account, username, email, tags..."
      />
      <div>
        {filteredEntries.length === 0 ? (
          <p style={{ textAlign: 'center', padding: '2rem', color: '#6c757d' }}>
            {entries.length === 0
              ? 'No passwords yet. Click "Add New Password" to get started.'
              : 'No passwords match your search.'}
          </p>
        ) : (
          filteredEntries.map((entry) => (
            <PasswordQuickView
              key={entry.id}
              entry={entry}
              onSelect={handleSelect}
              onDelete={handleDeleteClick}
            />
          ))
        )}
      </div>

      <Modal
        isOpen={deleteConfirmModal.isOpen}
        onClose={handleDeleteCancel}
        title="Delete Password"
        footer={
          <>
            <Button onClick={handleDeleteCancel}>Cancel</Button>
            <Button onClick={handleDeleteConfirm} style={{ background: '#dc3545' }}>
              Delete
            </Button>
          </>
        }
      >
        <p>Are you sure you want to delete this password entry? This action cannot be undone.</p>
      </Modal>
    </div>
  );
};

export default PasswordList;
