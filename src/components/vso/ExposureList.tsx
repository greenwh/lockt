// src/components/vso/ExposureList.tsx
import React, { useState } from 'react';
import type { VSOExposure, VSOExposureType } from '../../types/data.types';
import Button from '../common/Button';
import SearchBar from '../common/SearchBar';
import Modal from '../common/Modal';
import ImportExport from '../common/ImportExport';
import ExposureForm from './ExposureForm';
import ExposureQuickView from './ExposureQuickView';
import ExposureDetail from './ExposureDetail';
import { csvService } from '../../services/csv.service';

interface ExposureListProps {
  entries: VSOExposure[];
  setEntries: React.Dispatch<React.SetStateAction<VSOExposure[]>>;
}

const ExposureList: React.FC<ExposureListProps> = ({ entries, setEntries }) => {
  const [selectedEntry, setSelectedEntry] = useState<VSOExposure | null>(null);
  const [editingEntry, setEditingEntry] = useState<VSOExposure | undefined>(undefined);
  const [isCreating, setIsCreating] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState<VSOExposureType | 'all'>('all');
  const [deleteConfirmModal, setDeleteConfirmModal] = useState<{ isOpen: boolean; entryId: string | null }>({
    isOpen: false,
    entryId: null,
  });

  const safeEntries = Array.isArray(entries) ? entries : [];

  const handleSave = (entry: VSOExposure) => {
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

  const handleSelect = (entry: VSOExposure) => {
    setSelectedEntry(entry);
  };

  const handleCloseDetail = () => {
    setSelectedEntry(null);
  };

  const handleEdit = (entry: VSOExposure) => {
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

  const handleImport = async (importedData: VSOExposure[]) => {
    const mergedEntries = [...safeEntries, ...importedData];
    setEntries(mergedEntries);
  };

  const filteredEntries = safeEntries.filter((entry) => {
    const query = searchQuery.toLowerCase();
    const matchesSearch = !searchQuery || (
      entry.substance.toLowerCase().includes(query) ||
      entry.weaponSystem.toLowerCase().includes(query) ||
      entry.description.toLowerCase().includes(query) ||
      entry.linkedClaimNames.toLowerCase().includes(query) ||
      entry.notes?.toLowerCase().includes(query)
    );
    const matchesType = typeFilter === 'all' || entry.exposureType === typeFilter;
    return matchesSearch && matchesType;
  });

  if (selectedEntry) {
    return (
      <ExposureDetail
        entry={selectedEntry}
        onClose={handleCloseDetail}
        onEdit={handleEdit}
        onDelete={handleDeleteClick}
      />
    );
  }

  if (isCreating || editingEntry) {
    return (
      <ExposureForm
        onSave={handleSave}
        onCancel={handleCancel}
        existingEntry={editingEntry}
      />
    );
  }

  return (
    <div>
      <h4>Exposures Log</h4>
      <Button onClick={() => setIsCreating(true)}>Add New Exposure</Button>
      <SearchBar
        value={searchQuery}
        onChange={setSearchQuery}
        placeholder="Search by substance, weapon system, description..."
      />
      <div style={{ display: 'flex', gap: '10px', marginBottom: '10px', flexWrap: 'wrap' }}>
        <select
          value={typeFilter}
          onChange={(e) => setTypeFilter(e.target.value as VSOExposureType | 'all')}
          style={{ padding: '6px 10px', borderRadius: '4px', border: '1px solid #ccc' }}
        >
          <option value="all">All Types</option>
          <option value="rf-radiation">RF/Microwave Radiation</option>
          <option value="chemical">Chemical</option>
          <option value="fuel">Fuel</option>
          <option value="paint">Paint/Coating</option>
          <option value="solvent">Solvent</option>
          <option value="particulate">Particulate</option>
          <option value="noise">Noise</option>
          <option value="nuclear">Nuclear/Ionizing</option>
          <option value="other">Other</option>
        </select>
      </div>
      <ImportExport
        data={safeEntries}
        onImport={handleImport}
        exportFunction={csvService.exportVSOExposuresToCsv}
        importFunction={csvService.importVSOExposuresFromCsv}
        filename={`vso-exposures-${new Date().toISOString().split('T')[0]}.csv`}
      />
      <div>
        {filteredEntries.length === 0 ? (
          <p style={{ textAlign: 'center', padding: '2rem', color: '#6c757d' }}>
            {safeEntries.length === 0
              ? 'No exposures yet. Click "Add New Exposure" or import a CSV to get started.'
              : 'No exposures match your search/filter.'}
          </p>
        ) : (
          filteredEntries.map((entry) => (
            <ExposureQuickView
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
        title="Delete Exposure"
        footer={
          <>
            <Button onClick={handleDeleteCancel}>Cancel</Button>
            <Button onClick={handleDeleteConfirm} style={{ background: '#dc3545' }}>
              Delete
            </Button>
          </>
        }
      >
        <p>Are you sure you want to delete this exposure entry? This action cannot be undone.</p>
      </Modal>
    </div>
  );
};

export default ExposureList;
