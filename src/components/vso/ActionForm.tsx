// src/components/vso/ActionForm.tsx
import React, { useState } from 'react';
import type { VSOAction, VSOActionPhase, VSOActionPriority, VSOActionStatus } from '../../types/data.types';
import Button from '../common/Button';
import Input from '../common/Input';
import { v4 as uuidv4 } from 'uuid';

interface ActionFormProps {
  onSave: (entry: VSOAction) => void;
  onCancel: () => void;
  existingEntry?: VSOAction;
}

const ActionForm: React.FC<ActionFormProps> = ({ onSave, onCancel, existingEntry }) => {
  const [entry, setEntry] = useState<Omit<VSOAction, 'id' | 'createdAt' | 'updatedAt'>>(
    existingEntry || {
      actionItem: '',
      phase: 'phase-1-foundation' as VSOActionPhase,
      priority: 'moderate' as VSOActionPriority,
      status: 'not-started' as VSOActionStatus,
      dueDate: '',
      completedDate: '',
      linkedClaimNames: '',
      linkedEvidenceNames: '',
      dependsOn: '',
      assignedTo: '',
      notes: '',
    }
  );

  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setEntry((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const now = Date.now();
      const finalEntry: VSOAction = {
        id: existingEntry?.id || uuidv4(),
        ...entry,
        phase: entry.phase as VSOActionPhase,
        priority: entry.priority as VSOActionPriority,
        status: entry.status as VSOActionStatus,
        createdAt: existingEntry?.createdAt || now,
        updatedAt: now,
      };
      onSave(finalEntry);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <h4>{existingEntry ? 'Edit Action Item' : 'Add Action Item'}</h4>
      <Input label="Action Item" id="actionItem" name="actionItem" value={entry.actionItem} onChange={handleChange} required />

      <label htmlFor="phase">Phase</label>
      <select id="phase" name="phase" value={entry.phase} onChange={handleChange}
        style={{ width: '100%', padding: '8px', marginBottom: '10px', borderRadius: '4px', border: '1px solid #ccc' }}>
        <option value="phase-1-foundation">Phase 1: Foundation</option>
        <option value="phase-2-evidence">Phase 2: Evidence</option>
        <option value="phase-3-nexus">Phase 3: Nexus</option>
        <option value="phase-4-filing">Phase 4: Filing</option>
        <option value="ongoing">Ongoing</option>
      </select>

      <label htmlFor="priority">Priority</label>
      <select id="priority" name="priority" value={entry.priority} onChange={handleChange}
        style={{ width: '100%', padding: '8px', marginBottom: '10px', borderRadius: '4px', border: '1px solid #ccc' }}>
        <option value="critical">Critical</option>
        <option value="high">High</option>
        <option value="moderate">Moderate</option>
        <option value="low">Low</option>
      </select>

      <label htmlFor="status">Status</label>
      <select id="status" name="status" value={entry.status} onChange={handleChange}
        style={{ width: '100%', padding: '8px', marginBottom: '10px', borderRadius: '4px', border: '1px solid #ccc' }}>
        <option value="not-started">Not Started</option>
        <option value="in-progress">In Progress</option>
        <option value="blocked">Blocked</option>
        <option value="completed">Completed</option>
      </select>

      <Input label="Due Date" id="dueDate" name="dueDate" value={entry.dueDate || ''} onChange={handleChange} />
      <Input label="Completed Date" id="completedDate" name="completedDate" value={entry.completedDate || ''} onChange={handleChange} />
      <Input label="Linked Claims" id="linkedClaimNames" name="linkedClaimNames" value={entry.linkedClaimNames || ''} onChange={handleChange} />
      <Input label="Linked Evidence" id="linkedEvidenceNames" name="linkedEvidenceNames" value={entry.linkedEvidenceNames || ''} onChange={handleChange} />
      <Input label="Assigned To" id="assignedTo" name="assignedTo" value={entry.assignedTo || ''} onChange={handleChange} />

      <label htmlFor="dependsOn">Dependencies</label>
      <textarea id="dependsOn" name="dependsOn" value={entry.dependsOn || ''} onChange={handleChange}
        style={{ width: '100%', minHeight: '80px', marginBottom: '10px' }} />

      <label htmlFor="notes">Notes</label>
      <textarea id="notes" name="notes" value={entry.notes || ''} onChange={handleChange}
        style={{ width: '100%', minHeight: '80px', marginBottom: '10px' }} />

      <Button type="submit" disabled={isLoading}>
        {isLoading ? 'Saving...' : 'Save Action Item'}
      </Button>
      <Button type="button" onClick={onCancel}>Cancel</Button>
    </form>
  );
};

export default ActionForm;
