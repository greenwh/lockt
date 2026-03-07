// src/components/vso/VSOTabs.tsx
import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { SubNavContainer, SubNavButton } from '../health/HealthTabs.styled';
import type { VSOData } from '../../types/data.types';
import { getVSOSeedData } from '../../data/vso-seed-data';
import ClaimList from './ClaimList';
import EvidenceList from './EvidenceList';
import ActionList from './ActionList';
import ExposureList from './ExposureList';
import RatingList from './RatingList';

type VSOTab = 'claims' | 'evidence' | 'actions' | 'exposures' | 'ratings';

const defaultVSOData: VSOData = {
  claims: [],
  evidence: [],
  actions: [],
  exposures: [],
  ratings: [],
};

const VSOTabs: React.FC = () => {
  const [activeTab, setActiveTab] = useState<VSOTab>('claims');
  const { appData, updateHealth } = useAuth();
  const [seeded, setSeeded] = useState(false);

  // Get VSO data from health data, with defaults
  const healthData = appData?.health || {
    providers: [],
    conditions: [],
    impairments: [],
    journal: [],
    medications: [],
    devices: [],
    emergency: null,
  };

  const vsoData: VSOData = healthData.vso || defaultVSOData;

  const safeVSOData = {
    claims: Array.isArray(vsoData.claims) ? vsoData.claims : [],
    evidence: Array.isArray(vsoData.evidence) ? vsoData.evidence : [],
    actions: Array.isArray(vsoData.actions) ? vsoData.actions : [],
    exposures: Array.isArray(vsoData.exposures) ? vsoData.exposures : [],
    ratings: Array.isArray(vsoData.ratings) ? vsoData.ratings : [],
  };

  // Seed data on first load if all VSO arrays are empty
  useEffect(() => {
    if (seeded) return;
    const isEmpty = safeVSOData.claims.length === 0 &&
      safeVSOData.evidence.length === 0 &&
      safeVSOData.actions.length === 0 &&
      safeVSOData.exposures.length === 0 &&
      safeVSOData.ratings.length === 0;

    if (isEmpty && appData) {
      const seedData = getVSOSeedData();
      const currentHealth = appData.health || {
        providers: [],
        conditions: [],
        impairments: [],
        journal: [],
        medications: [],
        devices: [],
        emergency: null,
      };
      void updateHealth({ ...currentHealth, vso: seedData });
      setSeeded(true);
    }
  }, [appData, safeVSOData, seeded, updateHealth]);

  const handleVSOUpdate = async (updates: Partial<VSOData>) => {
    const currentHealth = appData?.health || {
      providers: [],
      conditions: [],
      impairments: [],
      journal: [],
      medications: [],
      devices: [],
      emergency: null,
    };
    const currentVSO = currentHealth.vso || defaultVSOData;
    const newVSO = { ...currentVSO, ...updates };
    await updateHealth({ ...currentHealth, vso: newVSO });
  };

  const createSetEntries = <T,>(key: keyof VSOData) => {
    return (action: React.SetStateAction<T[]>) => {
      const currentArray = safeVSOData[key] as T[];
      const newArray = typeof action === 'function'
        ? (action as (prev: T[]) => T[])(currentArray)
        : action;
      void handleVSOUpdate({ [key]: newArray });
    };
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'claims':
        return (
          <ClaimList
            entries={safeVSOData.claims}
            setEntries={createSetEntries('claims')}
          />
        );
      case 'evidence':
        return (
          <EvidenceList
            entries={safeVSOData.evidence}
            setEntries={createSetEntries('evidence')}
          />
        );
      case 'actions':
        return (
          <ActionList
            entries={safeVSOData.actions}
            setEntries={createSetEntries('actions')}
          />
        );
      case 'exposures':
        return (
          <ExposureList
            entries={safeVSOData.exposures}
            setEntries={createSetEntries('exposures')}
          />
        );
      case 'ratings':
        return (
          <RatingList
            entries={safeVSOData.ratings}
            setEntries={createSetEntries('ratings')}
          />
        );
      default:
        return (
          <ClaimList
            entries={safeVSOData.claims}
            setEntries={createSetEntries('claims')}
          />
        );
    }
  };

  return (
    <div>
      <h2>VA Claims</h2>
      <SubNavContainer>
        <SubNavButton $isActive={activeTab === 'claims'} onClick={() => setActiveTab('claims')}>
          Claims
        </SubNavButton>
        <SubNavButton $isActive={activeTab === 'evidence'} onClick={() => setActiveTab('evidence')}>
          Evidence
        </SubNavButton>
        <SubNavButton $isActive={activeTab === 'actions'} onClick={() => setActiveTab('actions')}>
          Actions
        </SubNavButton>
        <SubNavButton $isActive={activeTab === 'exposures'} onClick={() => setActiveTab('exposures')}>
          Exposures
        </SubNavButton>
        <SubNavButton $isActive={activeTab === 'ratings'} onClick={() => setActiveTab('ratings')}>
          Ratings
        </SubNavButton>
      </SubNavContainer>
      {renderContent()}
    </div>
  );
};

export default VSOTabs;
