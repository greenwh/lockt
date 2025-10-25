// src/components/health/ProviderList.tsx
import React, { useState } from 'react';
import type { HealthProvider } from '../../types/data.types';
import Button from '../common/Button';
import SearchBar from '../common/SearchBar';
import Modal from '../common/Modal';
import ProviderForm from './ProviderForm';
import ProviderQuickView from './ProviderQuickView';
import ProviderDetail from './ProviderDetail';

interface ProviderListProps {
  entries: HealthProvider[];
  setEntries: React.Dispatch<React.SetStateAction<HealthProvider[]>>;
}

const ProviderList: React.FC<ProviderListProps> = ({ entries, setEntries }) => {
  const [selectedEntry, setSelectedEntry] = useState<HealthProvider | null>(null);
  const [editingEntry, setEditingEntry] = useState<HealthProvider | undefined>(undefined);
  const [isCreating, setIsCreating] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [deleteConfirmModal, setDeleteConfirmModal] = useState<{ isOpen: boolean; entryId: string | null }>({
    isOpen: false,
    entryId: null,
  });

  // Ensure entries is always an array (defensive check for data structure issues)
  const safeEntries = Array.isArray(entries) ? entries : [];

  const handleSave = (entry: HealthProvider) => {
    console.log('ProviderList.handleSave called with entry:', entry);

    // Calculate the new entries array immediately
    const newEntries = safeEntries.findIndex((e) => e.id === entry.id) > -1
      ? safeEntries.map((e) => (e.id === entry.id ? entry : e))
      : [...safeEntries, entry];

    console.log('ProviderList.handleSave: newEntries=', newEntries);

    // Update the list state AND persist to parent
    setEntries(newEntries);

    setIsCreating(false);
    setEditingEntry(undefined);
    setSelectedEntry(entry);
  };

  const handleCancel = () => {
    setIsCreating(false);
    setEditingEntry(undefined);
  };

  const handleSelect = (entry: HealthProvider) => {
    setSelectedEntry(entry);
  };

  const handleCloseDetail = () => {
    setSelectedEntry(null);
  };

  const handleEdit = (entry: HealthProvider) => {
    setSelectedEntry(null);
    setEditingEntry(entry);
  };

  const handleDeleteClick = (entryId: string) => {
    setDeleteConfirmModal({ isOpen: true, entryId });
  };

  const handleDeleteConfirm = () => {
    if (deleteConfirmModal.entryId) {
      setEntries((prev) => {
        const safePrev = Array.isArray(prev) ? prev : [];
        return safePrev.filter((e) => e.id !== deleteConfirmModal.entryId);
      });
      setSelectedEntry(null);
      setDeleteConfirmModal({ isOpen: false, entryId: null });
    }
  };

  const handleDeleteCancel = () => {
    setDeleteConfirmModal({ isOpen: false, entryId: null });
  };

  // Filter entries based on search query
  const filteredEntries = safeEntries.filter((entry) => {
    const query = searchQuery.toLowerCase();
    return (
      entry.drName?.toLowerCase().includes(query) ||
      entry.specialty?.toLowerCase().includes(query) ||
      entry.email?.toLowerCase().includes(query) ||
      entry.phone?.toLowerCase().includes(query) ||
      entry.account?.toLowerCase().includes(query)
    );
  });

  console.log('ProviderList render:', { safeEntriesLength: safeEntries.length, filteredEntriesLength: filteredEntries.length, searchQuery, safeEntries, filteredEntries });

  if (selectedEntry) {
    return (
      <ProviderDetail
        entry={selectedEntry}
        onClose={handleCloseDetail}
        onEdit={handleEdit}
        onDelete={handleDeleteClick}
      />
    );
  }

  if (isCreating || editingEntry) {
    return (
      <ProviderForm
        onSave={handleSave}
        onCancel={handleCancel}
        existingEntry={editingEntry}
      />
    );
  }

  return (
    <div>
      <h4>Providers</h4>
      <Button onClick={() => setIsCreating(true)}>Add New Provider</Button>
      <SearchBar
        value={searchQuery}
        onChange={setSearchQuery}
        placeholder="Search providers by name, specialty, email, phone, account..."
      />
      <div>
        {filteredEntries.length === 0 ? (
          <p style={{ textAlign: 'center', padding: '2rem', color: '#6c757d' }}>
            {safeEntries.length === 0
              ? 'No providers yet. Click "Add New Provider" to get started.'
              : 'No providers match your search.'}
          </p>
        ) : (
          filteredEntries.map((entry) => (
            <ProviderQuickView
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
        title="Delete Provider"
        footer={
          <>
            <Button onClick={handleDeleteCancel}>Cancel</Button>
            <Button onClick={handleDeleteConfirm} style={{ background: '#dc3545' }}>
              Delete
            </Button>
          </>
        }
      >
        <p>Are you sure you want to delete this provider entry? This action cannot be undone.</p>
      </Modal>
    </div>
  );
};

export default ProviderList;
