import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import type { AppData, PasswordEntry, CreditCardEntry, CryptoEntry, FreetextEntry, HealthData } from '../types/data.types';
import { cryptoService } from '../services/crypto.service';
import { databaseService } from '../services/database.service';
import { oneDriveService } from '../services/onedrive.service';

/**
 * Helper to convert Base64 string to Uint8Array
 */
const base64ToUint8Array = (base64: string): Uint8Array => {
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes;
};

interface AuthContextType {
  // State
  isLocked: boolean;
  appData: AppData | null;
  error: string | null;

  // Actions
  unlock: (password: string, recoveryPhrase?: string) => Promise<void>;
  lock: () => Promise<void>;
  createAccount: (password: string, recoveryPhrase: string) => Promise<void>;
  reloadFromDatabase: () => Promise<void>; // Reload data from IndexedDB after sync

  // Data mutations (these auto-save to IndexedDB)
  updatePasswords: (entries: PasswordEntry[]) => Promise<void>;
  updateCreditCards: (entries: CreditCardEntry[]) => Promise<void>;
  updateCrypto: (entries: CryptoEntry[]) => Promise<void>;
  updateFreetext: (entries: FreetextEntry[]) => Promise<void>;
  updateHealth: (health: HealthData) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isLocked, setIsLocked] = useState(true);
  const [appData, setAppData] = useState<AppData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [password, setPassword] = useState<string | null>(null); // Keep password in memory while unlocked

  // Initialize: Check if app has been set up
  useEffect(() => {
    const initialize = async () => {
      try {
        await databaseService.init();
        // Check if encrypted data exists (app is set up)
        const hasData = await databaseService.hasEncryptedData();
        if (!hasData) {
          // New app - stay locked, will go to setup screen
          setIsLocked(true);
          setAppData(null);
        }
      } catch (err) {
        console.error('Auth initialization failed:', err);
        setError(err instanceof Error ? err.message : 'Initialization failed');
      }
    };
    initialize();
  }, []);

  /**
   * Save current appData to IndexedDB as encrypted blob
   */
  const saveToDatabase = useCallback(
    async (data: AppData, password: string) => {
      try {
        const saltBase64 = await databaseService.getConfig('salt');
        if (!saltBase64) {
          throw new Error('Salt not found - account may not be properly initialized');
        }

        // Convert Base64 salt back to Uint8Array
        const salt = base64ToUint8Array(saltBase64);

        const dataJson = JSON.stringify(data);
        const encryptedData = await cryptoService.encrypt(dataJson, password, salt);

        await databaseService.saveEncryptedData(encryptedData);
        await databaseService.setConfig('lastModified', Date.now());
      } catch (err) {
        console.error('Failed to save data:', err);
        throw err;
      }
    },
    []
  );

  /**
   * Unlock the app with master password OR recovery phrase
   */
  const unlock = useCallback(
    async (pwd: string, recoveryPhrase?: string) => {
      try {
        setError(null);

        // Determine unlock mode
        const isRecoveryMode = !pwd && recoveryPhrase;
        let actualPassword = pwd;

        // If using recovery phrase only, decrypt the password first
        if (isRecoveryMode && recoveryPhrase) {
          console.log('AuthContext: Recovery mode - decrypting password with recovery phrase');

          const encryptedPassword = await databaseService.getConfig('encryptedPassword');
          if (!encryptedPassword) {
            throw new Error('No encrypted password found. This account may not support recovery phrase unlock.');
          }

          // Decrypt password using recovery phrase
          actualPassword = await cryptoService.decryptPasswordWithRecoveryPhrase(
            encryptedPassword,
            recoveryPhrase
          );
          console.log('AuthContext: Password recovered successfully');
        }

        // Get encrypted data (includes salt)
        let encryptedData = await databaseService.getEncryptedData();

        // If no local data, try downloading from OneDrive (fresh device scenario)
        if (!encryptedData) {
          console.log('AuthContext: No local data found, attempting to download from OneDrive...');

          if (oneDriveService.isSignedIn()) {
            const downloadedData = await oneDriveService.downloadData();
            if (downloadedData) {
              console.log('AuthContext: Data downloaded from OneDrive');
              // Save to local IndexedDB
              await databaseService.saveEncryptedData(downloadedData);
              encryptedData = downloadedData;
            } else {
              console.log('AuthContext: No data found on OneDrive');
            }
          } else {
            console.log('AuthContext: OneDrive not signed in, cannot download');
          }

          // If still no data after download attempt, throw error
          if (!encryptedData) {
            throw new Error('No encrypted data found. Please sign in to OneDrive to download your data, or set up a new account.');
          }
        }

        // Decrypt with actual password (either provided directly or recovered from recovery phrase)
        const decryptedJson = await cryptoService.decrypt(
          encryptedData,
          actualPassword
        );
        const data: AppData = JSON.parse(decryptedJson);

        setAppData(data);
        setPassword(actualPassword); // Store password for re-encryption on data changes
        setIsLocked(false);
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Unlock failed';
        setError(message);
        throw err;
      }
    },
    []
  );

  /**
   * Lock the app (clear all decrypted data)
   */
  const lock = useCallback(async () => {
    setAppData(null);
    setPassword(null); // Clear password from memory
    setIsLocked(true);
    setError(null);
  }, []);

  /**
   * Reload data from IndexedDB (after sync operations)
   * Uses stored password to decrypt updated data without requiring user re-entry
   */
  const reloadFromDatabase = useCallback(async () => {
    if (!password || isLocked) {
      throw new Error('Cannot reload: app is locked or password not available');
    }

    try {
      setError(null);

      // Get latest encrypted data from IndexedDB
      const encryptedData = await databaseService.getEncryptedData();
      if (!encryptedData) {
        throw new Error('No encrypted data found in database');
      }

      // Decrypt with stored password
      const decryptedJson = await cryptoService.decrypt(encryptedData, password);
      const data: AppData = JSON.parse(decryptedJson);

      // Update in-memory state
      setAppData(data);
      console.log('AuthContext: Data reloaded from database successfully');
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to reload data';
      setError(message);
      throw err;
    }
  }, [password, isLocked]);

  /**
   * Create a new account (first-time setup)
   */
  const createAccount = useCallback(
    async (password: string, recoveryPhrase: string) => {
      try {
        setError(null);

        // Validate recovery phrase
        if (!cryptoService.validateRecoveryPhrase(recoveryPhrase)) {
          throw new Error('Invalid recovery phrase');
        }

        // Generate salt by encrypting empty data (salt is included in EncryptedData)
        const deviceId = crypto.getRandomValues(new Uint8Array(16)).toString();

        // Initialize empty AppData
        const initialData: AppData = {
          passwords: [],
          creditCards: [],
          crypto: [],
          freetext: [],
          health: {
            providers: [],
            conditions: [],
            impairments: [],
            journal: [],
          },
          metadata: {
            version: 1,
            lastModified: Date.now(),
            deviceId,
          },
        };

        // Encrypt and save (this generates salt internally)
        const dataJson = JSON.stringify(initialData);
        const encryptedData = await cryptoService.encrypt(
          dataJson,
          password
          // Don't pass recovery phrase on initial setup - just use password
        );

        // IMPORTANT: Encrypt password with recovery phrase (password escrow)
        // This allows recovery phrase to recover the password if user forgets it
        const encryptedPassword = await cryptoService.encryptPasswordWithRecoveryPhrase(
          password,
          recoveryPhrase
        );

        // Save to database
        await databaseService.saveEncryptedData(encryptedData);
        // Extract salt from encryptedData and save separately
        await databaseService.setConfig('salt', encryptedData.salt);
        await databaseService.setConfig('deviceId', deviceId);
        // Store encrypted password for recovery
        await databaseService.setConfig('encryptedPassword', encryptedPassword);

        // Unlock the app
        setAppData(initialData);
        setPassword(password); // Store password for later re-encryption
        setIsLocked(false);
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Account creation failed';
        setError(message);
        throw err;
      }
    },
    []
  );

  /**
   * Helper to update AppData and save to database
   */
  const updateAppData = useCallback(
    async (updateFn: (data: AppData) => AppData) => {
      if (!appData || isLocked || !password) {
        throw new Error('App is locked or no data loaded');
      }

      try {
        const updatedData = updateFn(appData);
        setAppData(updatedData);

        // Re-encrypt and save to database
        await saveToDatabase(updatedData, password);
      } catch (err) {
        console.error('Failed to update data:', err);
        throw err;
      }
    },
    [appData, isLocked, password, saveToDatabase]
  );

  /**
   * Update passwords
   */
  const updatePasswords = useCallback(
    async (entries: PasswordEntry[]) => {
      await updateAppData((data) => ({
        ...data,
        passwords: entries,
        metadata: { ...data.metadata, lastModified: Date.now() },
      }));
    },
    [updateAppData]
  );

  /**
   * Update credit cards
   */
  const updateCreditCards = useCallback(
    async (entries: CreditCardEntry[]) => {
      await updateAppData((data) => ({
        ...data,
        creditCards: entries,
        metadata: { ...data.metadata, lastModified: Date.now() },
      }));
    },
    [updateAppData]
  );

  /**
   * Update crypto entries
   */
  const updateCrypto = useCallback(
    async (entries: CryptoEntry[]) => {
      await updateAppData((data) => ({
        ...data,
        crypto: entries,
        metadata: { ...data.metadata, lastModified: Date.now() },
      }));
    },
    [updateAppData]
  );

  /**
   * Update freetext entries
   */
  const updateFreetext = useCallback(
    async (entries: FreetextEntry[]) => {
      await updateAppData((data) => ({
        ...data,
        freetext: entries,
        metadata: { ...data.metadata, lastModified: Date.now() },
      }));
    },
    [updateAppData]
  );

  /**
   * Update health data
   */
  const updateHealth = useCallback(
    async (health: HealthData) => {
      await updateAppData((data) => ({
        ...data,
        health,
        metadata: { ...data.metadata, lastModified: Date.now() },
      }));
    },
    [updateAppData]
  );

  return (
    <AuthContext.Provider
      value={{
        isLocked,
        appData,
        error,
        unlock,
        lock,
        createAccount,
        reloadFromDatabase,
        updatePasswords,
        updateCreditCards,
        updateCrypto,
        updateFreetext,
        updateHealth,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};
