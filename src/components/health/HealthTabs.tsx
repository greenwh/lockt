// src/components/health/HealthTabs.tsx
import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { SubNavContainer, SubNavButton } from './HealthTabs.styled';
import ProviderList from './ProviderList';
import ConditionList from './ConditionList';
import ImpairmentList from './ImpairmentList';
import JournalList from './JournalList';
import MedicationList from './MedicationList';
import DeviceList from './DeviceList';
import EmergencyCard from './EmergencyCard';

type HealthTab = 'providers' | 'conditions' | 'impairments' | 'journal' | 'medications' | 'devices' | 'emergency';

const HealthTabs: React.FC = () => {
  const [activeTab, setActiveTab] = useState<HealthTab>('providers');
  const { appData, updateHealth } = useAuth();

  // Get health data from AuthContext, with defaults and defensive checks
  const healthData = appData?.health || {
    providers: [],
    conditions: [],
    impairments: [],
    journal: [],
    medications: [],
    devices: [],
    emergency: null,
  };

  // Ensure all properties are arrays (defensive against data structure corruption)
  const safeHealthData = {
    providers: Array.isArray(healthData.providers) ? healthData.providers : [],
    conditions: Array.isArray(healthData.conditions) ? healthData.conditions : [],
    impairments: Array.isArray(healthData.impairments) ? healthData.impairments : [],
    journal: Array.isArray(healthData.journal) ? healthData.journal : [],
    medications: Array.isArray(healthData.medications) ? healthData.medications : [],
    devices: Array.isArray(healthData.devices) ? healthData.devices : [],
    emergency: healthData.emergency || null,
  };

  // Create handlers that always use the current healthData from the closure
  const handleHealthUpdate = async (updates: Partial<typeof healthData>) => {
    // Get current health data from appData to ensure we have the latest state
    const currentHealth = appData?.health || {
      providers: [],
      conditions: [],
      impairments: [],
      journal: [],
      medications: [],
      devices: [],
      emergency: null,
    };
    const newHealth = { ...currentHealth, ...updates };
    await updateHealth(newHealth);
  };

  // Helper to create setEntries handler that properly handles SetStateAction
  const createSetEntries = <T,>(key: keyof typeof safeHealthData) => {
    return (action: React.SetStateAction<T[]>) => {
      const currentArray = safeHealthData[key] as T[];
      const newArray = typeof action === 'function'
        ? (action as (prev: T[]) => T[])(currentArray)
        : action;
      void handleHealthUpdate({ [key]: newArray });
    };
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'providers':
        return (
          <ProviderList
            entries={safeHealthData.providers}
            setEntries={createSetEntries('providers')}
          />
        );
      case 'conditions':
        return (
          <ConditionList
            entries={safeHealthData.conditions}
            setEntries={createSetEntries('conditions')}
          />
        );
      case 'impairments':
        return (
          <ImpairmentList
            entries={safeHealthData.impairments}
            setEntries={createSetEntries('impairments')}
            conditions={safeHealthData.conditions}
          />
        );
      case 'journal':
        return (
          <JournalList
            entries={safeHealthData.journal}
            setEntries={createSetEntries('journal')}
          />
        );
      case 'medications':
        return (
          <MedicationList
            entries={safeHealthData.medications}
            setEntries={createSetEntries('medications')}
          />
        );
      case 'devices':
        return (
          <DeviceList
            entries={safeHealthData.devices}
            setEntries={createSetEntries('devices')}
          />
        );
      case 'emergency':
        return (
          <EmergencyCard
            emergency={safeHealthData.emergency}
            onUpdate={(emergency) => handleHealthUpdate({ emergency })}
            conditions={safeHealthData.conditions}
            medications={safeHealthData.medications}
            devices={safeHealthData.devices}
          />
        );
      default:
        return (
          <ProviderList
            entries={safeHealthData.providers}
            setEntries={createSetEntries('providers')}
          />
        );
    }
  };

  return (
    <div>
      <h2>Health Data</h2>
      <SubNavContainer>
        <SubNavButton $isActive={activeTab === 'providers'} onClick={() => setActiveTab('providers')}>
          Providers
        </SubNavButton>
        <SubNavButton $isActive={activeTab === 'conditions'} onClick={() => setActiveTab('conditions')}>
          Conditions
        </SubNavButton>
        <SubNavButton $isActive={activeTab === 'impairments'} onClick={() => setActiveTab('impairments')}>
          Impairments
        </SubNavButton>
        <SubNavButton $isActive={activeTab === 'journal'} onClick={() => setActiveTab('journal')}>
          Journal
        </SubNavButton>
        <SubNavButton $isActive={activeTab === 'medications'} onClick={() => setActiveTab('medications')}>
          Medications
        </SubNavButton>
        <SubNavButton $isActive={activeTab === 'devices'} onClick={() => setActiveTab('devices')}>
          Devices
        </SubNavButton>
        <SubNavButton $isActive={activeTab === 'emergency'} onClick={() => setActiveTab('emergency')}>
          Emergency
        </SubNavButton>
      </SubNavContainer>
      {renderContent()}
    </div>
  );
};

export default HealthTabs;
