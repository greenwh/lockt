// src/components/credit-cards/CreditCardList.tsx
import React, { useState } from 'react';
import type { CreditCardEntry } from '../../types/data.types';
import { useAuth } from '../../context/AuthContext';
import Button from '../common/Button';
import SearchBar from '../common/SearchBar';
import Modal from '../common/Modal';
import ImportExport from '../common/ImportExport';
import CreditCardForm from './CreditCardForm';
import CreditCardQuickView from './CreditCardQuickView';
import CreditCardDetail from './CreditCardDetail';
import { csvService } from '../../services/csv.service';

const CreditCardList: React.FC = () => {
  const { appData, updateCreditCards } = useAuth();
  const entries = appData?.creditCards || [];
  const [_savedError, setSavedError] = useState<string | null>(null);
  const [selectedEntry, setSelectedEntry] = useState<CreditCardEntry | null>(null);
  const [editingEntry, setEditingEntry] = useState<CreditCardEntry | undefined>(undefined);
  const [isCreating, setIsCreating] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [deleteConfirmModal, setDeleteConfirmModal] = useState<{ isOpen: boolean; entryId: string | null }>({
    isOpen: false,
    entryId: null,
  });

  const handleSave = async (entry: CreditCardEntry) => {
    try {
      setSavedError(null);
      const existingIndex = entries.findIndex((e) => e.id === entry.id);
      let updatedEntries: CreditCardEntry[];

      if (existingIndex > -1) {
        updatedEntries = [...entries];
        updatedEntries[existingIndex] = entry;
      } else {
        updatedEntries = [...entries, entry];
      }

      await updateCreditCards(updatedEntries);
      setIsCreating(false);
      setEditingEntry(undefined);
      setSelectedEntry(entry); // Show detail view after save
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to save credit card';
      setSavedError(message);
      console.error('Save failed:', err);
    }
  };

  const handleCancel = () => {
    setIsCreating(false);
    setEditingEntry(undefined);
  };

  const handleSelect = (entry: CreditCardEntry) => {
    setSelectedEntry(entry);
  };

  const handleCloseDetail = () => {
    setSelectedEntry(null);
  };

  const handleEdit = (entry: CreditCardEntry) => {
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
        await updateCreditCards(updatedEntries);
        setSelectedEntry(null);
        setDeleteConfirmModal({ isOpen: false, entryId: null });
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Failed to delete credit card';
        setSavedError(message);
        console.error('Delete failed:', err);
      }
    }
  };

  const handleDeleteCancel = () => {
    setDeleteConfirmModal({ isOpen: false, entryId: null });
  };

  const handleImport = async (importedData: CreditCardEntry[]) => {
    try {
      setSavedError(null);
      // Merge imported data with existing data (imported entries are added)
      const mergedEntries = [...entries, ...importedData];
      await updateCreditCards(mergedEntries);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to import credit cards';
      setSavedError(message);
      console.error('Import failed:', err);
      throw err; // Re-throw to let ImportExport component handle the error display
    }
  };

  // Filter entries based on search query
  const filteredEntries = entries.filter((entry) => {
    const query = searchQuery.toLowerCase();
    const cardNumberLast4 = entry.cardNumber.slice(-4);
    return (
      entry.accountName.toLowerCase().includes(query) ||
      cardNumberLast4.includes(query) ||
      entry.email?.toLowerCase().includes(query) ||
      entry.url?.toLowerCase().includes(query) ||
      entry.notes?.toLowerCase().includes(query) ||
      entry.tags?.some((tag) => tag.toLowerCase().includes(query))
    );
  });

  if (selectedEntry) {
    return (
      <CreditCardDetail
        entry={selectedEntry}
        onClose={handleCloseDetail}
        onEdit={handleEdit}
        onDelete={handleDeleteClick}
      />
    );
  }

  if (isCreating || editingEntry) {
    return (
      <CreditCardForm
        onSave={handleSave}
        onCancel={handleCancel}
        existingEntry={editingEntry}
      />
    );
  }

  return (
    <div>
      <h2>Credit Cards</h2>
      <Button onClick={() => setIsCreating(true)}>Add New Credit Card</Button>
      <SearchBar
        value={searchQuery}
        onChange={setSearchQuery}
        placeholder="Search credit cards by account, card number, email, tags..."
      />
      <ImportExport
        data={entries}
        onImport={handleImport}
        exportFunction={csvService.exportCreditCardsToCsv}
        importFunction={csvService.importCreditCardsFromCsv}
        filename={`credit-cards-${new Date().toISOString().split('T')[0]}.csv`}
      />
      <div>
        {filteredEntries.length === 0 ? (
          <p style={{ textAlign: 'center', padding: '2rem', color: '#6c757d' }}>
            {entries.length === 0
              ? 'No credit cards yet. Click "Add New Credit Card" to get started.'
              : 'No credit cards match your search.'}
          </p>
        ) : (
          filteredEntries.map((entry) => (
            <CreditCardQuickView
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
        title="Delete Credit Card"
        footer={
          <>
            <Button onClick={handleDeleteCancel}>Cancel</Button>
            <Button onClick={handleDeleteConfirm} style={{ background: '#dc3545' }}>
              Delete
            </Button>
          </>
        }
      >
        <p>Are you sure you want to delete this credit card entry? This action cannot be undone.</p>
      </Modal>
    </div>
  );
};

export default CreditCardList;
