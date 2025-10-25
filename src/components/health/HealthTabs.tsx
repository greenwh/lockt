// src/components/health/HealthTabs.tsx
import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { SubNavContainer, SubNavButton } from './HealthTabs.styled';
import ProviderList from './ProviderList';
import ConditionList from './ConditionList';
import ImpairmentList from './ImpairmentList';
import JournalList from './JournalList';

type HealthTab = 'providers' | 'conditions' | 'impairments' | 'journal';

const HealthTabs: React.FC = () => {
  const [activeTab, setActiveTab] = useState<HealthTab>('providers');
  const { appData, updateHealth } = useAuth();

  // Get health data from AuthContext, with defaults and defensive checks
  const healthData = appData?.health || {
    providers: [],
    conditions: [],
    impairments: [],
    journal: [],
  };

  // Ensure all properties are arrays (defensive against data structure corruption)
  const safeHealthData = {
    providers: Array.isArray(healthData.providers) ? healthData.providers : [],
    conditions: Array.isArray(healthData.conditions) ? healthData.conditions : [],
    impairments: Array.isArray(healthData.impairments) ? healthData.impairments : [],
    journal: Array.isArray(healthData.journal) ? healthData.journal : [],
  };

  // Create handlers that always use the current healthData from the closure
  const handleHealthUpdate = async (updates: Partial<typeof healthData>) => {
    // Get current health data from appData to ensure we have the latest state
    const currentHealth = appData?.health || {
      providers: [],
      conditions: [],
      impairments: [],
      journal: [],
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
      </SubNavContainer>
      {renderContent()}
    </div>
  );
};

export default HealthTabs;

