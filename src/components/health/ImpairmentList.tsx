// src/components/health/ImpairmentList.tsx
import React, { useState } from 'react';
import type { HealthImpairment, HealthCondition } from '../../types/data.types';
import Button from '../common/Button';
import SearchBar from '../common/SearchBar';
import Modal from '../common/Modal';
import ImpairmentForm from './ImpairmentForm';
import ImpairmentQuickView from './ImpairmentQuickView';
import ImpairmentDetail from './ImpairmentDetail';

interface ImpairmentListProps {
  entries: HealthImpairment[];
  setEntries: React.Dispatch<React.SetStateAction<HealthImpairment[]>>;
  conditions: HealthCondition[]; // Passed from parent
}

const ImpairmentList: React.FC<ImpairmentListProps> = ({ entries, setEntries, conditions }) => {
  const [selectedEntry, setSelectedEntry] = useState<HealthImpairment | null>(null);
  const [editingEntry, setEditingEntry] = useState<HealthImpairment | undefined>(undefined);
  const [isCreating, setIsCreating] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [deleteConfirmModal, setDeleteConfirmModal] = useState<{ isOpen: boolean; entryId: string | null }>({
    isOpen: false,
    entryId: null,
  });

  const handleSave = (entry: HealthImpairment) => {
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

  const handleSelect = (entry: HealthImpairment) => {
    setSelectedEntry(entry);
  };

  const handleCloseDetail = () => {
    setSelectedEntry(null);
  };

  const handleEdit = (entry: HealthImpairment) => {
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
    return entry.description.toLowerCase().includes(query);
  });

  if (selectedEntry) {
    return (
      <ImpairmentDetail
        entry={selectedEntry}
        conditions={conditions}
        onClose={handleCloseDetail}
        onEdit={handleEdit}
        onDelete={handleDeleteClick}
      />
    );
  }

  if (isCreating || editingEntry) {
    return (
      <ImpairmentForm
        onSave={handleSave}
        onCancel={handleCancel}
        existingEntry={editingEntry}
        conditions={conditions}
      />
    );
  }

  return (
    <div>
      <h4>Impairments</h4>
      <Button onClick={() => setIsCreating(true)}>Add New Impairment</Button>
      <SearchBar
        value={searchQuery}
        onChange={setSearchQuery}
        placeholder="Search impairments by description..."
      />
      <div>
        {filteredEntries.length === 0 ? (
          <p style={{ textAlign: 'center', padding: '2rem', color: '#6c757d' }}>
            {entries.length === 0
              ? 'No impairments yet. Click "Add New Impairment" to get started.'
              : 'No impairments match your search.'}
          </p>
        ) : (
          filteredEntries.map((entry) => (
            <ImpairmentQuickView
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
        title="Delete Impairment"
        footer={
          <>
            <Button onClick={handleDeleteCancel}>Cancel</Button>
            <Button onClick={handleDeleteConfirm} style={{ background: '#dc3545' }}>
              Delete
            </Button>
          </>
        }
      >
        <p>Are you sure you want to delete this impairment entry? This action cannot be undone.</p>
      </Modal>
    </div>
  );
};

export default ImpairmentList;
