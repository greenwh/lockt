// src/components/health/JournalList.tsx
import React, { useState } from 'react';
import type { HealthJournalEntry } from '../../types/data.types';
import Button from '../common/Button';
import SearchBar from '../common/SearchBar';
import Modal from '../common/Modal';
import ImportExport from '../common/ImportExport';
import JournalForm from './JournalForm';
import JournalQuickView from './JournalQuickView';
import JournalDetail from './JournalDetail';
import { csvService } from '../../services/csv.service';
import { printService } from '../../services/print.service';

interface JournalListProps {
  entries: HealthJournalEntry[];
  setEntries: React.Dispatch<React.SetStateAction<HealthJournalEntry[]>>;
}

const JournalList: React.FC<JournalListProps> = ({ entries, setEntries }) => {
  const [selectedEntry, setSelectedEntry] = useState<HealthJournalEntry | null>(null);
  const [editingEntry, setEditingEntry] = useState<HealthJournalEntry | undefined>(undefined);
  const [isCreating, setIsCreating] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [deleteConfirmModal, setDeleteConfirmModal] = useState<{ isOpen: boolean; entryId: string | null }>({
    isOpen: false,
    entryId: null,
  });

  // Ensure entries is always an array (defensive check for data structure issues)
  const safeEntries = Array.isArray(entries) ? entries : [];

  const handleSave = (entry: HealthJournalEntry) => {
    // Calculate the new entries array immediately
    const newEntries = safeEntries.findIndex((e) => e.id === entry.id) > -1
      ? safeEntries.map((e) => (e.id === entry.id ? entry : e))
      : [...safeEntries, entry];

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

  const handleSelect = (entry: HealthJournalEntry) => {
    setSelectedEntry(entry);
  };

  const handleCloseDetail = () => {
    setSelectedEntry(null);
  };

  const handleEdit = (entry: HealthJournalEntry) => {
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

  const handleImport = async (importedData: HealthJournalEntry[]) => {
    // Merge imported data with existing data (imported entries are added)
    const mergedEntries = [...safeEntries, ...importedData];
    setEntries(mergedEntries);
  };

  const handlePrint = () => {
    // Print all journal entries (or filtered entries if search is active)
    const entriesToPrint = searchQuery ? filteredEntries : safeEntries;
    printService.printHealthJournal(entriesToPrint, 'Health Journal');
  };

  // Filter entries based on search query
  const filteredEntries = safeEntries.filter((entry) => {
    const query = searchQuery.toLowerCase();
    return (
      entry.reasonForEntry.toLowerCase().includes(query) ||
      entry.entry.toLowerCase().includes(query)
    );
  });

  if (selectedEntry) {
    return (
      <JournalDetail
        entry={selectedEntry}
        onClose={handleCloseDetail}
        onEdit={handleEdit}
        onDelete={handleDeleteClick}
      />
    );
  }

  if (isCreating || editingEntry) {
    return (
      <JournalForm
        onSave={handleSave}
        onCancel={handleCancel}
        existingEntry={editingEntry}
      />
    );
  }

  return (
    <div>
      <h4>Journal</h4>
      <Button onClick={() => setIsCreating(true)}>Add New Journal Entry</Button>
      <SearchBar
        value={searchQuery}
        onChange={setSearchQuery}
        placeholder="Search journal by reason, entry content..."
      />
      <ImportExport
        data={safeEntries}
        onImport={handleImport}
        exportFunction={csvService.exportHealthJournalToCsv}
        importFunction={csvService.importHealthJournalFromCsv}
        filename={`health-journal-${new Date().toISOString().split('T')[0]}.csv`}
      />
      {safeEntries.length > 0 && (
        <Button onClick={handlePrint} style={{ marginBottom: '10px' }}>
          🖨️ Print
        </Button>
      )}
      <div>
        {filteredEntries.length === 0 ? (
          <p style={{ textAlign: 'center', padding: '2rem', color: '#6c757d' }}>
            {safeEntries.length === 0
              ? 'No journal entries yet. Click "Add New Journal Entry" to get started.'
              : 'No journal entries match your search.'}
          </p>
        ) : (
          filteredEntries.map((entry) => (
            <JournalQuickView
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
        title="Delete Journal Entry"
        footer={
          <>
            <Button onClick={handleDeleteCancel}>Cancel</Button>
            <Button onClick={handleDeleteConfirm} style={{ background: '#dc3545' }}>
              Delete
            </Button>
          </>
        }
      >
        <p>Are you sure you want to delete this journal entry? This action cannot be undone.</p>
      </Modal>
    </div>
  );
};

export default JournalList;
