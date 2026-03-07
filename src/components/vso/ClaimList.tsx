// src/components/vso/ClaimList.tsx
import React, { useState } from 'react';
import type { VSOClaim, VSOClaimStatus, VSOClaimType } from '../../types/data.types';
import Button from '../common/Button';
import SearchBar from '../common/SearchBar';
import Modal from '../common/Modal';
import ImportExport from '../common/ImportExport';
import ClaimForm from './ClaimForm';
import ClaimQuickView from './ClaimQuickView';
import ClaimDetail from './ClaimDetail';
import { csvService } from '../../services/csv.service';

interface ClaimListProps {
  entries: VSOClaim[];
  setEntries: React.Dispatch<React.SetStateAction<VSOClaim[]>>;
}

const ClaimList: React.FC<ClaimListProps> = ({ entries, setEntries }) => {
  const [selectedEntry, setSelectedEntry] = useState<VSOClaim | null>(null);
  const [editingEntry, setEditingEntry] = useState<VSOClaim | undefined>(undefined);
  const [isCreating, setIsCreating] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<VSOClaimStatus | 'all'>('all');
  const [typeFilter, setTypeFilter] = useState<VSOClaimType | 'all'>('all');
  const [deleteConfirmModal, setDeleteConfirmModal] = useState<{ isOpen: boolean; entryId: string | null }>({
    isOpen: false,
    entryId: null,
  });

  const safeEntries = Array.isArray(entries) ? entries : [];

  const handleSave = (entry: VSOClaim) => {
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

  const handleSelect = (entry: VSOClaim) => {
    setSelectedEntry(entry);
  };

  const handleCloseDetail = () => {
    setSelectedEntry(null);
  };

  const handleEdit = (entry: VSOClaim) => {
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

  const handleImport = async (importedData: VSOClaim[]) => {
    const mergedEntries = [...safeEntries, ...importedData];
    setEntries(mergedEntries);
  };

  const filteredEntries = safeEntries.filter((entry) => {
    const query = searchQuery.toLowerCase();
    const matchesSearch = !searchQuery || (
      entry.claimName.toLowerCase().includes(query) ||
      entry.conditionClaimed.toLowerCase().includes(query) ||
      entry.diagnosticCode.toLowerCase().includes(query) ||
      entry.theoryOfConnection.toLowerCase().includes(query) ||
      entry.assignedVSO?.toLowerCase().includes(query) ||
      entry.notes?.toLowerCase().includes(query)
    );
    const matchesStatus = statusFilter === 'all' || entry.status === statusFilter;
    const matchesType = typeFilter === 'all' || entry.claimType === typeFilter;
    return matchesSearch && matchesStatus && matchesType;
  });

  if (selectedEntry) {
    return (
      <ClaimDetail
        entry={selectedEntry}
        onClose={handleCloseDetail}
        onEdit={handleEdit}
        onDelete={handleDeleteClick}
      />
    );
  }

  if (isCreating || editingEntry) {
    return (
      <ClaimForm
        onSave={handleSave}
        onCancel={handleCancel}
        existingEntry={editingEntry}
      />
    );
  }

  return (
    <div>
      <h4>VSO Claims Tracker</h4>
      <Button onClick={() => setIsCreating(true)}>Add New Claim</Button>
      <SearchBar
        value={searchQuery}
        onChange={setSearchQuery}
        placeholder="Search by name, condition, diagnostic code, VSO..."
      />
      <div style={{ display: 'flex', gap: '10px', marginBottom: '10px', flexWrap: 'wrap' }}>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value as VSOClaimStatus | 'all')}
          style={{ padding: '6px 10px', borderRadius: '4px', border: '1px solid #ccc' }}
        >
          <option value="all">All Statuses</option>
          <option value="planning">Planning</option>
          <option value="intent-filed">Intent Filed</option>
          <option value="filed">Filed</option>
          <option value="pending-development">Pending Development</option>
          <option value="c-and-p-scheduled">C&P Scheduled</option>
          <option value="c-and-p-completed">C&P Completed</option>
          <option value="rating-decision">Rating Decision</option>
          <option value="appealing">Appealing</option>
          <option value="granted">Granted</option>
          <option value="denied">Denied</option>
        </select>
        <select
          value={typeFilter}
          onChange={(e) => setTypeFilter(e.target.value as VSOClaimType | 'all')}
          style={{ padding: '6px 10px', borderRadius: '4px', border: '1px solid #ccc' }}
        >
          <option value="all">All Types</option>
          <option value="direct">Direct</option>
          <option value="secondary">Secondary</option>
          <option value="presumptive">Presumptive</option>
          <option value="aggravation">Aggravation</option>
          <option value="increase">Increase</option>
        </select>
      </div>
      <ImportExport
        data={safeEntries}
        onImport={handleImport}
        exportFunction={csvService.exportVSOClaimsToCsv}
        importFunction={csvService.importVSOClaimsFromCsv}
        filename={`vso-claims-${new Date().toISOString().split('T')[0]}.csv`}
      />
      <div>
        {filteredEntries.length === 0 ? (
          <p style={{ textAlign: 'center', padding: '2rem', color: '#6c757d' }}>
            {safeEntries.length === 0
              ? 'No claims yet. Click "Add New Claim" or import a CSV to get started.'
              : 'No claims match your search/filter.'}
          </p>
        ) : (
          filteredEntries.map((entry) => (
            <ClaimQuickView
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
        title="Delete Claim"
        footer={
          <>
            <Button onClick={handleDeleteCancel}>Cancel</Button>
            <Button onClick={handleDeleteConfirm} style={{ background: '#dc3545' }}>
              Delete
            </Button>
          </>
        }
      >
        <p>Are you sure you want to delete this claim entry? This action cannot be undone.</p>
      </Modal>
    </div>
  );
};

export default ClaimList;
