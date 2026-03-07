// src/components/vso/EvidenceList.tsx
import React, { useState } from 'react';
import type { VSOEvidence, VSOEvidenceStatus, VSOEvidencePriority, VSOEvidenceType } from '../../types/data.types';
import Button from '../common/Button';
import SearchBar from '../common/SearchBar';
import Modal from '../common/Modal';
import ImportExport from '../common/ImportExport';
import EvidenceForm from './EvidenceForm';
import EvidenceQuickView from './EvidenceQuickView';
import EvidenceDetail from './EvidenceDetail';
import { csvService } from '../../services/csv.service';

interface EvidenceListProps {
  entries: VSOEvidence[];
  setEntries: React.Dispatch<React.SetStateAction<VSOEvidence[]>>;
}

const EvidenceList: React.FC<EvidenceListProps> = ({ entries, setEntries }) => {
  const [selectedEntry, setSelectedEntry] = useState<VSOEvidence | null>(null);
  const [editingEntry, setEditingEntry] = useState<VSOEvidence | undefined>(undefined);
  const [isCreating, setIsCreating] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<VSOEvidenceStatus | 'all'>('all');
  const [priorityFilter, setPriorityFilter] = useState<VSOEvidencePriority | 'all'>('all');
  const [typeFilter, setTypeFilter] = useState<VSOEvidenceType | 'all'>('all');
  const [deleteConfirmModal, setDeleteConfirmModal] = useState<{ isOpen: boolean; entryId: string | null }>({
    isOpen: false,
    entryId: null,
  });

  const safeEntries = Array.isArray(entries) ? entries : [];

  const handleSave = (entry: VSOEvidence) => {
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

  const handleSelect = (entry: VSOEvidence) => {
    setSelectedEntry(entry);
  };

  const handleCloseDetail = () => {
    setSelectedEntry(null);
  };

  const handleEdit = (entry: VSOEvidence) => {
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

  const handleImport = async (importedData: VSOEvidence[]) => {
    const mergedEntries = [...safeEntries, ...importedData];
    setEntries(mergedEntries);
  };

  const filteredEntries = safeEntries.filter((entry) => {
    const query = searchQuery.toLowerCase();
    const matchesSearch = !searchQuery || (
      entry.evidenceName.toLowerCase().includes(query) ||
      entry.description.toLowerCase().includes(query) ||
      entry.linkedClaimNames.toLowerCase().includes(query) ||
      entry.source.toLowerCase().includes(query) ||
      entry.relevanceNotes?.toLowerCase().includes(query) ||
      entry.gapNotes?.toLowerCase().includes(query)
    );
    const matchesStatus = statusFilter === 'all' || entry.status === statusFilter;
    const matchesPriority = priorityFilter === 'all' || entry.priority === priorityFilter;
    const matchesType = typeFilter === 'all' || entry.evidenceType === typeFilter;
    return matchesSearch && matchesStatus && matchesPriority && matchesType;
  });

  if (selectedEntry) {
    return (
      <EvidenceDetail
        entry={selectedEntry}
        onClose={handleCloseDetail}
        onEdit={handleEdit}
        onDelete={handleDeleteClick}
      />
    );
  }

  if (isCreating || editingEntry) {
    return (
      <EvidenceForm
        onSave={handleSave}
        onCancel={handleCancel}
        existingEntry={editingEntry}
      />
    );
  }

  return (
    <div>
      <h4>VSO Evidence Tracker</h4>
      <Button onClick={() => setIsCreating(true)}>Add New Evidence</Button>
      <SearchBar
        value={searchQuery}
        onChange={setSearchQuery}
        placeholder="Search by name, description, claims, source..."
      />
      <div style={{ display: 'flex', gap: '10px', marginBottom: '10px', flexWrap: 'wrap' }}>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value as VSOEvidenceStatus | 'all')}
          style={{ padding: '6px 10px', borderRadius: '4px', border: '1px solid #ccc' }}
        >
          <option value="all">All Statuses</option>
          <option value="obtained">Obtained</option>
          <option value="pending-request">Pending Request</option>
          <option value="needed">Needed</option>
          <option value="in-progress">In Progress</option>
          <option value="submitted-to-va">Submitted to VA</option>
        </select>
        <select
          value={priorityFilter}
          onChange={(e) => setPriorityFilter(e.target.value as VSOEvidencePriority | 'all')}
          style={{ padding: '6px 10px', borderRadius: '4px', border: '1px solid #ccc' }}
        >
          <option value="all">All Priorities</option>
          <option value="critical">Critical</option>
          <option value="high">High</option>
          <option value="moderate">Moderate</option>
          <option value="low">Low</option>
        </select>
        <select
          value={typeFilter}
          onChange={(e) => setTypeFilter(e.target.value as VSOEvidenceType | 'all')}
          style={{ padding: '6px 10px', borderRadius: '4px', border: '1px solid #ccc' }}
        >
          <option value="all">All Types</option>
          <option value="medical-record">Medical Record</option>
          <option value="imaging">Imaging</option>
          <option value="lab-result">Lab Result</option>
          <option value="pft">PFT</option>
          <option value="personal-statement">Personal Statement</option>
          <option value="buddy-statement">Buddy Statement</option>
          <option value="nexus-opinion">Nexus Opinion</option>
          <option value="military-record">Military Record</option>
          <option value="va-record">VA Record</option>
          <option value="research-literature">Research Literature</option>
          <option value="va-form">VA Form</option>
          <option value="other">Other</option>
        </select>
      </div>
      <ImportExport
        data={safeEntries}
        onImport={handleImport}
        exportFunction={csvService.exportVSOEvidenceToCsv}
        importFunction={csvService.importVSOEvidenceFromCsv}
        filename={`vso-evidence-${new Date().toISOString().split('T')[0]}.csv`}
      />
      <div>
        {filteredEntries.length === 0 ? (
          <p style={{ textAlign: 'center', padding: '2rem', color: '#6c757d' }}>
            {safeEntries.length === 0
              ? 'No evidence yet. Click "Add New Evidence" or import a CSV to get started.'
              : 'No evidence matches your search/filter.'}
          </p>
        ) : (
          filteredEntries.map((entry) => (
            <EvidenceQuickView
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
        title="Delete Evidence"
        footer={
          <>
            <Button onClick={handleDeleteCancel}>Cancel</Button>
            <Button onClick={handleDeleteConfirm} style={{ background: '#dc3545' }}>
              Delete
            </Button>
          </>
        }
      >
        <p>Are you sure you want to delete this evidence entry? This action cannot be undone.</p>
      </Modal>
    </div>
  );
};

export default EvidenceList;
