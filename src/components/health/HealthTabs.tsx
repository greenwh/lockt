// src/components/health/HealthTabs.tsx
import React, { useState } from 'react';
import type { HealthProvider, HealthCondition, HealthImpairment, HealthJournalEntry } from '../../types/data.types';
import { SubNavContainer, SubNavButton } from './HealthTabs.styled';
import ProviderList from './ProviderList';
import ConditionList from './ConditionList';
import ImpairmentList from './ImpairmentList';
import JournalList from './JournalList';

type HealthTab = 'providers' | 'conditions' | 'impairments' | 'journal';

const HealthTabs: React.FC = () => {
  const [activeTab, setActiveTab] = useState<HealthTab>('providers');
  
  // Lifted state for all health data
  const [providers, setProviders] = useState<HealthProvider[]>([]);
  const [conditions, setConditions] = useState<HealthCondition[]>([]);
  const [impairments, setImpairments] = useState<HealthImpairment[]>([]);
  const [journal, setJournal] = useState<HealthJournalEntry[]>([]);

  const renderContent = () => {
    switch (activeTab) {
      case 'providers':
        return <ProviderList entries={providers} setEntries={setProviders} />;
      case 'conditions':
        return <ConditionList entries={conditions} setEntries={setConditions} />;
      case 'impairments':
        return <ImpairmentList entries={impairments} setEntries={setImpairments} conditions={conditions} />;
      case 'journal':
        return <JournalList entries={journal} setEntries={setJournal} />;
      default:
        return <ProviderList entries={providers} setEntries={setProviders} />;
    }
  };

  return (
    <div>
      <h2>Health Data</h2>
      <SubNavContainer>
        <SubNavButton isActive={activeTab === 'providers'} onClick={() => setActiveTab('providers')}>
          Providers
        </SubNavButton>
        <SubNavButton isActive={activeTab === 'conditions'} onClick={() => setActiveTab('conditions')}>
          Conditions
        </SubNavButton>
        <SubNavButton isActive={activeTab === 'impairments'} onClick={() => setActiveTab('impairments')}>
          Impairments
        </SubNavButton>
        <SubNavButton isActive={activeTab === 'journal'} onClick={() => setActiveTab('journal')}>
          Journal
        </SubNavButton>
      </SubNavContainer>
      {renderContent()}
    </div>
  );
};

export default HealthTabs;

