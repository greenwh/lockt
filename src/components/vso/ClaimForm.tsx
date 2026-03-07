// src/components/vso/ClaimForm.tsx
import React, { useState } from 'react';
import type { VSOClaim, VSOClaimType, VSOClaimTrack, VSOClaimStatus } from '../../types/data.types';
import Button from '../common/Button';
import Input from '../common/Input';
import { v4 as uuidv4 } from 'uuid';

interface ClaimFormProps {
  onSave: (entry: VSOClaim) => void;
  onCancel: () => void;
  existingEntry?: VSOClaim;
}

const ClaimForm: React.FC<ClaimFormProps> = ({ onSave, onCancel, existingEntry }) => {
  const [entry, setEntry] = useState<Omit<VSOClaim, 'id' | 'createdAt' | 'updatedAt'>>(
    existingEntry || {
      claimName: '',
      conditionClaimed: '',
      icd10: '',
      diagnosticCode: '',
      claimType: 'direct' as VSOClaimType,
      claimTrack: 'cervical-spine' as VSOClaimTrack,
      status: 'planning' as VSOClaimStatus,
      theoryOfConnection: '',
      alternativeTheory: '',
      inServiceEvent: '',
      estimatedRating: '',
      currentRating: '',
      effectiveDate: '',
      intentToFileDate: '',
      filingDate: '',
      filingDeadline: '',
      ratingDecisionDate: '',
      linkedConditionIds: '',
      assignedVSO: '',
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
      const finalEntry: VSOClaim = {
        id: existingEntry?.id || uuidv4(),
        ...entry,
        claimType: entry.claimType as VSOClaimType,
        claimTrack: entry.claimTrack as VSOClaimTrack,
        status: entry.status as VSOClaimStatus,
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
      <h4>{existingEntry ? 'Edit Claim' : 'Add Claim'}</h4>
      <Input label="Claim Name" id="claimName" name="claimName" value={entry.claimName} onChange={handleChange} required />
      <Input label="Condition Claimed" id="conditionClaimed" name="conditionClaimed" value={entry.conditionClaimed} onChange={handleChange} required />
      <Input label="ICD-10 Code" id="icd10" name="icd10" value={entry.icd10} onChange={handleChange} required />
      <Input label="Diagnostic Code" id="diagnosticCode" name="diagnosticCode" value={entry.diagnosticCode} onChange={handleChange} required />

      <label htmlFor="claimType">Claim Type</label>
      <select id="claimType" name="claimType" value={entry.claimType} onChange={handleChange}
        style={{ width: '100%', padding: '8px', marginBottom: '10px', borderRadius: '4px', border: '1px solid #ccc' }}>
        <option value="direct">Direct</option>
        <option value="secondary">Secondary</option>
        <option value="presumptive">Presumptive</option>
        <option value="aggravation">Aggravation</option>
        <option value="increase">Increase</option>
      </select>

      <label htmlFor="claimTrack">Claim Track</label>
      <select id="claimTrack" name="claimTrack" value={entry.claimTrack} onChange={handleChange}
        style={{ width: '100%', padding: '8px', marginBottom: '10px', borderRadius: '4px', border: '1px solid #ccc' }}>
        <option value="cervical-spine">Cervical Spine</option>
        <option value="secondary-conditions">Secondary Conditions</option>
        <option value="tera-toxic-exposure">TERA / Toxic Exposure</option>
        <option value="mental-health">Mental Health</option>
        <option value="rating-increase">Rating Increase</option>
      </select>

      <label htmlFor="status">Status</label>
      <select id="status" name="status" value={entry.status} onChange={handleChange}
        style={{ width: '100%', padding: '8px', marginBottom: '10px', borderRadius: '4px', border: '1px solid #ccc' }}>
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

      <label htmlFor="theoryOfConnection">Theory of Connection</label>
      <textarea id="theoryOfConnection" name="theoryOfConnection" value={entry.theoryOfConnection} onChange={handleChange} required
        style={{ width: '100%', minHeight: '80px', marginBottom: '10px' }} />

      <label htmlFor="alternativeTheory">Alternative Theory</label>
      <textarea id="alternativeTheory" name="alternativeTheory" value={entry.alternativeTheory || ''} onChange={handleChange}
        style={{ width: '100%', minHeight: '80px', marginBottom: '10px' }} />

      <label htmlFor="inServiceEvent">In-Service Event</label>
      <textarea id="inServiceEvent" name="inServiceEvent" value={entry.inServiceEvent} onChange={handleChange} required
        style={{ width: '100%', minHeight: '80px', marginBottom: '10px' }} />

      <Input label="Estimated Rating" id="estimatedRating" name="estimatedRating" value={entry.estimatedRating || ''} onChange={handleChange} />
      <Input label="Current Rating" id="currentRating" name="currentRating" value={entry.currentRating || ''} onChange={handleChange} />
      <Input label="Effective Date" id="effectiveDate" name="effectiveDate" value={entry.effectiveDate || ''} onChange={handleChange} />
      <Input label="Intent to File Date" id="intentToFileDate" name="intentToFileDate" value={entry.intentToFileDate || ''} onChange={handleChange} />
      <Input label="Filing Date" id="filingDate" name="filingDate" value={entry.filingDate || ''} onChange={handleChange} />
      <Input label="Filing Deadline" id="filingDeadline" name="filingDeadline" value={entry.filingDeadline || ''} onChange={handleChange} />
      <Input label="Rating Decision Date" id="ratingDecisionDate" name="ratingDecisionDate" value={entry.ratingDecisionDate || ''} onChange={handleChange} />
      <Input label="Linked Condition IDs" id="linkedConditionIds" name="linkedConditionIds" value={entry.linkedConditionIds || ''} onChange={handleChange} />
      <Input label="Assigned VSO" id="assignedVSO" name="assignedVSO" value={entry.assignedVSO || ''} onChange={handleChange} />

      <label htmlFor="notes">Notes</label>
      <textarea id="notes" name="notes" value={entry.notes || ''} onChange={handleChange}
        style={{ width: '100%', minHeight: '80px', marginBottom: '10px' }} />

      <Button type="submit" disabled={isLoading}>
        {isLoading ? 'Saving...' : 'Save Claim'}
      </Button>
      <Button type="button" onClick={onCancel}>Cancel</Button>
    </form>
  );
};

export default ClaimForm;
