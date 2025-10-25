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
import RecoveryFlow from './components/auth/RecoveryFlow';

const App: React.FC = () => {
  const { isLocked } = useAuth();
  const [hasAccount, setHasAccount] = useState<boolean | null>(null);
  const [needsRecovery, setNeedsRecovery] = useState(false);
  const [activeTab, setActiveTab] = useState<Tab>('passwords');

  // Check if account exists and if recovery is needed
  useEffect(() => {
    const checkAccount = async () => {
      try {
        await databaseService.init();
        const hasData = await databaseService.hasEncryptedData();
        setHasAccount(hasData);

        // If account exists, check if salt recovery is needed
        if (hasData) {
          const salt = await databaseService.getConfig('salt');
          if (!salt) {
            // Account exists but salt is missing - attempt recovery
            console.log('Salt missing from IndexedDB - checking for backups');
            const backupStatus = await databaseService.getSaltBackupStatus();
            if (backupStatus.localStorage || backupStatus.oneDrive) {
              // Recovery possible
              setNeedsRecovery(true);
            }
          }
        }
      } catch (err) {
        console.error('Failed to check account status:', err);
        setHasAccount(false);
      }
    };
    checkAccount();
  }, []);

  const handleRecoveryComplete = () => {
    setNeedsRecovery(false);
    // Refresh account status
    window.location.reload();
  };

  const handleRecoveryFailed = async () => {
    // User chose to reset - clear all data
    await databaseService.clearAll();
    setNeedsRecovery(false);
    setHasAccount(false);
  };

  // Show loading state while checking
  if (hasAccount === null) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <p>Loading...</p>
      </div>
    );
  }

  // If recovery is needed, show recovery flow
  if (needsRecovery) {
    return <RecoveryFlow onRecoveryComplete={handleRecoveryComplete} onRecoveryFailed={handleRecoveryFailed} />;
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

