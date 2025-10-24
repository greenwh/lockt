// src/components/layout/TabNavigation.tsx
import React from 'react';
import { NavTabsContainer, NavTabButton } from './TabNavigation.styled';

export type Tab = 'passwords' | 'credit-cards' | 'crypto' | 'freetext' | 'health';

interface TabNavigationProps {
    activeTab: Tab;
    onTabClick: (tab: Tab) => void;
}

const TabNavigation: React.FC<TabNavigationProps> = ({ activeTab, onTabClick }) => {
    const tabs: Tab[] = ['passwords', 'credit-cards', 'crypto', 'freetext', 'health'];
    return (
        <NavTabsContainer>
            {tabs.map(tab => (
                <NavTabButton 
                    key={tab} 
                    onClick={() => onTabClick(tab)} 
                    $isActive={activeTab === tab}
                >
                    {tab.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                </NavTabButton>
            ))}
        </NavTabsContainer>
    );
};

export default TabNavigation;