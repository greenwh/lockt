// src/components/health/DeviceForm.tsx
import React, { useState } from 'react';
import type { HealthDevice } from '../../types/data.types';
import Button from '../common/Button';
import Input from '../common/Input';
import { v4 as uuidv4 } from 'uuid';

interface DeviceFormProps {
  onSave: (entry: HealthDevice) => void;
  onCancel: () => void;
  existingEntry?: HealthDevice;
}

const DeviceForm: React.FC<DeviceFormProps> = ({ onSave, onCancel, existingEntry }) => {
  const [entry, setEntry] = useState<Omit<HealthDevice, 'id' | 'createdAt' | 'updatedAt'>>(
    existingEntry || {
      deviceName: '',
      manufacturer: '',
      model: '',
      serialNumber: '',
      deviceType: '',
      implantDate: '',
      implantingPhysician: '',
      implantLocation: '',
      indication: '',
      pacingMode: '',
      lowerRate: 60,
      upperTrackingRate: 105,
      upperActivityRate: undefined,
      rvThreshold: '',
      rvSensing: '',
      impedance: '',
      batteryLife: '',
      lastCheck: '',
      lastRemoteUpload: '',
      mriCompatible: false,
      medtronicRep: '',
      medtronicRepPhone: '',
      managingPhysician: '',
      managingPhysicianPhone: '',
      notes: '',
    }
  );

  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    if (type === 'checkbox') {
      setEntry((prev) => ({ ...prev, [name]: (e.target as HTMLInputElement).checked }));
    } else if (type === 'number') {
      setEntry((prev) => ({ ...prev, [name]: value ? parseInt(value, 10) : undefined }));
    } else {
      setEntry((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const now = Date.now();
      const finalEntry: HealthDevice = {
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
      <h4>{existingEntry ? 'Edit Device' : 'Add Device'}</h4>
      <Input label="Device Name" id="deviceName" name="deviceName" value={entry.deviceName} onChange={handleChange} required />
      <Input label="Manufacturer" id="manufacturer" name="manufacturer" value={entry.manufacturer} onChange={handleChange} required />
      <Input label="Model" id="model" name="model" value={entry.model} onChange={handleChange} required />
      <Input label="Serial Number" id="serialNumber" name="serialNumber" value={entry.serialNumber} onChange={handleChange} required />
      <Input label="Device Type" id="deviceType" name="deviceType" value={entry.deviceType} onChange={handleChange} required />
      <Input label="Implant Date" id="implantDate" name="implantDate" value={entry.implantDate} onChange={handleChange} required />
      <Input label="Implanting Physician" id="implantingPhysician" name="implantingPhysician" value={entry.implantingPhysician} onChange={handleChange} required />
      <Input label="Implant Location" id="implantLocation" name="implantLocation" value={entry.implantLocation} onChange={handleChange} required />
      <Input label="Indication" id="indication" name="indication" value={entry.indication} onChange={handleChange} required />
      <Input label="Pacing Mode" id="pacingMode" name="pacingMode" value={entry.pacingMode} onChange={handleChange} required />
      <Input label="Lower Rate (bpm)" id="lowerRate" name="lowerRate" type="number" value={String(entry.lowerRate)} onChange={handleChange} required />
      <Input label="Upper Tracking Rate (bpm)" id="upperTrackingRate" name="upperTrackingRate" type="number" value={String(entry.upperTrackingRate)} onChange={handleChange} required />
      <Input label="Upper Activity Rate (bpm)" id="upperActivityRate" name="upperActivityRate" type="number" value={String(entry.upperActivityRate || '')} onChange={handleChange} />
      <Input label="RV Threshold" id="rvThreshold" name="rvThreshold" value={entry.rvThreshold || ''} onChange={handleChange} />
      <Input label="RV Sensing" id="rvSensing" name="rvSensing" value={entry.rvSensing || ''} onChange={handleChange} />
      <Input label="Impedance" id="impedance" name="impedance" value={entry.impedance || ''} onChange={handleChange} />
      <Input label="Battery Life" id="batteryLife" name="batteryLife" value={entry.batteryLife || ''} onChange={handleChange} />
      <Input label="Last Check" id="lastCheck" name="lastCheck" value={entry.lastCheck || ''} onChange={handleChange} />
      <Input label="Last Remote Upload" id="lastRemoteUpload" name="lastRemoteUpload" value={entry.lastRemoteUpload || ''} onChange={handleChange} />

      <div style={{ marginBottom: '10px' }}>
        <label style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <input type="checkbox" name="mriCompatible" checked={entry.mriCompatible} onChange={handleChange} />
          MRI Compatible
        </label>
      </div>

      <Input label="Medtronic Rep" id="medtronicRep" name="medtronicRep" value={entry.medtronicRep || ''} onChange={handleChange} />
      <Input label="Medtronic Rep Phone" id="medtronicRepPhone" name="medtronicRepPhone" value={entry.medtronicRepPhone || ''} onChange={handleChange} />
      <Input label="Managing Physician" id="managingPhysician" name="managingPhysician" value={entry.managingPhysician || ''} onChange={handleChange} />
      <Input label="Managing Physician Phone" id="managingPhysicianPhone" name="managingPhysicianPhone" value={entry.managingPhysicianPhone || ''} onChange={handleChange} />

      <label htmlFor="notes">Notes</label>
      <textarea id="notes" name="notes" value={entry.notes || ''} onChange={handleChange}
        style={{ width: '100%', minHeight: '80px', marginBottom: '10px' }} />

      <Button type="submit" disabled={isLoading}>
        {isLoading ? 'Saving...' : 'Save Device'}
      </Button>
      <Button type="button" onClick={onCancel}>Cancel</Button>
    </form>
  );
};

export default DeviceForm;
