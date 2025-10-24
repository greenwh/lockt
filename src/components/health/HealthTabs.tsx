// src/components/health/HealthTabs.tsx
import React, { useState } from 'react';
import ProviderList from './ProviderList';
import ConditionList from './ConditionList';
import ImpairmentList from './ImpairmentList';
import JournalList from './JournalList';
import { SubNavContainer, SubNavButton } from './HealthTabs.styled';

type HealthTab = 'providers' | 'conditions' | 'impairments' | 'journal';

const HealthTabs: React.FC = () => {
    const [activeTab, setActiveTab] = useState<HealthTab>('providers');

    const renderContent = () => {
        switch (activeTab) {
            case 'providers':
                return <ProviderList />;
            case 'conditions':
                return <ConditionList />;
            case 'impairments':
                return <ImpairmentList />;
            case 'journal':
                return <JournalList />;
            default:
                return <ProviderList />;
        }
    };

    return (
        <div>
            <SubNavContainer>
                <SubNavButton isActive={activeTab === 'providers'} onClick={() => setActiveTab('providers')}>Providers</SubNavButton>
                <SubNavButton isActive={activeTab === 'conditions'} onClick={() => setActiveTab('conditions')}>Conditions</SubNavButton>
                <SubNavButton isActive={activeTab === 'impairments'} onClick={() => setActiveTab('impairments')}>Impairments</SubNavButton>
                <SubNavButton isActive={activeTab === 'journal'} onClick={() => setActiveTab('journal')}>Journal</SubNavButton>
            </SubNavContainer>
            {renderContent()}
        </div>
    );
};

export default HealthTabs;