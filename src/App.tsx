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
import SettingsPanel from './components/settings/SettingsPanel';
import Button from './components/common/Button';

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<Tab>('passwords');
  const [showSettings, setShowSettings] = useState(false);

  const renderContent = () => {
    if (showSettings) {
      return <SettingsPanel onClose={() => setShowSettings(false)} />;
    }

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
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <TabNavigation activeTab={activeTab} onTabClick={setActiveTab} />
        <Button onClick={() => setShowSettings(!showSettings)}>
          {showSettings ? 'Close Settings' : 'Settings'}
        </Button>
      </div>
      {renderContent()}
    </AppShell>
  );
};

export default App;

