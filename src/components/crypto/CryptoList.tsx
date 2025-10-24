// src/components/crypto/CryptoList.tsx
import React, { useState } from 'react';
import type { CryptoEntry } from '../../types/data.types';
import Button from '../common/Button';
import SearchBar from '../common/SearchBar';
import Modal from '../common/Modal';
import CryptoForm from './CryptoForm';
import CryptoQuickView from './CryptoQuickView';
import CryptoDetail from './CryptoDetail';

const CryptoList: React.FC = () => {
  const [entries, setEntries] = useState<CryptoEntry[]>([]);
  const [selectedEntry, setSelectedEntry] = useState<CryptoEntry | null>(null);
  const [editingEntry, setEditingEntry] = useState<CryptoEntry | undefined>(undefined);
  const [isCreating, setIsCreating] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [deleteConfirmModal, setDeleteConfirmModal] = useState<{ isOpen: boolean; entryId: string | null }>({
    isOpen: false,
    entryId: null,
  });

  const handleSave = (entry: CryptoEntry) => {
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

  const handleDeleteClick = (entryId: string) => {
    setDeleteConfirmModal({ isOpen: true, entryId });
  };

  const handleDeleteConfirm = () => {
    if (deleteConfirmModal.entryId) {
      setEntries((prev) => prev.filter((e) => e.id !== deleteConfirmModal.entryId));
      setSelectedEntry(null);
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
      entry.username?.toLowerCase().includes(query) ||
      entry.email?.toLowerCase().includes(query) ||
      entry.walletAddressEth?.toLowerCase().includes(query) ||
      entry.walletAddressBtc?.toLowerCase().includes(query) ||
      entry.walletAddressSol?.toLowerCase().includes(query) ||
      entry.notes?.toLowerCase().includes(query) ||
      entry.tags?.some((tag) => tag.toLowerCase().includes(query))
    );
  });

  if (selectedEntry) {
    return (
      <CryptoDetail
        entry={selectedEntry}
        onClose={handleCloseDetail}
        onEdit={handleEdit}
        onDelete={handleDeleteClick}
      />
    );
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
      <h2>Crypto</h2>
      <Button onClick={() => setIsCreating(true)}>Add New Crypto Entry</Button>
      <SearchBar
        value={searchQuery}
        onChange={setSearchQuery}
        placeholder="Search crypto entries by account, username, email, wallet addresses, tags..."
      />
      <div>
        {filteredEntries.length === 0 ? (
          <p style={{ textAlign: 'center', padding: '2rem', color: '#6c757d' }}>
            {entries.length === 0
              ? 'No crypto entries yet. Click "Add New Crypto Entry" to get started.'
              : 'No crypto entries match your search.'}
          </p>
        ) : (
          filteredEntries.map((entry) => (
            <CryptoQuickView
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
        title="Delete Crypto Entry"
        footer={
          <>
            <Button onClick={handleDeleteCancel}>Cancel</Button>
            <Button onClick={handleDeleteConfirm} style={{ background: '#dc3545' }}>
              Delete
            </Button>
          </>
        }
      >
        <p>Are you sure you want to delete this crypto entry? This action cannot be undone.</p>
      </Modal>
    </div>
  );
};

export default CryptoList;
