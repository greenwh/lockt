// src/components/vso/ActionList.tsx
import React, { useState } from 'react';
import type { VSOAction, VSOActionStatus, VSOActionPhase, VSOActionPriority } from '../../types/data.types';
import Button from '../common/Button';
import SearchBar from '../common/SearchBar';
import Modal from '../common/Modal';
import ImportExport from '../common/ImportExport';
import ActionForm from './ActionForm';
import ActionQuickView from './ActionQuickView';
import ActionDetail from './ActionDetail';
import { csvService } from '../../services/csv.service';

interface ActionListProps {
  entries: VSOAction[];
  setEntries: React.Dispatch<React.SetStateAction<VSOAction[]>>;
}

const ActionList: React.FC<ActionListProps> = ({ entries, setEntries }) => {
  const [selectedEntry, setSelectedEntry] = useState<VSOAction | null>(null);
  const [editingEntry, setEditingEntry] = useState<VSOAction | undefined>(undefined);
  const [isCreating, setIsCreating] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<VSOActionStatus | 'all'>('all');
  const [phaseFilter, setPhaseFilter] = useState<VSOActionPhase | 'all'>('all');
  const [priorityFilter, setPriorityFilter] = useState<VSOActionPriority | 'all'>('all');
  const [deleteConfirmModal, setDeleteConfirmModal] = useState<{ isOpen: boolean; entryId: string | null }>({
    isOpen: false,
    entryId: null,
  });

  const safeEntries = Array.isArray(entries) ? entries : [];

  const handleSave = (entry: VSOAction) => {
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

  const handleSelect = (entry: VSOAction) => {
    setSelectedEntry(entry);
  };

  const handleCloseDetail = () => {
    setSelectedEntry(null);
  };

  const handleEdit = (entry: VSOAction) => {
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

  const handleImport = async (importedData: VSOAction[]) => {
    const mergedEntries = [...safeEntries, ...importedData];
    setEntries(mergedEntries);
  };

  const filteredEntries = safeEntries.filter((entry) => {
    const query = searchQuery.toLowerCase();
    const matchesSearch = !searchQuery || (
      entry.actionItem.toLowerCase().includes(query) ||
      entry.linkedClaimNames?.toLowerCase().includes(query) ||
      entry.linkedEvidenceNames?.toLowerCase().includes(query) ||
      entry.assignedTo?.toLowerCase().includes(query) ||
      entry.notes?.toLowerCase().includes(query)
    );
    const matchesStatus = statusFilter === 'all' || entry.status === statusFilter;
    const matchesPhase = phaseFilter === 'all' || entry.phase === phaseFilter;
    const matchesPriority = priorityFilter === 'all' || entry.priority === priorityFilter;
    return matchesSearch && matchesStatus && matchesPhase && matchesPriority;
  });

  if (selectedEntry) {
    return (
      <ActionDetail
        entry={selectedEntry}
        onClose={handleCloseDetail}
        onEdit={handleEdit}
        onDelete={handleDeleteClick}
      />
    );
  }

  if (isCreating || editingEntry) {
    return (
      <ActionForm
        onSave={handleSave}
        onCancel={handleCancel}
        existingEntry={editingEntry}
      />
    );
  }

  return (
    <div>
      <h4>VSO Action Items</h4>
      <Button onClick={() => setIsCreating(true)}>Add New Action Item</Button>
      <SearchBar
        value={searchQuery}
        onChange={setSearchQuery}
        placeholder="Search by action, claims, evidence, assigned to..."
      />
      <div style={{ display: 'flex', gap: '10px', marginBottom: '10px', flexWrap: 'wrap' }}>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value as VSOActionStatus | 'all')}
          style={{ padding: '6px 10px', borderRadius: '4px', border: '1px solid #ccc' }}
        >
          <option value="all">All Statuses</option>
          <option value="not-started">Not Started</option>
          <option value="in-progress">In Progress</option>
          <option value="blocked">Blocked</option>
          <option value="completed">Completed</option>
        </select>
        <select
          value={phaseFilter}
          onChange={(e) => setPhaseFilter(e.target.value as VSOActionPhase | 'all')}
          style={{ padding: '6px 10px', borderRadius: '4px', border: '1px solid #ccc' }}
        >
          <option value="all">All Phases</option>
          <option value="phase-1-foundation">Phase 1: Foundation</option>
          <option value="phase-2-evidence">Phase 2: Evidence</option>
          <option value="phase-3-nexus">Phase 3: Nexus</option>
          <option value="phase-4-filing">Phase 4: Filing</option>
          <option value="ongoing">Ongoing</option>
        </select>
        <select
          value={priorityFilter}
          onChange={(e) => setPriorityFilter(e.target.value as VSOActionPriority | 'all')}
          style={{ padding: '6px 10px', borderRadius: '4px', border: '1px solid #ccc' }}
        >
          <option value="all">All Priorities</option>
          <option value="critical">Critical</option>
          <option value="high">High</option>
          <option value="moderate">Moderate</option>
          <option value="low">Low</option>
        </select>
      </div>
      <ImportExport
        data={safeEntries}
        onImport={handleImport}
        exportFunction={csvService.exportVSOActionsToCsv}
        importFunction={csvService.importVSOActionsFromCsv}
        filename={`vso-actions-${new Date().toISOString().split('T')[0]}.csv`}
      />
      <div>
        {filteredEntries.length === 0 ? (
          <p style={{ textAlign: 'center', padding: '2rem', color: '#6c757d' }}>
            {safeEntries.length === 0
              ? 'No action items yet. Click "Add New Action Item" or import a CSV to get started.'
              : 'No action items match your search/filter.'}
          </p>
        ) : (
          filteredEntries.map((entry) => (
            <ActionQuickView
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
        title="Delete Action Item"
        footer={
          <>
            <Button onClick={handleDeleteCancel}>Cancel</Button>
            <Button onClick={handleDeleteConfirm} style={{ background: '#dc3545' }}>
              Delete
            </Button>
          </>
        }
      >
        <p>Are you sure you want to delete this action item? This action cannot be undone.</p>
      </Modal>
    </div>
  );
};

export default ActionList;
