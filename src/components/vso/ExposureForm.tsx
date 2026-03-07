// src/components/vso/ExposureForm.tsx
import React, { useState } from 'react';
import type { VSOExposure, VSOExposureType } from '../../types/data.types';
import Button from '../common/Button';
import Input from '../common/Input';
import { v4 as uuidv4 } from 'uuid';

interface ExposureFormProps {
  onSave: (entry: VSOExposure) => void;
  onCancel: () => void;
  existingEntry?: VSOExposure;
}

const ExposureForm: React.FC<ExposureFormProps> = ({ onSave, onCancel, existingEntry }) => {
  const [entry, setEntry] = useState<Omit<VSOExposure, 'id' | 'createdAt' | 'updatedAt'>>(
    existingEntry || {
      exposureType: 'chemical' as VSOExposureType,
      substance: '',
      weaponSystem: '',
      mosAtTimeOfExposure: '',
      description: '',
      frequency: '',
      duration: '',
      ppeProvided: '',
      healthEffectPathway: '',
      linkedClaimNames: '',
      witnessAvailable: false,
      notes: '',
    }
  );

  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setEntry((prev) => ({ ...prev, [name]: checked }));
    } else {
      setEntry((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const now = Date.now();
      const finalEntry: VSOExposure = {
        id: existingEntry?.id || uuidv4(),
        ...entry,
        exposureType: entry.exposureType as VSOExposureType,
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
      <h4>{existingEntry ? 'Edit Exposure' : 'Add Exposure'}</h4>

      <label htmlFor="exposureType">Exposure Type</label>
      <select id="exposureType" name="exposureType" value={entry.exposureType} onChange={handleChange}
        style={{ width: '100%', padding: '8px', marginBottom: '10px', borderRadius: '4px', border: '1px solid #ccc' }}>
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

      <Input label="Substance" id="substance" name="substance" value={entry.substance} onChange={handleChange} required />
      <Input label="Weapon System" id="weaponSystem" name="weaponSystem" value={entry.weaponSystem} onChange={handleChange} required />
      <Input label="MOS at Time of Exposure" id="mosAtTimeOfExposure" name="mosAtTimeOfExposure" value={entry.mosAtTimeOfExposure || ''} onChange={handleChange} />

      <label htmlFor="description">Description</label>
      <textarea id="description" name="description" value={entry.description} onChange={handleChange} required
        style={{ width: '100%', minHeight: '80px', marginBottom: '10px' }} />

      <Input label="Frequency" id="frequency" name="frequency" value={entry.frequency} onChange={handleChange} required />
      <Input label="Duration" id="duration" name="duration" value={entry.duration} onChange={handleChange} required />
      <Input label="PPE Provided" id="ppeProvided" name="ppeProvided" value={entry.ppeProvided} onChange={handleChange} required />

      <label htmlFor="healthEffectPathway">Health Effect Pathway</label>
      <textarea id="healthEffectPathway" name="healthEffectPathway" value={entry.healthEffectPathway || ''} onChange={handleChange}
        style={{ width: '100%', minHeight: '80px', marginBottom: '10px' }} />

      <Input label="Linked Claim Names" id="linkedClaimNames" name="linkedClaimNames" value={entry.linkedClaimNames} onChange={handleChange} required />

      <div style={{ marginBottom: '10px' }}>
        <label htmlFor="witnessAvailable" style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
          <input
            type="checkbox"
            id="witnessAvailable"
            name="witnessAvailable"
            checked={entry.witnessAvailable || false}
            onChange={handleChange}
          />
          Witness Available
        </label>
      </div>

      <label htmlFor="notes">Notes</label>
      <textarea id="notes" name="notes" value={entry.notes || ''} onChange={handleChange}
        style={{ width: '100%', minHeight: '80px', marginBottom: '10px' }} />

      <Button type="submit" disabled={isLoading}>
        {isLoading ? 'Saving...' : 'Save Exposure'}
      </Button>
      <Button type="button" onClick={onCancel}>Cancel</Button>
    </form>
  );
};

export default ExposureForm;
