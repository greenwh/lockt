// src/components/vso/RatingList.tsx
import React, { useState } from 'react';
import type { VSORating, VSOCurrentlyMet } from '../../types/data.types';
import Button from '../common/Button';
import SearchBar from '../common/SearchBar';
import Modal from '../common/Modal';
import ImportExport from '../common/ImportExport';
import RatingForm from './RatingForm';
import RatingQuickView from './RatingQuickView';
import RatingDetail from './RatingDetail';
import { csvService } from '../../services/csv.service';

interface RatingListProps {
  entries: VSORating[];
  setEntries: React.Dispatch<React.SetStateAction<VSORating[]>>;
}

const RatingList: React.FC<RatingListProps> = ({ entries, setEntries }) => {
  const [selectedEntry, setSelectedEntry] = useState<VSORating | null>(null);
  const [editingEntry, setEditingEntry] = useState<VSORating | undefined>(undefined);
  const [isCreating, setIsCreating] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentlyMetFilter, setCurrentlyMetFilter] = useState<VSOCurrentlyMet | 'all'>('all');
  const [deleteConfirmModal, setDeleteConfirmModal] = useState<{ isOpen: boolean; entryId: string | null }>({
    isOpen: false,
    entryId: null,
  });

  const safeEntries = Array.isArray(entries) ? entries : [];

  const handleSave = (entry: VSORating) => {
    const newEntries = safeEntries.findIndex((e) => e.id === entry.id) > -1
      ? safeEntries.map((e) => (e.id === entry.id ? entry : e))
      : [...safeEntries, entry];
    setEntries(newEntries);
    setIsCreating(false);
    setEditingEntry(undefined);
    setSelectedEntry(entry);
  };

  const handleCancel = () => {
    setIsCreating(false);
    setEditingEntry(undefined);
  };

  const handleSelect = (entry: VSORating) => {
    setSelectedEntry(entry);
  };

  const handleCloseDetail = () => {
    setSelectedEntry(null);
  };

  const handleEdit = (entry: VSORating) => {
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

  const handleImport = async (importedData: VSORating[]) => {
    const mergedEntries = [...safeEntries, ...importedData];
    setEntries(mergedEntries);
  };

  const filteredEntries = safeEntries.filter((entry) => {
    const query = searchQuery.toLowerCase();
    const matchesSearch = !searchQuery || (
      entry.diagnosticCode.toLowerCase().includes(query) ||
      entry.conditionName.toLowerCase().includes(query) ||
      entry.criteria.toLowerCase().includes(query) ||
      entry.veteranEvidence?.toLowerCase().includes(query) ||
      entry.notes?.toLowerCase().includes(query)
    );
    const matchesCurrentlyMet = currentlyMetFilter === 'all' || entry.currentlyMet === currentlyMetFilter;
    return matchesSearch && matchesCurrentlyMet;
  });

  const sortedEntries = [...filteredEntries].sort((a, b) => a.diagnosticCode.localeCompare(b.diagnosticCode));

  if (selectedEntry) {
    return (
      <RatingDetail
        entry={selectedEntry}
        onClose={handleCloseDetail}
        onEdit={handleEdit}
        onDelete={handleDeleteClick}
      />
    );
  }

  if (isCreating || editingEntry) {
    return (
      <RatingForm
        onSave={handleSave}
        onCancel={handleCancel}
        existingEntry={editingEntry}
      />
    );
  }

  return (
    <div>
      <h4>VSO Rating Criteria Reference</h4>
      <Button onClick={() => setIsCreating(true)}>Add New Rating Criteria</Button>
      <SearchBar
        value={searchQuery}
        onChange={setSearchQuery}
        placeholder="Search by code, condition, criteria..."
      />
      <div style={{ display: 'flex', gap: '10px', marginBottom: '10px', flexWrap: 'wrap' }}>
        <select
          value={currentlyMetFilter}
          onChange={(e) => setCurrentlyMetFilter(e.target.value as VSOCurrentlyMet | 'all')}
          style={{ padding: '6px 10px', borderRadius: '4px', border: '1px solid #ccc' }}
        >
          <option value="all">All Statuses</option>
          <option value="met">Met</option>
          <option value="partially-met">Partially Met</option>
          <option value="not-met">Not Met</option>
          <option value="unknown-need-testing">Unknown - Need Testing</option>
        </select>
      </div>
      <ImportExport
        data={safeEntries}
        onImport={handleImport}
        exportFunction={csvService.exportVSORatingsToCsv}
        importFunction={csvService.importVSORatingsFromCsv}
        filename={`vso-ratings-${new Date().toISOString().split('T')[0]}.csv`}
      />
      <div>
        {sortedEntries.length === 0 ? (
          <p style={{ textAlign: 'center', padding: '2rem', color: '#6c757d' }}>
            {safeEntries.length === 0
              ? 'No rating criteria yet. Click "Add New Rating Criteria" or import a CSV to get started.'
              : 'No rating criteria match your search/filter.'}
          </p>
        ) : (
          sortedEntries.map((entry) => (
            <RatingQuickView
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
        title="Delete Rating Criteria"
        footer={
          <>
            <Button onClick={handleDeleteCancel}>Cancel</Button>
            <Button onClick={handleDeleteConfirm} style={{ background: '#dc3545' }}>
              Delete
            </Button>
          </>
        }
      >
        <p>Are you sure you want to delete this rating criteria entry? This action cannot be undone.</p>
      </Modal>
    </div>
  );
};

export default RatingList;
