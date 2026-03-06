// src/components/health/EmergencyERView.tsx
import React from 'react';
import type { HealthEmergency, HealthMedication, HealthDevice, HealthCondition } from '../../types/data.types';
import Button from '../common/Button';

interface EmergencyERViewProps {
  emergency: HealthEmergency;
  age: number;
  activeMeds: HealthMedication[];
  primaryDevice: HealthDevice | null;
  activeConditions: HealthCondition[];
  onClose: () => void;
}

const EmergencyERView: React.FC<EmergencyERViewProps> = ({
  emergency, age, activeMeds, primaryDevice, activeConditions, onClose,
}) => {
  return (
    <div style={{
      position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, zIndex: 9999,
      background: '#0d1117', color: '#e6edf3', padding: '20px', overflowY: 'auto',
      fontFamily: '-apple-system, BlinkMacSystemFont, sans-serif',
    }}>
      <div style={{ maxWidth: '600px', margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: '20px' }}>
          <h1 style={{ color: '#ff4444', margin: '0 0 4px', fontSize: '1.4em' }}>
            EMERGENCY MEDICAL INFO
          </h1>
        </div>

        {/* Name & DOB */}
        <div style={{ fontSize: '1.3em', fontWeight: 700, marginBottom: '4px' }}>
          {emergency.fullName}
        </div>
        <div style={{ fontSize: '1.1em', marginBottom: '16px', color: '#8b949e' }}>
          DOB: {new Date(emergency.dateOfBirth).toLocaleDateString()} | Age: {age}
        </div>

        {/* Allergies */}
        <div style={{
          padding: '12px 16px', borderRadius: '8px', marginBottom: '12px', fontSize: '1.1em', fontWeight: 600,
          background: emergency.allergies.toLowerCase() === 'nka' || emergency.allergies.toLowerCase().includes('no known')
            ? '#0d2818' : '#3d0000',
          border: emergency.allergies.toLowerCase() === 'nka' || emergency.allergies.toLowerCase().includes('no known')
            ? '2px solid #00ff88' : '2px solid #ff4444',
          color: emergency.allergies.toLowerCase() === 'nka' || emergency.allergies.toLowerCase().includes('no known')
            ? '#00ff88' : '#ff4444',
        }}>
          ALLERGIES: {emergency.allergies}
        </div>

        {/* Device */}
        {primaryDevice && (
          <Section title="IMPLANTED DEVICE">
            <p style={{ margin: '4px 0', fontSize: '1.05em' }}>
              {primaryDevice.deviceName} ({primaryDevice.model})
            </p>
            <p style={{ margin: '4px 0' }}>S/N: {primaryDevice.serialNumber}</p>
            <p style={{ margin: '4px 0' }}>
              Mode: {primaryDevice.pacingMode} {primaryDevice.lowerRate}-{primaryDevice.upperTrackingRate} bpm
            </p>
            <p style={{ margin: '4px 0', color: primaryDevice.mriCompatible ? '#00ff88' : '#ff4444' }}>
              MRI: {primaryDevice.mriCompatible ? 'Conditional' : 'NOT Compatible'}
            </p>
          </Section>
        )}

        {/* Active Medications */}
        {activeMeds.length > 0 && (
          <Section title={`MEDICATIONS (${activeMeds.length})`}>
            {activeMeds.map((med) => (
              <p key={med.id} style={{ margin: '4px 0' }}>
                {med.interactionNotes?.includes('\u26A0\uFE0F') && '\u26A0\uFE0F '}
                <strong>{med.name}</strong> {med.dose} - {med.frequency}
                {med.status === 'prn' && ' (PRN)'}
              </p>
            ))}
          </Section>
        )}

        {/* Conditions */}
        {activeConditions.length > 0 && (
          <Section title="CONDITIONS">
            {activeConditions.map((c) => (
              <p key={c.id} style={{ margin: '4px 0' }}>{c.condition}</p>
            ))}
          </Section>
        )}

        {/* Emergency Contacts */}
        <Section title="EMERGENCY CONTACTS">
          <ContactLine
            name={emergency.emergencyContact1Name}
            relationship={emergency.emergencyContact1Relationship}
            phone={emergency.emergencyContact1Phone}
          />
          {emergency.emergencyContact2Name && (
            <ContactLine
              name={emergency.emergencyContact2Name}
              relationship={emergency.emergencyContact2Relationship}
              phone={emergency.emergencyContact2Phone}
            />
          )}
        </Section>

        {/* PCP */}
        <Section title="PRIMARY CARE">
          <ContactLine name={emergency.primaryCarePhysician} phone={emergency.primaryCarePhone} />
        </Section>

        {/* Device contacts */}
        {primaryDevice && (primaryDevice.managingPhysician || primaryDevice.medtronicRep) && (
          <Section title="DEVICE CONTACTS">
            {primaryDevice.managingPhysician && (
              <ContactLine name={`MD: ${primaryDevice.managingPhysician}`} phone={primaryDevice.managingPhysicianPhone} />
            )}
            {primaryDevice.medtronicRep && (
              <ContactLine name={`Medtronic: ${primaryDevice.medtronicRep}`} phone={primaryDevice.medtronicRepPhone} />
            )}
          </Section>
        )}

        {/* Insurance */}
        {(emergency.insurancePrimary || emergency.insuranceSecondary) && (
          <Section title="INSURANCE">
            {emergency.insurancePrimary && (
              <p style={{ margin: '4px 0' }}>
                {emergency.insurancePrimary}
                {emergency.insurancePrimaryId && ` | ID: ${emergency.insurancePrimaryId}`}
              </p>
            )}
            {emergency.insuranceSecondary && (
              <p style={{ margin: '4px 0' }}>
                {emergency.insuranceSecondary}
                {emergency.insuranceSecondaryId && ` | ID: ${emergency.insuranceSecondaryId}`}
              </p>
            )}
          </Section>
        )}

        {/* Special Instructions */}
        {emergency.specialInstructions && (
          <div style={{
            padding: '12px 16px', borderRadius: '8px', marginBottom: '12px',
            background: '#3d2600', border: '2px solid #ffa500',
          }}>
            <div style={{ fontWeight: 700, color: '#ffa500', marginBottom: '4px' }}>SPECIAL INSTRUCTIONS</div>
            <div style={{ whiteSpace: 'pre-wrap' }}>{emergency.specialInstructions}</div>
          </div>
        )}

        <Button onClick={onClose} style={{ width: '100%', marginTop: '20px', background: '#555', padding: '12px' }}>
          Exit ER View
        </Button>
      </div>
    </div>
  );
};

const Section: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => (
  <div style={{
    padding: '12px 16px', borderRadius: '8px', marginBottom: '12px',
    background: '#161b22', border: '1px solid #30363d',
  }}>
    <div style={{ fontWeight: 700, color: '#58a6ff', marginBottom: '8px', fontSize: '0.9em', letterSpacing: '0.5px' }}>
      {title}
    </div>
    {children}
  </div>
);

const ContactLine: React.FC<{ name: string; relationship?: string; phone?: string }> = ({ name, relationship, phone }) => (
  <p style={{ margin: '4px 0' }}>
    {name}
    {relationship && ` (${relationship})`}
    {phone && (
      <> - <a href={`tel:${phone}`} style={{ color: '#00ff88', fontWeight: 600 }}>{phone}</a></>
    )}
  </p>
);

export default EmergencyERView;
