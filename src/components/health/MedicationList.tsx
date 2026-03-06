// src/components/health/MedicationList.tsx
import React, { useState } from 'react';
import type { HealthMedication, MedicationStatus, MedicationType } from '../../types/data.types';
import Button from '../common/Button';
import SearchBar from '../common/SearchBar';
import Modal from '../common/Modal';
import ImportExport from '../common/ImportExport';
import MedicationForm from './MedicationForm';
import MedicationQuickView from './MedicationQuickView';
import MedicationDetail from './MedicationDetail';
import { csvService } from '../../services/csv.service';
import { printService } from '../../services/print.service';

interface MedicationListProps {
  entries: HealthMedication[];
  setEntries: React.Dispatch<React.SetStateAction<HealthMedication[]>>;
}

const MedicationList: React.FC<MedicationListProps> = ({ entries, setEntries }) => {
  const [selectedEntry, setSelectedEntry] = useState<HealthMedication | null>(null);
  const [editingEntry, setEditingEntry] = useState<HealthMedication | undefined>(undefined);
  const [isCreating, setIsCreating] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<MedicationStatus | 'all'>('all');
  const [typeFilter, setTypeFilter] = useState<MedicationType | 'all'>('all');
  const [deleteConfirmModal, setDeleteConfirmModal] = useState<{ isOpen: boolean; entryId: string | null }>({
    isOpen: false,
    entryId: null,
  });

  const safeEntries = Array.isArray(entries) ? entries : [];

  const handleSave = (entry: HealthMedication) => {
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

  const handleSelect = (entry: HealthMedication) => {
    setSelectedEntry(entry);
  };

  const handleCloseDetail = () => {
    setSelectedEntry(null);
  };

  const handleEdit = (entry: HealthMedication) => {
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

  const handleImport = async (importedData: HealthMedication[]) => {
    const mergedEntries = [...safeEntries, ...importedData];
    setEntries(mergedEntries);
  };

  const handlePrint = () => {
    const entriesToPrint = searchQuery || statusFilter !== 'all' || typeFilter !== 'all' ? filteredEntries : safeEntries;
    printService.printHealthMedications(entriesToPrint, 'Medications & Supplements');
  };

  const filteredEntries = safeEntries.filter((entry) => {
    const query = searchQuery.toLowerCase();
    const matchesSearch = !searchQuery || (
      entry.name.toLowerCase().includes(query) ||
      entry.purpose.toLowerCase().includes(query) ||
      entry.prescriber?.toLowerCase().includes(query) ||
      entry.interactionNotes?.toLowerCase().includes(query)
    );
    const matchesStatus = statusFilter === 'all' || entry.status === statusFilter;
    const matchesType = typeFilter === 'all' || entry.type === typeFilter;
    return matchesSearch && matchesStatus && matchesType;
  });

  if (selectedEntry) {
    return (
      <MedicationDetail
        entry={selectedEntry}
        onClose={handleCloseDetail}
        onEdit={handleEdit}
        onDelete={handleDeleteClick}
      />
    );
  }

  if (isCreating || editingEntry) {
    return (
      <MedicationForm
        onSave={handleSave}
        onCancel={handleCancel}
        existingEntry={editingEntry}
      />
    );
  }

  return (
    <div>
      <h4>Medications & Supplements</h4>
      <Button onClick={() => setIsCreating(true)}>Add New Medication</Button>
      <SearchBar
        value={searchQuery}
        onChange={setSearchQuery}
        placeholder="Search by name, purpose, prescriber..."
      />
      <div style={{ display: 'flex', gap: '10px', marginBottom: '10px', flexWrap: 'wrap' }}>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value as MedicationStatus | 'all')}
          style={{ padding: '6px 10px', borderRadius: '4px', border: '1px solid #ccc' }}
        >
          <option value="all">All Statuses</option>
          <option value="active">Active</option>
          <option value="planned">Planned</option>
          <option value="prn">PRN</option>
          <option value="not-taking">Not Taking</option>
        </select>
        <select
          value={typeFilter}
          onChange={(e) => setTypeFilter(e.target.value as MedicationType | 'all')}
          style={{ padding: '6px 10px', borderRadius: '4px', border: '1px solid #ccc' }}
        >
          <option value="all">All Types</option>
          <option value="prescription">Prescription</option>
          <option value="supplement">Supplement</option>
          <option value="otc">OTC</option>
        </select>
      </div>
      <ImportExport
        data={safeEntries}
        onImport={handleImport}
        exportFunction={csvService.exportHealthMedicationsToCsv}
        importFunction={csvService.importHealthMedicationsFromCsv}
        filename={`health-medications-${new Date().toISOString().split('T')[0]}.csv`}
      />
      {safeEntries.length > 0 && (
        <Button onClick={handlePrint} style={{ marginBottom: '10px' }}>
          Print
        </Button>
      )}
      <div>
        {filteredEntries.length === 0 ? (
          <p style={{ textAlign: 'center', padding: '2rem', color: '#6c757d' }}>
            {safeEntries.length === 0
              ? 'No medications yet. Click "Add New Medication" or import a CSV to get started.'
              : 'No medications match your search/filter.'}
          </p>
        ) : (
          filteredEntries.map((entry) => (
            <MedicationQuickView
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
        title="Delete Medication"
        footer={
          <>
            <Button onClick={handleDeleteCancel}>Cancel</Button>
            <Button onClick={handleDeleteConfirm} style={{ background: '#dc3545' }}>
              Delete
            </Button>
          </>
        }
      >
        <p>Are you sure you want to delete this medication entry? This action cannot be undone.</p>
      </Modal>
    </div>
  );
};

export default MedicationList;
