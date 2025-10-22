// src/App.tsx
import React, { useState } from 'react';
import AppShell from './components/layout/AppShell';
import TabNavigation from './components/layout/TabNavigation';
import type { Tab } from './components/layout/TabNavigation';
import PasswordList from './components/passwords/PasswordList';
import CreditCardList from './components/credit-cards/CreditCardList';
import CryptoList from './components/crypto/CryptoList';
import FreetextList from './components/freetext/FreetextList';
import HealthTabs from './components/health/HealthTabs';

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<Tab>('passwords');

  const renderContent = () => {
    switch (activeTab) {
      case 'passwords':
        return <PasswordList />;
      case 'credit-cards':
        return <CreditCardList />;
      case 'crypto':
        return <CryptoList />;
      case 'freetext':
        return <FreetextList />;
      case 'health':
        return <HealthTabs />;
      default:
        return <PasswordList />;
    }
  };

  return (
    <AppShell>
      <TabNavigation activeTab={activeTab} onTabClick={setActiveTab} />
      {renderContent()}
    </AppShell>
  );
};

export default App;

