// src/components/health/EmergencyForm.tsx
import React, { useState } from 'react';
import type { HealthEmergency } from '../../types/data.types';
import Button from '../common/Button';
import Input from '../common/Input';
import { v4 as uuidv4 } from 'uuid';

interface EmergencyFormProps {
  onSave: (entry: HealthEmergency) => void;
  onCancel: () => void;
  existingEntry?: HealthEmergency;
}

const EmergencyForm: React.FC<EmergencyFormProps> = ({ onSave, onCancel, existingEntry }) => {
  const [entry, setEntry] = useState<Omit<HealthEmergency, 'id' | 'createdAt' | 'updatedAt'>>(
    existingEntry || {
      fullName: '',
      dateOfBirth: '',
      bloodType: '',
      allergies: 'NKA',
      emergencyContact1Name: '',
      emergencyContact1Relationship: '',
      emergencyContact1Phone: '',
      emergencyContact2Name: '',
      emergencyContact2Relationship: '',
      emergencyContact2Phone: '',
      primaryCarePhysician: '',
      primaryCarePhone: '',
      insurancePrimary: '',
      insurancePrimaryId: '',
      insuranceSecondary: '',
      insuranceSecondaryId: '',
      advanceDirective: undefined,
      advanceDirectiveLocation: '',
      dnrStatus: '',
      specialInstructions: '',
    }
  );

  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setEntry((prev) => ({ ...prev, [name]: value }));
  };

  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = e.target;
    setEntry((prev) => ({ ...prev, [name]: checked }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const now = Date.now();
      const finalEntry: HealthEmergency = {
        id: existingEntry?.id || uuidv4(),
        ...entry,
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
      <h4>{existingEntry ? 'Edit Emergency Info' : 'Set Up Emergency Card'}</h4>

      <h5>Patient Information</h5>
      <Input label="Full Name" id="fullName" name="fullName" value={entry.fullName} onChange={handleChange} required />
      <Input label="Date of Birth" id="dateOfBirth" name="dateOfBirth" type="date" value={entry.dateOfBirth} onChange={handleChange} required />
      <Input label="Blood Type" id="bloodType" name="bloodType" value={entry.bloodType || ''} onChange={handleChange} />
      <Input label="Allergies" id="allergies" name="allergies" value={entry.allergies} onChange={handleChange} required />

      <h5>Emergency Contact 1</h5>
      <Input label="Name" id="emergencyContact1Name" name="emergencyContact1Name" value={entry.emergencyContact1Name} onChange={handleChange} required />
      <Input label="Relationship" id="emergencyContact1Relationship" name="emergencyContact1Relationship" value={entry.emergencyContact1Relationship} onChange={handleChange} required />
      <Input label="Phone" id="emergencyContact1Phone" name="emergencyContact1Phone" value={entry.emergencyContact1Phone} onChange={handleChange} required />

      <h5>Emergency Contact 2</h5>
      <Input label="Name" id="emergencyContact2Name" name="emergencyContact2Name" value={entry.emergencyContact2Name || ''} onChange={handleChange} />
      <Input label="Relationship" id="emergencyContact2Relationship" name="emergencyContact2Relationship" value={entry.emergencyContact2Relationship || ''} onChange={handleChange} />
      <Input label="Phone" id="emergencyContact2Phone" name="emergencyContact2Phone" value={entry.emergencyContact2Phone || ''} onChange={handleChange} />

      <h5>Primary Care</h5>
      <Input label="Physician" id="primaryCarePhysician" name="primaryCarePhysician" value={entry.primaryCarePhysician} onChange={handleChange} required />
      <Input label="Phone" id="primaryCarePhone" name="primaryCarePhone" value={entry.primaryCarePhone} onChange={handleChange} required />

      <h5>Insurance</h5>
      <Input label="Primary Insurance" id="insurancePrimary" name="insurancePrimary" value={entry.insurancePrimary || ''} onChange={handleChange} />
      <Input label="Primary ID" id="insurancePrimaryId" name="insurancePrimaryId" value={entry.insurancePrimaryId || ''} onChange={handleChange} />
      <Input label="Secondary Insurance" id="insuranceSecondary" name="insuranceSecondary" value={entry.insuranceSecondary || ''} onChange={handleChange} />
      <Input label="Secondary ID" id="insuranceSecondaryId" name="insuranceSecondaryId" value={entry.insuranceSecondaryId || ''} onChange={handleChange} />

      <h5>Advance Directive</h5>
      <div style={{ marginBottom: '10px' }}>
        <label style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <input type="checkbox" name="advanceDirective" checked={entry.advanceDirective || false} onChange={handleCheckboxChange} />
          Has Advance Directive on File
        </label>
      </div>
      <Input label="Directive Location" id="advanceDirectiveLocation" name="advanceDirectiveLocation" value={entry.advanceDirectiveLocation || ''} onChange={handleChange} />
      <Input label="DNR Status" id="dnrStatus" name="dnrStatus" value={entry.dnrStatus || ''} onChange={handleChange} />

      <label htmlFor="specialInstructions">Special Instructions</label>
      <textarea id="specialInstructions" name="specialInstructions" value={entry.specialInstructions || ''} onChange={handleChange}
        style={{ width: '100%', minHeight: '100px', marginBottom: '10px' }} />

      <Button type="submit" disabled={isLoading}>
        {isLoading ? 'Saving...' : 'Save Emergency Info'}
      </Button>
      <Button type="button" onClick={onCancel}>Cancel</Button>
    </form>
  );
};

export default EmergencyForm;
