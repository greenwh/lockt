// src/components/freetext/FreetextList.tsx
import React, { useState } from 'react';
import type { FreetextEntry } from '../../types/data.types';
import { useAuth } from '../../context/AuthContext';
import Button from '../common/Button';
import SearchBar from '../common/SearchBar';
import Modal from '../common/Modal';
import FreetextForm from './FreetextForm';
import FreetextQuickView from './FreetextQuickView';
import FreetextDetail from './FreetextDetail';

const FreetextList: React.FC = () => {
  const { appData, updateFreetext } = useAuth();
  const entries = appData?.freetext || [];
  const [_savedError, setSavedError] = useState<string | null>(null);
  const [selectedEntry, setSelectedEntry] = useState<FreetextEntry | null>(null);
  const [editingEntry, setEditingEntry] = useState<FreetextEntry | undefined>(undefined);
  const [isCreating, setIsCreating] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [deleteConfirmModal, setDeleteConfirmModal] = useState<{ isOpen: boolean; entryId: string | null }>({
    isOpen: false,
    entryId: null,
  });

  const handleSave = async (entry: FreetextEntry) => {
    try {
      setSavedError(null);
      const existingIndex = entries.findIndex((e) => e.id === entry.id);
      let updatedEntries: FreetextEntry[];

      if (existingIndex > -1) {
        updatedEntries = [...entries];
        updatedEntries[existingIndex] = entry;
      } else {
        updatedEntries = [...entries, entry];
      }

      await updateFreetext(updatedEntries);
      setIsCreating(false);
      setEditingEntry(undefined);
      setSelectedEntry(entry); // Show detail view after save
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to save freetext entry';
      setSavedError(message);
      console.error('Save failed:', err);
    }
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

  const handleDeleteClick = (entryId: string) => {
    setDeleteConfirmModal({ isOpen: true, entryId });
  };

  const handleDeleteConfirm = async () => {
    if (deleteConfirmModal.entryId) {
      try {
        setSavedError(null);
        const updatedEntries = entries.filter((e) => e.id !== deleteConfirmModal.entryId);
        await updateFreetext(updatedEntries);
        setSelectedEntry(null);
        setDeleteConfirmModal({ isOpen: false, entryId: null });
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Failed to delete freetext entry';
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
      entry.title.toLowerCase().includes(query) ||
      entry.category?.toLowerCase().includes(query) ||
      entry.content?.toLowerCase().includes(query) ||
      entry.notes?.toLowerCase().includes(query) ||
      entry.tags?.some((tag) => tag.toLowerCase().includes(query))
    );
  });

  if (selectedEntry) {
    return (
      <FreetextDetail
        entry={selectedEntry}
        onClose={handleCloseDetail}
        onEdit={handleEdit}
        onDelete={handleDeleteClick}
      />
    );
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
      <SearchBar
        value={searchQuery}
        onChange={setSearchQuery}
        placeholder="Search freetext entries by title, category, content, tags..."
      />
      <div>
        {filteredEntries.length === 0 ? (
          <p style={{ textAlign: 'center', padding: '2rem', color: '#6c757d' }}>
            {entries.length === 0
              ? 'No freetext entries yet. Click "Add New Freetext Entry" to get started.'
              : 'No freetext entries match your search.'}
          </p>
        ) : (
          filteredEntries.map((entry) => (
            <FreetextQuickView
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
        title="Delete Freetext Entry"
        footer={
          <>
            <Button onClick={handleDeleteCancel}>Cancel</Button>
            <Button onClick={handleDeleteConfirm} style={{ background: '#dc3545' }}>
              Delete
            </Button>
          </>
        }
      >
        <p>Are you sure you want to delete this freetext entry? This action cannot be undone.</p>
      </Modal>
    </div>
  );
};

export default FreetextList;
