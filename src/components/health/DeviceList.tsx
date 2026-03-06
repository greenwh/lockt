// src/components/health/DeviceList.tsx
import React, { useState } from 'react';
import type { HealthDevice } from '../../types/data.types';
import Button from '../common/Button';
import Modal from '../common/Modal';
import ImportExport from '../common/ImportExport';
import DeviceForm from './DeviceForm';
import DeviceCard from './DeviceCard';
import { csvService } from '../../services/csv.service';

interface DeviceListProps {
  entries: HealthDevice[];
  setEntries: React.Dispatch<React.SetStateAction<HealthDevice[]>>;
}

const DeviceList: React.FC<DeviceListProps> = ({ entries, setEntries }) => {
  const [editingEntry, setEditingEntry] = useState<HealthDevice | undefined>(undefined);
  const [isCreating, setIsCreating] = useState(false);
  const [erMode, setErMode] = useState<string | null>(null);
  const [deleteConfirmModal, setDeleteConfirmModal] = useState<{ isOpen: boolean; entryId: string | null }>({
    isOpen: false,
    entryId: null,
  });

  const safeEntries = Array.isArray(entries) ? entries : [];

  const handleSave = (entry: HealthDevice) => {
    const newEntries = safeEntries.findIndex((e) => e.id === entry.id) > -1
      ? safeEntries.map((e) => (e.id === entry.id ? entry : e))
      : [...safeEntries, entry];
    setEntries(newEntries);
    setIsCreating(false);
    setEditingEntry(undefined);
  };

  const handleCancel = () => {
    setIsCreating(false);
    setEditingEntry(undefined);
  };

  const handleEdit = (entry: HealthDevice) => {
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
      setDeleteConfirmModal({ isOpen: false, entryId: null });
    }
  };

  const handleDeleteCancel = () => {
    setDeleteConfirmModal({ isOpen: false, entryId: null });
  };

  const handleImport = async (importedData: HealthDevice[]) => {
    const mergedEntries = [...safeEntries, ...importedData];
    setEntries(mergedEntries);
  };

  if (isCreating || editingEntry) {
    return (
      <DeviceForm
        onSave={handleSave}
        onCancel={handleCancel}
        existingEntry={editingEntry}
      />
    );
  }

  return (
    <div>
      <h4>Device Info</h4>
      <Button onClick={() => setIsCreating(true)}>Add Device</Button>
      <ImportExport
        data={safeEntries}
        onImport={handleImport}
        exportFunction={csvService.exportHealthDevicesToCsv}
        importFunction={csvService.importHealthDevicesFromCsv}
        filename={`health-devices-${new Date().toISOString().split('T')[0]}.csv`}
      />
      <div>
        {safeEntries.length === 0 ? (
          <p style={{ textAlign: 'center', padding: '2rem', color: '#6c757d' }}>
            No devices yet. Click "Add Device" or import a CSV to get started.
          </p>
        ) : (
          safeEntries.map((entry) => (
            <DeviceCard
              key={entry.id}
              entry={entry}
              onEdit={handleEdit}
              onDelete={handleDeleteClick}
              erMode={erMode === entry.id}
              onToggleErMode={() => setErMode(erMode === entry.id ? null : entry.id)}
            />
          ))
        )}
      </div>

      <Modal
        isOpen={deleteConfirmModal.isOpen}
        onClose={handleDeleteCancel}
        title="Delete Device"
        footer={
          <>
            <Button onClick={handleDeleteCancel}>Cancel</Button>
            <Button onClick={handleDeleteConfirm} style={{ background: '#dc3545' }}>
              Delete
            </Button>
          </>
        }
      >
        <p>Are you sure you want to delete this device entry? This action cannot be undone.</p>
      </Modal>
    </div>
  );
};

export default DeviceList;
