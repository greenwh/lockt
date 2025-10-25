// src/components/passwords/PasswordList.tsx
import React, { useState } from 'react';
import type { PasswordEntry } from '../../types/data.types';
import { useAuth } from '../../context/AuthContext';
import Button from '../common/Button';
import SearchBar from '../common/SearchBar';
import Modal from '../common/Modal';
import PasswordForm from './PasswordForm';
import PasswordQuickView from './PasswordQuickView';
import PasswordDetail from './PasswordDetail';

const PasswordList: React.FC = () => {
  const { appData, updatePasswords } = useAuth();
  const entries = appData?.passwords || [];
  const [_savedError, setSavedError] = useState<string | null>(null);
  const [selectedEntry, setSelectedEntry] = useState<PasswordEntry | null>(null);
  const [editingEntry, setEditingEntry] = useState<PasswordEntry | undefined>(undefined);
  const [isCreating, setIsCreating] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [deleteConfirmModal, setDeleteConfirmModal] = useState<{ isOpen: boolean; entryId: string | null }>({
    isOpen: false,
    entryId: null,
  });

  const handleSave = async (entry: PasswordEntry) => {
    try {
      setSavedError(null);
      const existingIndex = entries.findIndex((e) => e.id === entry.id);
      let updatedEntries: PasswordEntry[];

      if (existingIndex > -1) {
        updatedEntries = [...entries];
        updatedEntries[existingIndex] = entry;
      } else {
        updatedEntries = [...entries, entry];
      }

      await updatePasswords(updatedEntries);
      setIsCreating(false);
      setEditingEntry(undefined);
      setSelectedEntry(entry); // Show detail view after save
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to save password';
      setSavedError(message);
      console.error('Save failed:', err);
    }
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

  const handleDeleteConfirm = async () => {
    if (deleteConfirmModal.entryId) {
      try {
        setSavedError(null);
        const updatedEntries = entries.filter((e) => e.id !== deleteConfirmModal.entryId);
        await updatePasswords(updatedEntries);
        setDeleteConfirmModal({ isOpen: false, entryId: null });
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Failed to delete password';
        setSavedError(message);
        console.error('Delete failed:', err);
      }
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
