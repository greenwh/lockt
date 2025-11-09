// src/components/health/ConditionList.tsx
import React, { useState } from 'react';
import type { HealthCondition } from '../../types/data.types';
import Button from '../common/Button';
import SearchBar from '../common/SearchBar';
import Modal from '../common/Modal';
import ImportExport from '../common/ImportExport';
import ConditionForm from './ConditionForm';
import ConditionQuickView from './ConditionQuickView';
import ConditionDetail from './ConditionDetail';
import { csvService } from '../../services/csv.service';
import { printService } from '../../services/print.service';

interface ConditionListProps {
  entries: HealthCondition[];
  setEntries: React.Dispatch<React.SetStateAction<HealthCondition[]>>;
}

const ConditionList: React.FC<ConditionListProps> = ({ entries, setEntries }) => {
  const [selectedEntry, setSelectedEntry] = useState<HealthCondition | null>(null);
  const [editingEntry, setEditingEntry] = useState<HealthCondition | undefined>(undefined);
  const [isCreating, setIsCreating] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [deleteConfirmModal, setDeleteConfirmModal] = useState<{ isOpen: boolean; entryId: string | null }>({
    isOpen: false,
    entryId: null,
  });

  // Ensure entries is always an array (defensive check for data structure issues)
  const safeEntries = Array.isArray(entries) ? entries : [];

  const handleSave = (entry: HealthCondition) => {
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

  const handleSelect = (entry: HealthCondition) => {
    setSelectedEntry(entry);
  };

  const handleCloseDetail = () => {
    setSelectedEntry(null);
  };

  const handleEdit = (entry: HealthCondition) => {
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

  const handleImport = async (importedData: HealthCondition[]) => {
    // Merge imported data with existing data (imported entries are added)
    const mergedEntries = [...safeEntries, ...importedData];
    setEntries(mergedEntries);
  };

  const handlePrint = () => {
    // Print all conditions (or filtered entries if search is active)
    const entriesToPrint = searchQuery ? filteredEntries : safeEntries;
    printService.printHealthConditions(entriesToPrint, 'Health Conditions');
  };

  // Filter entries based on search query
  const filteredEntries = safeEntries.filter((entry) => {
    const query = searchQuery.toLowerCase();
    return (
      entry.condition.toLowerCase().includes(query) ||
      entry.diagnosingDoctorOrAgency?.toLowerCase().includes(query) ||
      entry.symptomology?.toLowerCase().includes(query)
    );
  });

  if (selectedEntry) {
    return (
      <ConditionDetail
        entry={selectedEntry}
        onClose={handleCloseDetail}
        onEdit={handleEdit}
        onDelete={handleDeleteClick}
      />
    );
  }

  if (isCreating || editingEntry) {
    return (
      <ConditionForm
        onSave={handleSave}
        onCancel={handleCancel}
        existingEntry={editingEntry}
      />
    );
  }

  return (
    <div>
      <h4>Conditions</h4>
      <Button onClick={() => setIsCreating(true)}>Add New Condition</Button>
      <SearchBar
        value={searchQuery}
        onChange={setSearchQuery}
        placeholder="Search conditions by name, doctor/agency, symptomology..."
      />
      <ImportExport
        data={safeEntries}
        onImport={handleImport}
        exportFunction={csvService.exportHealthConditionsToCsv}
        importFunction={csvService.importHealthConditionsFromCsv}
        filename={`health-conditions-${new Date().toISOString().split('T')[0]}.csv`}
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
              ? 'No conditions yet. Click "Add New Condition" to get started.'
              : 'No conditions match your search.'}
          </p>
        ) : (
          filteredEntries.map((entry) => (
            <ConditionQuickView
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
        title="Delete Condition"
        footer={
          <>
            <Button onClick={handleDeleteCancel}>Cancel</Button>
            <Button onClick={handleDeleteConfirm} style={{ background: '#dc3545' }}>
              Delete
            </Button>
          </>
        }
      >
        <p>Are you sure you want to delete this condition entry? This action cannot be undone.</p>
      </Modal>
    </div>
  );
};

export default ConditionList;
