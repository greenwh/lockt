// src/App.tsx
import React, { useState, useEffect } from 'react';
import { useAuth } from './context/AuthContext';
import { databaseService } from './services/database.service';
import AppShell from './components/layout/AppShell';
import TabNavigation from './components/layout/TabNavigation';
import type { Tab } from './components/layout/TabNavigation';
import PasswordList from './components/passwords/PasswordList';
import CreditCardList from './components/credit-cards/CreditCardList';
import CryptoList from './components/crypto/CryptoList';
import FreetextList from './components/freetext/FreetextList';
import HealthTabs from './components/health/HealthTabs';
import LoginScreen from './components/auth/LoginScreen';
import SetupScreen from './components/auth/SetupScreen';

const App: React.FC = () => {
  const { isLocked } = useAuth();
  const [hasAccount, setHasAccount] = useState<boolean | null>(null);
  const [activeTab, setActiveTab] = useState<Tab>('passwords');

  // Check if account exists on mount
  useEffect(() => {
    const checkAccount = async () => {
      try {
        await databaseService.init();
        const hasData = await databaseService.hasEncryptedData();
        setHasAccount(hasData);
      } catch (err) {
        console.error('Failed to check account status:', err);
        setHasAccount(false);
      }
    };
    checkAccount();
  }, []);

  // Show loading state while checking
  if (hasAccount === null) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <p>Loading...</p>
      </div>
    );
  }

  // If locked, show login or setup screen
  if (isLocked) {
    return hasAccount ? <LoginScreen /> : <SetupScreen />;
  }

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

