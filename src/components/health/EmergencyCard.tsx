// src/components/health/EmergencyCard.tsx
import React, { useState } from 'react';
import type { HealthEmergency, HealthCondition, HealthMedication, HealthDevice } from '../../types/data.types';
import Button from '../common/Button';
import ImportExport from '../common/ImportExport';
import EmergencyForm from './EmergencyForm';
import EmergencyERView from './EmergencyERView';
import { csvService } from '../../services/csv.service';

interface EmergencyCardProps {
  emergency: HealthEmergency | null;
  onUpdate: (emergency: HealthEmergency | null) => void;
  conditions: HealthCondition[];
  medications: HealthMedication[];
  devices: HealthDevice[];
}

const EmergencyCard: React.FC<EmergencyCardProps> = ({ emergency, onUpdate, conditions, medications, devices }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [showERView, setShowERView] = useState(false);

  const activeConditions = conditions.slice(0, 6);
  const activeMeds = medications.filter((m) => m.status === 'active' || m.status === 'prn');
  const primaryDevice = devices.length > 0 ? devices[0] : null;

  const calculateAge = (dob: string): number => {
    const birth = new Date(dob);
    const today = new Date();
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) age--;
    return age;
  };

  const handleSave = (entry: HealthEmergency) => {
    onUpdate(entry);
    setIsEditing(false);
  };

  const handleImport = async (importedData: HealthEmergency[]) => {
    // Emergency is a single record, take the first imported
    if (importedData.length > 0) {
      onUpdate(importedData[0]);
    }
  };

  // Wrapper to make emergency export work with ImportExport component (expects array)
  const exportWrapper = (data: HealthEmergency[]): string => {
    return csvService.exportHealthEmergencyToCsv(data.length > 0 ? data[0] : null);
  };

  const importWrapper = (csvContent: string): HealthEmergency[] => {
    const result = csvService.importHealthEmergencyFromCsv(csvContent);
    return result ? [result] : [];
  };

  if (showERView && emergency) {
    return (
      <EmergencyERView
        emergency={emergency}
        age={calculateAge(emergency.dateOfBirth)}
        activeMeds={activeMeds}
        primaryDevice={primaryDevice}
        activeConditions={activeConditions}
        onClose={() => setShowERView(false)}
      />
    );
  }

  if (isEditing) {
    return (
      <EmergencyForm
        onSave={handleSave}
        onCancel={() => setIsEditing(false)}
        existingEntry={emergency || undefined}
      />
    );
  }

  if (!emergency) {
    return (
      <div>
        <h4>Emergency Medical Summary</h4>
        <p style={{ textAlign: 'center', padding: '2rem', color: '#6c757d' }}>
          No emergency info yet. Click "Set Up Emergency Card" or import a CSV to get started.
        </p>
        <Button onClick={() => setIsEditing(true)}>Set Up Emergency Card</Button>
        <ImportExport
          data={[]}
          onImport={handleImport}
          exportFunction={exportWrapper}
          importFunction={importWrapper}
          filename={`health-emergency-${new Date().toISOString().split('T')[0]}.csv`}
        />
      </div>
    );
  }

  const age = calculateAge(emergency.dateOfBirth);

  return (
    <div>
      <h4>Emergency Medical Summary</h4>

      <Button onClick={() => setShowERView(true)} style={{ background: '#dc3545', color: '#fff', marginBottom: '15px' }}>
        Show to ER
      </Button>

      {/* Patient Identity */}
      <div style={{ border: '1px solid #ddd', borderRadius: '8px', padding: '20px', marginBottom: '15px' }}>
        <h3 style={{ margin: '0 0 8px' }}>{emergency.fullName}</h3>
        <p style={{ margin: '0 0 4px' }}>
          <strong>DOB:</strong> {new Date(emergency.dateOfBirth).toLocaleDateString()} (Age: {age})
        </p>
        {emergency.bloodType && <p style={{ margin: '0' }}><strong>Blood Type:</strong> {emergency.bloodType}</p>}
      </div>

      {/* Allergies */}
      <div style={{
        borderRadius: '8px', padding: '15px', marginBottom: '15px',
        background: emergency.allergies.toLowerCase() === 'nka' || emergency.allergies.toLowerCase().includes('no known')
          ? '#d4edda' : '#f8d7da',
        border: emergency.allergies.toLowerCase() === 'nka' || emergency.allergies.toLowerCase().includes('no known')
          ? '1px solid #c3e6cb' : '1px solid #f5c6cb',
      }}>
        <strong>Allergies:</strong> {emergency.allergies}
      </div>

      {/* Device Summary */}
      {primaryDevice && (
        <div style={{ border: '1px solid #ddd', borderRadius: '8px', padding: '15px', marginBottom: '15px' }}>
          <strong>Implanted Device:</strong>
          <p style={{ margin: '4px 0' }}>
            {primaryDevice.deviceName} ({primaryDevice.model}) - {primaryDevice.pacingMode} {primaryDevice.lowerRate}-{primaryDevice.upperTrackingRate} bpm
          </p>
          {primaryDevice.mriCompatible && (
            <span style={{ padding: '2px 8px', borderRadius: '12px', background: '#d4edda', color: '#155724', fontSize: '0.85em' }}>
              MRI Conditional
            </span>
          )}
        </div>
      )}

      {/* Active Medications */}
      {activeMeds.length > 0 && (
        <div style={{ border: '1px solid #ddd', borderRadius: '8px', padding: '15px', marginBottom: '15px' }}>
          <strong>Active Medications ({activeMeds.length}):</strong>
          <ul style={{ margin: '8px 0', paddingLeft: '20px' }}>
            {activeMeds.map((med) => (
              <li key={med.id}>
                {med.interactionNotes?.includes('\u26A0\uFE0F') && '\u26A0\uFE0F '}
                {med.name} {med.dose} - {med.frequency}
                {med.status === 'prn' && ' (PRN)'}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Conditions */}
      {activeConditions.length > 0 && (
        <div style={{ border: '1px solid #ddd', borderRadius: '8px', padding: '15px', marginBottom: '15px' }}>
          <strong>Conditions ({conditions.length}):</strong>
          <ul style={{ margin: '8px 0', paddingLeft: '20px' }}>
            {activeConditions.map((c) => (
              <li key={c.id}>{c.condition}</li>
            ))}
            {conditions.length > 6 && <li style={{ color: '#6c757d' }}>...and {conditions.length - 6} more</li>}
          </ul>
        </div>
      )}

      {/* Emergency Contacts */}
      <div style={{ border: '1px solid #ddd', borderRadius: '8px', padding: '15px', marginBottom: '15px' }}>
        <strong>Emergency Contacts:</strong>
        <p style={{ margin: '4px 0' }}>
          {emergency.emergencyContact1Name}
          {emergency.emergencyContact1Relationship && ` (${emergency.emergencyContact1Relationship})`}
          {emergency.emergencyContact1Phone && (
            <> - <a href={`tel:${emergency.emergencyContact1Phone}`}>{emergency.emergencyContact1Phone}</a></>
          )}
        </p>
        {emergency.emergencyContact2Name && (
          <p style={{ margin: '4px 0' }}>
            {emergency.emergencyContact2Name}
            {emergency.emergencyContact2Relationship && ` (${emergency.emergencyContact2Relationship})`}
            {emergency.emergencyContact2Phone && (
              <> - <a href={`tel:${emergency.emergencyContact2Phone}`}>{emergency.emergencyContact2Phone}</a></>
            )}
          </p>
        )}
      </div>

      {/* PCP */}
      <div style={{ border: '1px solid #ddd', borderRadius: '8px', padding: '15px', marginBottom: '15px' }}>
        <strong>Primary Care:</strong>
        <p style={{ margin: '4px 0' }}>
          {emergency.primaryCarePhysician}
          {emergency.primaryCarePhone && (
            <> - <a href={`tel:${emergency.primaryCarePhone}`}>{emergency.primaryCarePhone}</a></>
          )}
        </p>
      </div>

      {/* Insurance */}
      {(emergency.insurancePrimary || emergency.insuranceSecondary) && (
        <div style={{ border: '1px solid #ddd', borderRadius: '8px', padding: '15px', marginBottom: '15px' }}>
          <strong>Insurance:</strong>
          {emergency.insurancePrimary && (
            <p style={{ margin: '4px 0' }}>
              Primary: {emergency.insurancePrimary}
              {emergency.insurancePrimaryId && ` (ID: ${emergency.insurancePrimaryId})`}
            </p>
          )}
          {emergency.insuranceSecondary && (
            <p style={{ margin: '4px 0' }}>
              Secondary: {emergency.insuranceSecondary}
              {emergency.insuranceSecondaryId && ` (ID: ${emergency.insuranceSecondaryId})`}
            </p>
          )}
        </div>
      )}

      {/* Advance Directive & Special Instructions */}
      {(emergency.advanceDirective !== undefined || emergency.dnrStatus || emergency.specialInstructions) && (
        <div style={{ border: '1px solid #ddd', borderRadius: '8px', padding: '15px', marginBottom: '15px' }}>
          {emergency.advanceDirective !== undefined && (
            <p style={{ margin: '4px 0' }}>
              <strong>Advance Directive:</strong> {emergency.advanceDirective ? 'Yes' : 'No'}
              {emergency.advanceDirectiveLocation && ` - ${emergency.advanceDirectiveLocation}`}
            </p>
          )}
          {emergency.dnrStatus && <p style={{ margin: '4px 0' }}><strong>DNR Status:</strong> {emergency.dnrStatus}</p>}
          {emergency.specialInstructions && (
            <div style={{ whiteSpace: 'pre-wrap', background: '#fff3cd', padding: '12px', borderRadius: '5px', marginTop: '8px' }}>
              <strong>Special Instructions:</strong>
              <p style={{ margin: '4px 0' }}>{emergency.specialInstructions}</p>
            </div>
          )}
        </div>
      )}

      {/* Actions */}
      <div style={{ display: 'flex', gap: '1rem', marginBottom: '15px' }}>
        <Button onClick={() => setIsEditing(true)}>Edit</Button>
      </div>

      <ImportExport
        data={emergency ? [emergency] : []}
        onImport={handleImport}
        exportFunction={exportWrapper}
        importFunction={importWrapper}
        filename={`health-emergency-${new Date().toISOString().split('T')[0]}.csv`}
      />
    </div>
  );
};

export default EmergencyCard;
