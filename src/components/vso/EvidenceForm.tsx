// src/components/vso/EvidenceForm.tsx
import React, { useState } from 'react';
import type { VSOEvidence, VSOEvidenceType, VSOEvidenceStatus, VSOEvidencePriority } from '../../types/data.types';
import Button from '../common/Button';
import Input from '../common/Input';
import { v4 as uuidv4 } from 'uuid';

interface EvidenceFormProps {
  onSave: (entry: VSOEvidence) => void;
  onCancel: () => void;
  existingEntry?: VSOEvidence;
}

const EvidenceForm: React.FC<EvidenceFormProps> = ({ onSave, onCancel, existingEntry }) => {
  const [entry, setEntry] = useState<Omit<VSOEvidence, 'id' | 'createdAt' | 'updatedAt'>>(
    existingEntry || {
      evidenceName: '',
      evidenceType: 'medical-record' as VSOEvidenceType,
      status: 'needed' as VSOEvidenceStatus,
      priority: 'moderate' as VSOEvidencePriority,
      linkedClaimNames: '',
      source: '',
      dateOfEvidence: '',
      dateObtained: '',
      dateSubmitted: '',
      description: '',
      relevanceNotes: '',
      location: '',
      gapNotes: '',
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
      const finalEntry: VSOEvidence = {
        id: existingEntry?.id || uuidv4(),
        ...entry,
        evidenceType: entry.evidenceType as VSOEvidenceType,
        status: entry.status as VSOEvidenceStatus,
        priority: entry.priority as VSOEvidencePriority,
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
      <h4>{existingEntry ? 'Edit Evidence' : 'Add Evidence'}</h4>
      <Input label="Evidence Name" id="evidenceName" name="evidenceName" value={entry.evidenceName} onChange={handleChange} required />

      <label htmlFor="evidenceType">Evidence Type</label>
      <select id="evidenceType" name="evidenceType" value={entry.evidenceType} onChange={handleChange}
        style={{ width: '100%', padding: '8px', marginBottom: '10px', borderRadius: '4px', border: '1px solid #ccc' }}>
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

      <label htmlFor="status">Status</label>
      <select id="status" name="status" value={entry.status} onChange={handleChange}
        style={{ width: '100%', padding: '8px', marginBottom: '10px', borderRadius: '4px', border: '1px solid #ccc' }}>
        <option value="obtained">Obtained</option>
        <option value="pending-request">Pending Request</option>
        <option value="needed">Needed</option>
        <option value="in-progress">In Progress</option>
        <option value="submitted-to-va">Submitted to VA</option>
      </select>

      <label htmlFor="priority">Priority</label>
      <select id="priority" name="priority" value={entry.priority} onChange={handleChange}
        style={{ width: '100%', padding: '8px', marginBottom: '10px', borderRadius: '4px', border: '1px solid #ccc' }}>
        <option value="critical">Critical</option>
        <option value="high">High</option>
        <option value="moderate">Moderate</option>
        <option value="low">Low</option>
      </select>

      <Input label="Linked Claim Names" id="linkedClaimNames" name="linkedClaimNames" value={entry.linkedClaimNames} onChange={handleChange} required />
      <Input label="Source" id="source" name="source" value={entry.source} onChange={handleChange} required />

      <label htmlFor="description">Description</label>
      <textarea id="description" name="description" value={entry.description} onChange={handleChange} required
        style={{ width: '100%', minHeight: '80px', marginBottom: '10px' }} />

      <Input label="Date of Evidence" id="dateOfEvidence" name="dateOfEvidence" value={entry.dateOfEvidence || ''} onChange={handleChange} />
      <Input label="Date Obtained" id="dateObtained" name="dateObtained" value={entry.dateObtained || ''} onChange={handleChange} />
      <Input label="Date Submitted" id="dateSubmitted" name="dateSubmitted" value={entry.dateSubmitted || ''} onChange={handleChange} />
      <Input label="Location" id="location" name="location" value={entry.location || ''} onChange={handleChange} />

      <label htmlFor="relevanceNotes">Relevance Notes</label>
      <textarea id="relevanceNotes" name="relevanceNotes" value={entry.relevanceNotes || ''} onChange={handleChange}
        style={{ width: '100%', minHeight: '80px', marginBottom: '10px' }} />

      <label htmlFor="gapNotes">Gap Notes</label>
      <textarea id="gapNotes" name="gapNotes" value={entry.gapNotes || ''} onChange={handleChange}
        style={{ width: '100%', minHeight: '80px', marginBottom: '10px' }} />

      <label htmlFor="notes">Notes</label>
      <textarea id="notes" name="notes" value={entry.notes || ''} onChange={handleChange}
        style={{ width: '100%', minHeight: '80px', marginBottom: '10px' }} />

      <Button type="submit" disabled={isLoading}>
        {isLoading ? 'Saving...' : 'Save Evidence'}
      </Button>
      <Button type="button" onClick={onCancel}>Cancel</Button>
    </form>
  );
};

export default EvidenceForm;
