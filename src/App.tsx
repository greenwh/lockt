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
import SettingsScreen from './components/settings/SettingsScreen';
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
        console.log('=== App.tsx: Checking account status ===');
        await databaseService.init();
        const hasData = await databaseService.hasEncryptedData();
        const salt = await databaseService.getConfig('salt');

        console.log('App.tsx: hasData =', hasData);
        console.log('App.tsx: salt =', salt ? 'exists' : 'missing');

        // Check for salt backups in all locations
        const backupStatus = await databaseService.getSaltBackupStatus();
        console.log('App.tsx: backupStatus =', backupStatus);

        // Determine if recovery is needed
        if (!hasData && !salt) {
          // No data in IndexedDB - could be new device or data deleted
          // ALWAYS show recovery flow first to check for cloud backups
          // RecoveryFlow will offer OneDrive sign-in and "Start Fresh Setup" if no backups
          console.log('App.tsx: No local data - showing recovery flow to check for cloud backups');
          setNeedsRecovery(true);
          setHasAccount(true); // Treat as potential existing account
        } else if (hasData && !salt) {
          // Data exists but salt is missing - attempt recovery
          console.log('App.tsx: Encrypted data exists but salt missing - showing recovery flow');
          setNeedsRecovery(true);
          setHasAccount(true);
        } else if (salt) {
          // Salt exists (either recovered or already present)
          // This means we have an account - show LoginScreen
          // Data will be downloaded from OneDrive on first login if missing locally
          console.log('App.tsx: Salt exists - account exists, showing LoginScreen');
          setHasAccount(true);
          setNeedsRecovery(false);
        } else {
          // Fallback case
          console.log('App.tsx: Fallback case');
          setHasAccount(hasData);
        }
        console.log('App.tsx: Final state - needsRecovery =', !hasData && !salt || (hasData && !salt), ', hasAccount =', salt || hasData);
      } catch (err) {
        console.error('App.tsx: Failed to check account status:', err);
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

  const handleStartFreshSetup = () => {
    // User chose "Start Fresh Setup" from recovery flow (no backups found)
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
    return (
      <RecoveryFlow
        onRecoveryComplete={handleRecoveryComplete}
        onRecoveryFailed={handleRecoveryFailed}
        onStartFreshSetup={handleStartFreshSetup}
      />
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
      case 'settings':
        return <SettingsScreen />;
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

