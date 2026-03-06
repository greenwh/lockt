// src/components/health/DeviceCard.tsx
import React from 'react';
import type { HealthDevice } from '../../types/data.types';
import Button from '../common/Button';

interface DeviceCardProps {
  entry: HealthDevice;
  onEdit: (entry: HealthDevice) => void;
  onDelete?: (entryId: string) => void;
  erMode: boolean;
  onToggleErMode: () => void;
}

const DeviceCard: React.FC<DeviceCardProps> = ({ entry, onEdit, onDelete, erMode, onToggleErMode }) => {
  if (erMode) {
    return (
      <div style={{
        background: '#1a1a2e', color: '#fff', padding: '24px', borderRadius: '12px',
        fontFamily: 'monospace', fontSize: '1.1em', lineHeight: '1.8',
      }}>
        <h3 style={{ color: '#00ff88', margin: '0 0 16px', fontSize: '1.4em' }}>EMERGENCY - DEVICE INFO</h3>
        <p><strong>Device:</strong> {entry.deviceName} ({entry.model})</p>
        <p><strong>Serial:</strong> {entry.serialNumber}</p>
        <p><strong>Type:</strong> {entry.deviceType}</p>
        <p><strong>Mode:</strong> {entry.pacingMode} {entry.lowerRate}-{entry.upperTrackingRate} bpm</p>
        <p><strong>Implanted:</strong> {entry.implantDate}</p>
        <p><strong>Indication:</strong> {entry.indication}</p>
        <p style={{ color: entry.mriCompatible ? '#00ff88' : '#ff4444' }}>
          <strong>MRI:</strong> {entry.mriCompatible ? 'Conditional' : 'NOT Compatible'}
        </p>
        {entry.managingPhysician && (
          <p>
            <strong>Managing MD:</strong> {entry.managingPhysician}{' '}
            {entry.managingPhysicianPhone && (
              <a href={`tel:${entry.managingPhysicianPhone}`} style={{ color: '#00ff88' }}>
                {entry.managingPhysicianPhone}
              </a>
            )}
          </p>
        )}
        {entry.medtronicRep && (
          <p>
            <strong>Medtronic:</strong> {entry.medtronicRep}{' '}
            {entry.medtronicRepPhone && (
              <a href={`tel:${entry.medtronicRepPhone}`} style={{ color: '#00ff88' }}>
                {entry.medtronicRepPhone}
              </a>
            )}
          </p>
        )}
        <Button onClick={onToggleErMode} style={{ marginTop: '16px', background: '#555' }}>
          Exit ER Mode
        </Button>
      </div>
    );
  }

  return (
    <div style={{ border: '1px solid #ddd', borderRadius: '8px', padding: '20px', marginBottom: '15px' }}>
      {/* Top Section - Device Identity */}
      <div style={{ marginBottom: '20px' }}>
        <h3 style={{ margin: '0 0 4px' }}>{entry.deviceName}</h3>
        <p style={{ margin: '0', color: '#666', fontSize: '0.95em' }}>
          {entry.manufacturer} | Model: {entry.model} | S/N: {entry.serialNumber}
        </p>
        {entry.mriCompatible && (
          <span style={{
            display: 'inline-block', marginTop: '8px', padding: '4px 12px',
            borderRadius: '12px', background: '#d4edda', color: '#155724',
            fontSize: '0.85em', fontWeight: 600,
          }}>
            MRI Conditional
          </span>
        )}
      </div>

      {/* Parameters Grid */}
      <div style={{
        display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))',
        gap: '12px', marginBottom: '20px', background: '#f8f9fa', padding: '15px', borderRadius: '6px',
      }}>
        <div><strong>Pacing Mode:</strong><br/>{entry.pacingMode}</div>
        <div><strong>Lower Rate:</strong><br/>{entry.lowerRate} bpm</div>
        <div><strong>Upper Tracking:</strong><br/>{entry.upperTrackingRate} bpm</div>
        {entry.upperActivityRate && <div><strong>Upper Activity:</strong><br/>{entry.upperActivityRate} bpm</div>}
        {entry.rvThreshold && <div><strong>RV Threshold:</strong><br/>{entry.rvThreshold}</div>}
        {entry.rvSensing && <div><strong>RV Sensing:</strong><br/>{entry.rvSensing}</div>}
        {entry.impedance && <div><strong>Impedance:</strong><br/>{entry.impedance}</div>}
      </div>

      {/* Provider Contacts */}
      {(entry.managingPhysician || entry.medtronicRep) && (
        <div style={{ marginBottom: '20px' }}>
          <strong>Contacts:</strong>
          {entry.managingPhysician && (
            <p style={{ margin: '4px 0' }}>
              Managing MD: {entry.managingPhysician}
              {entry.managingPhysicianPhone && (
                <> - <a href={`tel:${entry.managingPhysicianPhone}`}>{entry.managingPhysicianPhone}</a></>
              )}
            </p>
          )}
          {entry.medtronicRep && (
            <p style={{ margin: '4px 0' }}>
              Medtronic Rep: {entry.medtronicRep}
              {entry.medtronicRepPhone && (
                <> - <a href={`tel:${entry.medtronicRepPhone}`}>{entry.medtronicRepPhone}</a></>
              )}
            </p>
          )}
        </div>
      )}

      {/* Status Section */}
      <div style={{ marginBottom: '20px', background: '#f8f9fa', padding: '15px', borderRadius: '6px' }}>
        {entry.batteryLife && <p style={{ margin: '4px 0' }}><strong>Battery:</strong> {entry.batteryLife}</p>}
        {entry.lastCheck && <p style={{ margin: '4px 0' }}><strong>Last Check:</strong> {entry.lastCheck}</p>}
        {entry.lastRemoteUpload && <p style={{ margin: '4px 0' }}><strong>Last Remote Upload:</strong> {entry.lastRemoteUpload}</p>}
      </div>

      {/* Implant History */}
      <div style={{ marginBottom: '20px' }}>
        <strong>Implant History:</strong>
        <p style={{ margin: '4px 0' }}><strong>Date:</strong> {entry.implantDate}</p>
        <p style={{ margin: '4px 0' }}><strong>Physician:</strong> {entry.implantingPhysician}</p>
        <p style={{ margin: '4px 0' }}><strong>Location:</strong> {entry.implantLocation}</p>
        <p style={{ margin: '4px 0' }}><strong>Indication:</strong> {entry.indication}</p>
      </div>

      {/* Notes */}
      {entry.notes && (
        <div style={{ whiteSpace: 'pre-wrap', background: '#f4f4f4', padding: '15px', borderRadius: '5px', marginBottom: '15px' }}>
          <strong>Notes:</strong>
          <p>{entry.notes}</p>
        </div>
      )}

      {/* Actions */}
      <div style={{ display: 'flex', gap: '1rem' }}>
        <Button onClick={onToggleErMode} style={{ background: '#dc3545', color: '#fff' }}>
          Show to ER
        </Button>
        <Button onClick={() => onEdit(entry)}>Edit</Button>
        {onDelete && (
          <Button onClick={() => onDelete(entry.id)} style={{ background: '#6c757d' }}>
            Delete
          </Button>
        )}
      </div>
    </div>
  );
};

export default DeviceCard;
