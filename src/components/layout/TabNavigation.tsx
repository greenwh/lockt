// src/components/layout/TabNavigation.tsx
import React from 'react';
import { NavTabsContainer, NavTabButton } from './TabNavigation.styled';

export type Tab = 'passwords' | 'credit-cards' | 'crypto' | 'freetext' | 'health';

interface TabNavigationProps {
  activeTab: Tab;
  onTabClick: (tab: Tab) => void;
}

const tabs: { id: Tab; label: string }[] = [
  { id: 'passwords', label: 'Passwords' },
  { id: 'credit-cards', label: 'Credit Cards' },
  { id: 'crypto', label: 'Crypto' },
  { id: 'freetext', label: 'Freetext' },
  { id: 'health', label: 'Health' },
];

const TabNavigation: React.FC<TabNavigationProps> = ({ activeTab, onTabClick }) => {
  return (
    <NavTabsContainer>
      {tabs.map((tab) => (
        <NavTabButton
          key={tab.id}
          $isActive={activeTab === tab.id}
          onClick={() => onTabClick(tab.id)}
        >
          {tab.label}
        </NavTabButton>
      ))}
    </NavTabsContainer>
  );
};

export default TabNavigation;
