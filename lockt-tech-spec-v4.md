# Lockt: Detailed Technical Specification & Implementation Plan v4.0

---

## 1. Executive Summary

**Lockt** is a security-focused Progressive Web App (PWA) for storing and accessing sensitive personal data. It uses client-side encryption with OneDrive as the storage backend, enabling secure multi-device access without a custom server infrastructure. Primary use is personal/family, with iPhone as the primary access device and desktop for data entry.

**Key Principles:**
- **Zero-Knowledge Security:** All encryption/decryption happens client-side. OneDrive stores only encrypted data.
- **Mobile-First UI:** Optimized for iPhone Safari, but fully functional on desktop browsers.
- **Simple Sync:** OneDrive handles storage, versioning, and availability.
- **Extensible Architecture:** Designed to accommodate future features like inline editing, unencrypted exports, and Bank Register integration.

---

## 2. Complete Technology Stack

| Component | Technology | Version | Purpose |
|:---|:---|:---|:---|
| **Build Tool** | Vite | 5.x | Fast dev server, optimized builds, PWA support |
| **Framework** | React | 18.x | Component-based UI architecture |
| **Language** | TypeScript | 5.x | Type safety for data models and crypto operations |
| **Client Database** | IndexedDB via `idb` | 8.x | Local encrypted data storage |
| **Encryption** | Web Crypto API | Native | AES-GCM encryption, PBKDF2 key derivation |
| **Biometric Auth** | WebAuthn API | Native | Secure, passwordless authentication using device biometrics (Face ID, Windows Hello, Touch ID) and Passkeys. |
| **Cloud Storage** | Microsoft OneDrive | Graph API v1.0 | Encrypted file sync across devices |
| **Authentication** | MSAL.js | 3.x | Microsoft account authentication |
| **Styling** | Styled-components | 6.x | Component-scoped CSS matching PayTrax aesthetic |
| **PWA Support** | vite-plugin-pwa | 0.19.x | Service worker, offline support, installability |
| **UUID Generation** | uuid | 9.x | Unique identifiers for records |
| **Date Handling** | date-fns | 3.x | Date parsing and formatting |
| **State Management** | React Context + useReducer | Native | Global app state management |

---

## 3. Project Structure

```
lockt/
├── public/
│   ├── manifest.json           # PWA manifest
│   ├── icons/                  # App icons (various sizes)
│   └── offline.html            # Offline fallback page
├── src/
│   ├── components/
│   │   ├── auth/
│   │   │   ├── LoginScreen.tsx
│   │   │   ├── SetupScreen.tsx
│   │   │   ├── RecoveryPhraseDisplay.tsx
│   │   │   └── BiometricSetup.tsx
│   │   ├── layout/
│   │   │   ├── AppShell.tsx
│   │   │   ├── TabNavigation.tsx
│   │   │   ├── Header.tsx
│   │   │   └── LockButton.tsx
│   │   ├── common/
│   │   │   ├── Button.tsx
│   │   │   ├── Input.tsx
│   │   │   ├── Modal.tsx
│   │   │   ├── SearchBar.tsx
│   │   │   ├── LoadingSpinner.tsx
│   │   │   ├── InlineEdit.tsx          # NEW: Reusable inline editing component
│   │   │   └── ConfirmDialog.tsx       # NEW: Confirmation dialogs
│   │   ├── passwords/
│   │   │   ├── PasswordList.tsx
│   │   │   ├── PasswordQuickView.tsx
│   │   │   ├── PasswordDetail.tsx
│   │   │   └── PasswordForm.tsx
│   │   ├── credit-cards/
│   │   │   ├── CreditCardList.tsx
│   │   │   ├── CreditCardQuickView.tsx
│   │   │   ├── CreditCardDetail.tsx
│   │   │   └── CreditCardForm.tsx
│   │   ├── crypto/
│   │   │   ├── CryptoList.tsx
│   │   │   ├── CryptoQuickView.tsx
│   │   │   ├── CryptoDetail.tsx
│   │   │   └── CryptoForm.tsx
│   │   ├── freetext/                   # NEW: Freetext data section
│   │   │   ├── FreetextList.tsx
│   │   │   ├── FreetextQuickView.tsx
│   │   │   ├── FreetextDetail.tsx
│   │   │   └── FreetextForm.tsx
│   │   ├── health/
│   │   │   ├── HealthTabs.tsx
│   │   │   ├── ProviderList.tsx
│   │   │   ├── ConditionList.tsx
│   │   │   ├── ImpairmentList.tsx
│   │   │   ├── JournalList.tsx
│   │   │   └── [corresponding Detail/Form components]
│   │   ├── export/                     # NEW: Export functionality
│   │   │   ├── ExportDialog.tsx
│   │   │   └── ExportOptions.tsx
│   │   └── future/                     # NEW: Placeholder for future features
│   │       └── BankRegisterPlaceholder.tsx
│   ├── services/
│   │   ├── crypto.service.ts           # Encryption/decryption
│   │   ├── database.service.ts         # IndexedDB operations
│   │   ├── onedrive.service.ts         # OneDrive sync
│   │   ├── auth.service.ts             # Authentication logic
│   │   ├── biometric.service.ts        # WebAuthn integration
│   │   ├── search.service.ts           # Search functionality
│   │   ├── export.service.ts           # NEW: Export service for unencrypted data
│   │   └── inline-edit.service.ts      # NEW: Inline editing state management
│   ├── context/
│   │   ├── AppContext.tsx              # Global state
│   │   ├── AuthContext.tsx             # Auth state
│   │   ├── DataContext.tsx             # Decrypted data state
│   │   └── EditContext.tsx             # NEW: Inline editing state
│   ├── hooks/
│   │   ├── useAuth.ts
│   │   ├── useData.ts
│   │   ├── useSync.ts
│   │   ├── useSearch.ts
│   │   ├── useInlineEdit.ts            # NEW: Inline editing hook
│   │   └── useExport.ts                # NEW: Export functionality hook
│   ├── types/
│   │   ├── index.ts                    # Main type exports
│   │   ├── data.types.ts               # Data model types
│   │   ├── auth.types.ts               # Auth types
│   │   ├── sync.types.ts               # Sync types
│   │   ├── export.types.ts             # NEW: Export types
│   │   └── future.types.ts             # NEW: Future feature types
│   ├── utils/
│   │   ├── validation.ts               # Input validation
│   │   ├── formatting.ts               # Data formatting
│   │   ├── constants.ts                # App constants
│   │   └── export-formatters.ts        # NEW: Export formatting utilities
│   ├── styles/
│   │   ├── theme.ts                    # Styled-components theme
│   │   └── GlobalStyles.ts             # Global CSS
│   ├── App.tsx
│   ├── main.tsx
│   └── vite-env.d.ts
├── package.json
├── tsconfig.json
├── vite.config.ts
└── README.md
```

---

## 4. Complete Data Model

### 4.1. Type Definitions

```typescript
// src/types/data.types.ts

export interface PasswordEntry {
  id: string;                    // UUID
  account: string;                // e.g., "Bank of America"
  username: string;
  password: string;
  pin: string;
  accountNumber?: string;
  routingNumber?: string;
  email?: string;
  phone?: string;
  fax?: string;
  mailingAddress?: string;
  url?: string;
  notes?: string;
  createdAt: number;             // Unix timestamp
  updatedAt: number;
  tags?: string[];               // For categorization
}

export interface CreditCardEntry {
  id: string;
  accountName: string;           // e.g., "Chase Sapphire Reserve"
  cardNumber: string;            // Store as string to preserve leading zeros
  expirationDate: string;        // Format: "MM/YY"
  cscCode: string;
  email?: string;
  phone?: string;
  fax?: string;
  mailingAddress?: string;
  url?: string;
  notes?: string;
  createdAt: number;
  updatedAt: number;
  tags?: string[];
}

export interface CryptoEntry {
  id: string;
  account: string;               // e.g., "Coinbase"
  username: string;
  password: string;
  pin: string;
  accountNumber?: string;
  routingNumber?: string;
  recoveryPhrases?: string[];    // Array to support multiple phrases
  email?: string;
  phone?: string;
  fax?: string;
  walletAddressEth?: string;
  walletAddressBtc?: string;
  walletAddressSol?: string;
  walletAddressOther?: string;
  createdAt: number;
  updatedAt: number;
  tags?: string[];
}

// NEW: Freetext Entry for flexible data storage
export interface FreetextEntry {
  id: string;
  title: string;                 // e.g., "John's SSN", "Home Insurance Policy"
  category: string;              // e.g., "SSN", "Insurance", "Passport", "Custom"
  content: string;               // Main freetext content (rich text / markdown support)
  fields?: FreetextField[];      // Structured key-value pairs for semi-structured data
  attachedTo?: string;           // Optional: Person/family member name
  email?: string;
  phone?: string;
  url?: string;
  notes?: string;
  createdAt: number;
  updatedAt: number;
  tags?: string[];
}

// NEW: Flexible field structure for freetext entries
export interface FreetextField {
  id: string;
  label: string;                 // e.g., "SSN", "Policy Number", "Expiration Date"
  value: string;
  type: 'text' | 'date' | 'number' | 'email' | 'phone' | 'url';
  masked?: boolean;              // Whether to mask this field by default
}

export interface HealthProvider {
  id: string;
  drName: string;
  specialty: string;
  email?: string;
  phone?: string;
  fax?: string;
  account?: string;
  createdAt: number;
  updatedAt: number;
}

export interface HealthCondition {
  id: string;
  condition: string;
  dateOfDiagnosis?: number;      // Unix timestamp
  diagnosingDoctorOrAgency?: string;
  symptomology?: string;
  createdAt: number;
  updatedAt: number;
}

export interface HealthImpairment {
  id: string;
  description: string;
  dateOfOnset?: number;          // Unix timestamp
  contributingConditionIds?: string[];  // References to HealthCondition IDs
  createdAt: number;
  updatedAt: number;
}

export interface HealthJournalEntry {
  id: string;
  date: number;                  // Unix timestamp
  reasonForEntry: string;
  painLevel: number;             // 0-10
  entry: string;
  createdAt: number;
  updatedAt: number;
}

export interface HealthData {
  providers: HealthProvider[];
  conditions: HealthCondition[];
  impairments: HealthImpairment[];
  journal: HealthJournalEntry[];
}

export interface AppData {
  passwords: PasswordEntry[];
  creditCards: CreditCardEntry[];
  crypto: CryptoEntry[];
  freetext: FreetextEntry[];     // NEW: Freetext data array
  health: HealthData;
  metadata: {
    version: number;             // Schema version for future migrations
    lastModified: number;        // Unix timestamp
    deviceId: string;            // UUID of last device to modify
  };
}

export interface EncryptedData {
  iv: string;                    // Base64 encoded initialization vector
  salt: string;                  // Base64 encoded salt for key derivation
  ciphertext: string;            // Base64 encoded encrypted data
  version: number;               // Encryption version for future algorithm changes
}

export interface RecoveryPhrase {
  words: string[];               // 12-word BIP39-style phrase
  checksum: string;              // For validation
}

// NEW: Inline edit types
export interface InlineEditState {
  isEditing: boolean;
  entryId: string | null;
  fieldName: string | null;
  originalValue: any;
  isDirty: boolean;
}

export interface EditableFieldProps {
  value: any;
  fieldName: string;
  entryId: string;
  type: 'text' | 'number' | 'date' | 'email' | 'phone' | 'url' | 'textarea';
  masked?: boolean;
  onSave: (entryId: string, fieldName: string, newValue: any) => Promise<void>;
  onCancel?: () => void;
  validation?: (value: any) => boolean | string;
}
```

### 4.2. Export Types

```typescript
// src/types/export.types.ts

export type ExportFormat = 'json' | 'csv' | 'txt' | 'encrypted-json';

export type ExportScope = 'all' | 'passwords' | 'creditCards' | 'crypto' | 'freetext' | 'health';

export interface ExportOptions {
  format: ExportFormat;
  scope: ExportScope;
  includeMetadata: boolean;
  maskSensitiveFields: boolean;  // Option to mask passwords, SSNs, etc. in export
  timestamp: boolean;            // Include timestamp in filename
}

export interface ExportResult {
  filename: string;
  blob: Blob;
  size: number;
}
```

### 4.3. Future Feature Types

```typescript
// src/types/future.types.ts

// Placeholder types for future Bank Register integration
export interface BankTransaction {
  id: string;
  date: number;
  description: string;
  category: string;
  amount: number;
  type: 'debit' | 'credit';
  balance: number;
  cleared: boolean;
  accountId: string;             // References to PasswordEntry or CreditCardEntry
  tags?: string[];
  notes?: string;
  createdAt: number;
  updatedAt: number;
}

export interface BankAccount {
  id: string;
  accountName: string;
  accountType: 'checking' | 'savings' | 'credit' | 'investment';
  linkedEntryId?: string;        // Links to PasswordEntry or CreditCardEntry
  initialBalance: number;
  currentBalance: number;
  transactions: BankTransaction[];
  createdAt: number;
  updatedAt: number;
}

// Future extension to AppData
export interface AppDataV2 extends AppData {
  bankRegister?: {
    accounts: BankAccount[];
    metadata: {
      lastReconciled: number;
      autoCategories: Record<string, string>;
    };
  };
}
```

### 4.4. Initial Data Structure

```typescript
const initialAppData: AppData = {
  passwords: [],
  creditCards: [],
  crypto: [],
  freetext: [],                  // NEW: Empty freetext array
  health: {
    providers: [],
    conditions: [],
    impairments: [],
    journal: []
  },
  metadata: {
    version: 1,
    lastModified: Date.now(),
    deviceId: generateUUID()
  }
};
```

---

## 5. Cryptography Specification

### 5.1. Encryption Algorithm Details

**Algorithm:** AES-GCM (Advanced Encryption Standard - Galois/Counter Mode)
- **Key Size:** 256 bits
- **IV Size:** 96 bits (12 bytes) - randomly generated for each encryption
- **Tag Length:** 128 bits - provides authenticity verification

**Key Derivation:** PBKDF2 (Password-Based Key Derivation Function 2)
- **Hash Function:** SHA-256
- **Iterations:** 600,000 (OWASP recommendation as of 2024)
- **Salt Size:** 128 bits (16 bytes) - randomly generated on first setup
- **Output:** 256-bit encryption key

### 5.2. Complete Crypto Service Implementation

```typescript
// src/services/crypto.service.ts

import { EncryptedData, RecoveryPhrase } from '../types/data.types';

/**
 * Cryptography Service
 * Handles all encryption, decryption, and key management operations
 */
class CryptoService {
  private readonly PBKDF2_ITERATIONS = 600000;
  private readonly KEY_LENGTH = 256;
  private readonly IV_LENGTH = 12; // bytes
  private readonly SALT_LENGTH = 16; // bytes
  private readonly ENCRYPTION_VERSION = 1;

  /**
   * Generate a random salt for key derivation
   */
  private generateSalt(): Uint8Array {
    return crypto.getRandomValues(new Uint8Array(this.SALT_LENGTH));
  }

  /**
   * Generate a random IV for encryption
   */
  private generateIV(): Uint8Array {
    return crypto.getRandomValues(new Uint8Array(this.IV_LENGTH));
  }

  /**
   * Convert ArrayBuffer to Base64 string
   */
  private arrayBufferToBase64(buffer: ArrayBuffer): string {
    const bytes = new Uint8Array(buffer);
    let binary = '';
    for (let i = 0; i < bytes.length; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    return btoa(binary);
  }

  /**
   * Convert Base64 string to ArrayBuffer
   */
  private base64ToArrayBuffer(base64: string): ArrayBuffer {
    const binary = atob(base64);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) {
      bytes[i] = binary.charCodeAt(i);
    }
    return bytes.buffer;
  }

  /**
   * Derive a cryptographic key from password and salt
   */
  async deriveKey(
    password: string,
    salt: Uint8Array,
    recoveryPhrase?: string
  ): Promise<CryptoKey> {
    // Combine password with recovery phrase if provided
    const keyMaterial = recoveryPhrase 
      ? `${password}:${recoveryPhrase}` 
      : password;

    // Import password as key material
    const passwordKey = await crypto.subtle.importKey(
      'raw',
      new TextEncoder().encode(keyMaterial),
      'PBKDF2',
      false,
      ['deriveBits', 'deriveKey']
    );

    // Derive actual encryption key
    return crypto.subtle.deriveKey(
      {
        name: 'PBKDF2',
        salt: salt,
        iterations: this.PBKDF2_ITERATIONS,
        hash: 'SHA-256'
      },
      passwordKey,
      { name: 'AES-GCM', length: this.KEY_LENGTH },
      true, // extractable (for keychain storage)
      ['encrypt', 'decrypt']
    );
  }

  /**
   * Encrypt data with derived key
   */
  async encrypt(
    data: string,
    password: string,
    salt?: Uint8Array,
    recoveryPhrase?: string
  ): Promise<EncryptedData> {
    try {
      // Generate salt if not provided (first-time encryption)
      const actualSalt = salt || this.generateSalt();
      
      // Derive encryption key
      const key = await this.deriveKey(password, actualSalt, recoveryPhrase);
      
      // Generate IV
      const iv = this.generateIV();
      
      // Encrypt data
      const encodedData = new TextEncoder().encode(data);
      const ciphertext = await crypto.subtle.encrypt(
        { name: 'AES-GCM', iv: iv },
        key,
        encodedData
      );

      return {
        iv: this.arrayBufferToBase64(iv),
        salt: this.arrayBufferToBase64(actualSalt),
        ciphertext: this.arrayBufferToBase64(ciphertext),
        version: this.ENCRYPTION_VERSION
      };
    } catch (error) {
      console.error('Encryption failed:', error);
      throw new Error('Failed to encrypt data');
    }
  }

  /**
   * Decrypt data with password
   */
  async decrypt(
    encryptedData: EncryptedData,
    password: string,
    recoveryPhrase?: string
  ): Promise<string> {
    try {
      // Convert Base64 strings back to ArrayBuffers
      const iv = this.base64ToArrayBuffer(encryptedData.iv);
      const salt = this.base64ToArrayBuffer(encryptedData.salt);
      const ciphertext = this.base64ToArrayBuffer(encryptedData.ciphertext);

      // Derive key with same salt
      const key = await this.deriveKey(
        password, 
        new Uint8Array(salt), 
        recoveryPhrase
      );

      // Decrypt
      const decryptedData = await crypto.subtle.decrypt(
        { name: 'AES-GCM', iv: new Uint8Array(iv) },
        key,
        ciphertext
      );

      // Decode to string
      return new TextDecoder().decode(decryptedData);
    } catch (error) {
      console.error('Decryption failed:', error);
      throw new Error('Failed to decrypt data - incorrect password or corrupted data');
    }
  }

  /**
   * Generate a 12-word recovery phrase
   * Uses a simplified wordlist approach
   */
  generateRecoveryPhrase(): RecoveryPhrase {
    // BIP39-style word list (simplified - in production use full BIP39 list)
    const wordList = [
      'abandon', 'ability', 'able', 'about', 'above', 'absent', 'absorb', 'abstract',
      'absurd', 'abuse', 'access', 'accident', 'account', 'accuse', 'achieve', 'acid',
      // ... (include full 2048-word BIP39 list in production)
      'zone', 'zoo'
    ];

    const words: string[] = [];
    const randomValues = new Uint32Array(12);
    crypto.getRandomValues(randomValues);

    for (let i = 0; i < 12; i++) {
      const index = randomValues[i] % wordList.length;
      words.push(wordList[index]);
    }

    // Generate checksum (simple hash of words)
    const checksum = this.arrayBufferToBase64(
      crypto.subtle.digest('SHA-256', new TextEncoder().encode(words.join(' ')))
    );

    return { words, checksum };
  }

  /**
   * Validate recovery phrase format
   */
  validateRecoveryPhrase(phrase: string): boolean {
    const words = phrase.trim().toLowerCase().split(/\s+/);
    return words.length === 12;
  }

  /**
   * Hash password for storage (if needed for password verification)
   */
  async hashPassword(password: string): Promise<string> {
    const encoder = new TextEncoder();
    const data = encoder.encode(password);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    return this.arrayBufferToBase64(hashBuffer);
  }
}

export const cryptoService = new CryptoService();
```

---
*************************************************************************************************
## 6. Database Service Specification

### 6.1. IndexedDB Schema

**Database Name:** `lockt-db`
**Version:** 1

**Object Stores:**
1. **`encrypted-data`** - Stores the single encrypted blob
   - Key: `'main'` (single record)
   - Value: EncryptedData object

2. **`app-config`** - Stores app configuration
   - Key: configKey (string)
   - Value: any
   - Used for: salt, recovery phrase hash, last sync timestamp, device ID

### 6.2. Database Service Implementation

```typescript
// src/services/database.service.ts

import { openDB, DBSchema, IDBPDatabase } from 'idb';
import { EncryptedData } from '../types/data.types';

interface LocktDB extends DBSchema {
  'encrypted-data': {
    key: string;
    value: EncryptedData;
  };
  'app-config': {
    key: string;
    value: any;
  };
}

class DatabaseService {
  private db: IDBPDatabase<LocktDB> | null = null;
  private readonly DB_NAME = 'lockt-db';
  private readonly DB_VERSION = 1;

  /**
   * Initialize database connection
   */
  async init(): Promise<void> {
    if (this.db) return;

    this.db = await openDB<LocktDB>(this.DB_NAME, this.DB_VERSION, {
      upgrade(db) {
        // Create object stores if they don't exist
        if (!db.objectStoreNames.contains('encrypted-data')) {
          db.createObjectStore('encrypted-data');
        }
        if (!db.objectStoreNames.contains('app-config')) {
          db.createObjectStore('app-config');
        }
      },
    });
  }

  /**
   * Save encrypted data blob
   */
  async saveEncryptedData(data: EncryptedData): Promise<void> {
    await this.init();
    await this.db!.put('encrypted-data', data, 'main');
  }

  /**
   * Retrieve encrypted data blob
   */
  async getEncryptedData(): Promise<EncryptedData | undefined> {
    await this.init();
    return this.db!.get('encrypted-data', 'main');
  }

  /**
   * Check if encrypted data exists (first-time setup check)
   */
  async hasEncryptedData(): Promise<boolean> {
    await this.init();
    const data = await this.db!.get('encrypted-data', 'main');
    return data !== undefined;
  }

  /**
   * Save configuration value
   */
  async setConfig(key: string, value: any): Promise<void> {
    await this.init();
    await this.db!.put('app-config', value, key);
  }

  /**
   * Retrieve configuration value
   */
  async getConfig(key: string): Promise<any> {
    await this.init();
    return this.db!.get('app-config', key);
  }

  /**
   * Delete all data (for app reset)
   */
  async clearAll(): Promise<void> {
    await this.init();
    await this.db!.clear('encrypted-data');
    await this.db!.clear('app-config');
  }

  /**
   * Export encrypted data as downloadable file
   */
  async exportBackup(): Promise<Blob> {
    const data = await this.getEncryptedData();
    if (!data) {
      throw new Error('No data to export');
    }
    
    const config = {
      salt: await this.getConfig('salt'),
      deviceId: await this.getConfig('deviceId'),
      exportDate: Date.now()
    };

    const exportData = {
      ...data,
      config
    };

    return new Blob(
      [JSON.stringify(exportData, null, 2)], 
      { type: 'application/json' }
    );
  }

  /**
   * Import encrypted data from backup file
   */
  async importBackup(fileContent: string): Promise<void> {
    try {
      const importData = JSON.parse(fileContent);
      
      // Validate structure
      if (!importData.iv || !importData.salt || !importData.ciphertext) {
        throw new Error('Invalid backup file format');
      }

      // Save encrypted data
      await this.saveEncryptedData({
        iv: importData.iv,
        salt: importData.salt,
        ciphertext: importData.ciphertext,
        version: importData.version || 1
      });

      // Restore config if present
      if (importData.config) {
        if (importData.config.salt) {
          await this.setConfig('salt', importData.config.salt);
        }
        if (importData.config.deviceId) {
          await this.setConfig('deviceId', importData.config.deviceId);
        }
      }
    } catch (error) {
      console.error('Import failed:', error);
      throw new Error('Failed to import backup - invalid file format');
    }
  }
}

export const databaseService = new DatabaseService();
```

---

## 7. OneDrive Sync Service Specification

### 7.1. Microsoft Graph API Integration

**API Endpoint:** `https://graph.microsoft.com/v1.0`
**Authentication:** OAuth 2.0 via MSAL.js
**File Location:** `/me/drive/special/approot/lockt-data.encrypted`

**Required Permissions:**
- `Files.ReadWrite.AppFolder` - Read/write access to app-specific folder only

### 7.2. OneDrive Service Implementation

```typescript
// src/services/onedrive.service.ts

import { PublicClientApplication } from '@azure/msal-browser';
import { EncryptedData } from '../types/data.types';

interface OneDriveFileMetadata {
  lastModifiedDateTime: string;
  size: number;
  id: string;
}

class OneDriveService {
  private msalInstance: PublicClientApplication | null = null;
  private readonly SCOPES = ['Files.ReadWrite.AppFolder'];
  private readonly FILE_NAME = 'lockt-data.encrypted';
  private readonly GRAPH_ENDPOINT = 'https://graph.microsoft.com/v1.0';

  /**
   * Initialize MSAL authentication
   */
  async init(clientId: string): Promise<void> {
    this.msalInstance = new PublicClientApplication({
      auth: {
        clientId: clientId,
        authority: 'https://login.microsoftonline.com/common',
        redirectUri: window.location.origin
      },
      cache: {
        cacheLocation: 'localStorage',
        storeAuthStateInCookie: false
      }
    });

    await this.msalInstance.initialize();
  }

  /**
   * Sign in to Microsoft account
   */
  async signIn(): Promise<void> {
    if (!this.msalInstance) {
      throw new Error('OneDrive service not initialized');
    }

    try {
      await this.msalInstance.loginPopup({
        scopes: this.SCOPES
      });
    } catch (error) {
      console.error('OneDrive sign-in failed:', error);
      throw new Error('Failed to sign in to OneDrive');
    }
  }

  /**
   * Get access token for Graph API calls
   */
  private async getAccessToken(): Promise<string> {
    if (!this.msalInstance) {
      throw new Error('OneDrive service not initialized');
    }

    const accounts = this.msalInstance.getAllAccounts();
    if (accounts.length === 0) {
      throw new Error('No signed-in account found');
    }

    const response = await this.msalInstance.acquireTokenSilent({
      scopes: this.SCOPES,
      account: accounts[0]
    });

    return response.accessToken;
  }

  /**
   * Check if user is signed in
   */
  isSignedIn(): boolean {
    if (!this.msalInstance) return false;
    return this.msalInstance.getAllAccounts().length > 0;
  }

  /**
   * Sign out of Microsoft account
   */
  async signOut(): Promise<void> {
    if (!this.msalInstance) return;
    
    const accounts = this.msalInstance.getAllAccounts();
    if (accounts.length > 0) {
      await this.msalInstance.logoutPopup({
        account: accounts[0]
      });
    }
  }

  /**
   * Upload encrypted data to OneDrive
   */
  async uploadData(encryptedData: EncryptedData): Promise<void> {
    try {
      const token = await this.getAccessToken();
      
      const fileContent = JSON.stringify(encryptedData);
      const endpoint = `${this.GRAPH_ENDPOINT}/me/drive/special/approot:/${this.FILE_NAME}:/content`;

      const response = await fetch(endpoint, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: fileContent
      });

      if (!response.ok) {
        throw new Error(`Upload failed: ${response.statusText}`);
      }
    } catch (error) {
      console.error('OneDrive upload failed:', error);
      throw new Error('Failed to upload data to OneDrive');
    }
  }

  /**
   * Download encrypted data from OneDrive
   */
  async downloadData(): Promise<EncryptedData | null> {
    try {
      const token = await this.getAccessToken();
      const endpoint = `${this.GRAPH_ENDPOINT}/me/drive/special/approot:/${this.FILE_NAME}:/content`;

      const response = await fetch(endpoint, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.status === 404) {
        return null; // File doesn't exist yet
      }

      if (!response.ok) {
        throw new Error(`Download failed: ${response.statusText}`);
      }

      const data = await response.json();
      return data as EncryptedData;
    } catch (error) {
      console.error('OneDrive download failed:', error);
      throw new Error('Failed to download data from OneDrive');
    }
  }

  /**
   * Get file metadata (for sync comparison)
   */
  async getFileMetadata(): Promise<OneDriveFileMetadata | null> {
    try {
      const token = await this.getAccessToken();
      const endpoint = `${this.GRAPH_ENDPOINT}/me/drive/special/approot:/${this.FILE_NAME}`;

      const response = await fetch(endpoint, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.status === 404) {
        return null;
      }

      if (!response.ok) {
        throw new Error(`Metadata fetch failed: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('OneDrive metadata fetch failed:', error);
      return null;
    }
  }

  /**
   * Sync logic: Compare local and remote timestamps
   */
  async sync(
    localData: EncryptedData,
    localTimestamp: number
  ): Promise<{
    action: 'upload' | 'download' | 'conflict' | 'none';
    remoteData?: EncryptedData;
    remoteTimestamp?: number;
  }> {
    const metadata = await this.getFileMetadata();

    // No remote file - upload local
    if (!metadata) {
      return { action: 'upload' };
    }

    const remoteTimestamp = new Date(metadata.lastModifiedDateTime).getTime();

    // Remote is newer - download
    if (remoteTimestamp > localTimestamp) {
      const remoteData = await this.downloadData();
      return {
        action: 'download',
        remoteData: remoteData!,
        remoteTimestamp
      };
    }

    // Local is newer - upload
    if (localTimestamp > remoteTimestamp) {
      return { action: 'upload' };
    }

    // Same timestamp - no action needed
    return { action: 'none' };
  }
}

export const oneDriveService = new OneDriveService();
```

---

## 8. Authentication & Security

### 8.1. Biometric & Passwordless Authentication (WebAuthn)

To provide a seamless and secure user experience, Lockt will use the **W3C WebAuthn standard** for passwordless authentication. This single, standard API allows the web app to interface with native, hardware-level security authenticators across different platforms without requiring any platform-specific code.

This approach enables what users recognize as **Passkeys**, which are securely synced across their devices (e.g., via iCloud Keychain).




************************************************************************************************
## 9. Implementation Phases

### Phase 1: Core Foundation 
**Goal**: Set up project infrastructure and basic encryption

**Tasks**:
1. Initialize Vite + React + TypeScript project
2. Set up styled-components theme matching PayTrax aesthetic
3. Implement `crypto.service.ts` with full encryption/decryption
4. Implement `database.service.ts` with IndexedDB
5. Create basic type definitions for all data models
6. Set up PWA configuration with service worker
7. Create authentication screens (LoginScreen, SetupScreen)
8. Implement recovery phrase generation and storage

**Deliverables**:
- Working encryption/decryption
- Data persistence in IndexedDB
- First-time setup flow
- Login/unlock flow

### Phase 2: Data Entry & Core UI 
**Goal**: Build out all data entry forms and list views

**Tasks**:
1. Create app shell with tab navigation
2. Implement Password entry components (List, Detail, Form)
3. Implement Credit Card entry components
4. Implement Crypto entry components
5. **NEW**: Implement Freetext entry components
6. Implement Health data components (Providers, Conditions, Impairments, Journal)
7. Build common UI components (Button, Input, Modal, SearchBar)
8. Implement global search functionality
9. Add data validation and error handling

**Deliverables**:
- Complete CRUD operations for all data types
- Working search across all entries
- Responsive mobile-first UI

### Phase 3: OneDrive Sync 
**Goal**: Implement cloud sync with OneDrive

**Tasks**:
1. Set up MSAL.js authentication
2. Register app in Azure Portal
3. Implement `onedrive.service.ts`
4. Build sync logic with conflict resolution
5. Add sync status indicators in UI
6. Implement manual and automatic sync
7. Handle offline scenarios gracefully
8. Add sync settings (frequency, Wi-Fi only, etc.)

**Deliverables**:
- Working OneDrive authentication
- Reliable sync across devices
- Conflict resolution UI

### Phase 3a: Sync Reliability & Recovery
**Goal**: Make OneDrive sync production-ready with recovery mechanisms and user controls

**Tasks**:
1. Implement salt storage in both IndexedDB and browser localStorage as backup
2. Create account recovery flow using stored salt from OneDrive or localStorage
3. Build sync settings UI component (toggle auto-sync, set frequency, Wi-Fi only option)
4. Implement sync status notifications (toast/snackbar for success/failure/conflict)
5. Create conflict resolution dialog (show timestamps, let user choose local/remote/merge)
6. Add sync progress indicators during upload/download
7. Implement retry logic for failed syncs with exponential backoff
8. Add "Last Sync" timestamp display in UI
9. Create sync error handling and user-friendly error messages
10. Test multi-device sync scenarios with conflict detection

**Implementation Details**:

#### 3a.1: Salt Recovery Mechanism
```typescript
// Store salt in multiple locations for recovery
// 1. IndexedDB app-config (current)
// 2. localStorage as backup (survives IndexedDB clear)
// 3. OneDrive metadata file (recovery from new device)

localStorage.setItem('lockt-salt-backup', saltBase64)
// Plus add to sync.service.ts:
// Upload lockt-salt-metadata.json to OneDrive for new device recovery
```

#### 3a.2: Sync Settings UI Component
**File**: `src/components/sync/SyncSettings.tsx`
```typescript
interface SyncSettings {
  autoSync: boolean;           // Enable/disable auto-sync
  syncInterval: number;        // Minutes between auto-syncs (15, 30, 60)
  wifiOnly: boolean;          // Only sync on Wi-Fi
  conflictResolution: 'newest' | 'manual' | 'merge'; // Strategy
  retryOnFailure: boolean;    // Auto-retry failed syncs
}

// UI: Toggle switches, dropdown for interval, checkboxes
// Store in IndexedDB app-config
```

#### 3a.3: Conflict Resolution Dialog
**File**: `src/components/sync/ConflictResolutionDialog.tsx`
```typescript
interface ConflictResolution {
  action: 'keep-local' | 'download-remote' | 'merge';
  localTimestamp: number;
  remoteTimestamp: number;
  selectedChoice?: 'local' | 'remote';
}

// Show:
// - Local version (timestamp, data preview)
// - Remote version (timestamp, data preview)
// - Options: Keep Local, Download Remote, Manual Merge
```

#### 3a.4: Sync Status Notifications
**File**: `src/components/sync/SyncStatusToast.tsx`
```typescript
// Show brief toast on:
// - Sync started: "Syncing to OneDrive..."
// - Sync success: "✓ Synced successfully (23:45)"
// - Sync failed: "✗ Sync failed. Retry?"
// - Conflict: "⚠ Conflict detected. Resolve?"
```

#### 3a.5: Sync Progress & Last Sync Info
**File**: Update `src/components/layout/Header.tsx` or `src/components/sync/SyncStatus.tsx`
```typescript
// Display:
// - Last sync time: "Last synced 2 minutes ago"
// - Sync status icon: (syncing) | ✓ | ✗
// - Manual sync button with loading state
```

**Deliverables**:
- ✅ Account recovery possible after IndexedDB deletion
- ✅ User-configurable sync settings with persistent storage
- ✅ Conflict resolution dialog with user choice
- ✅ Real-time sync status notifications in UI
- ✅ Last sync timestamp display
- ✅ Robust error handling with retry logic
- ✅ Multi-device sync with collision detection and resolution
- ✅ Documentation of recovery procedures for users

### Phase 4: Biometric Auth 
**Goal**: Add WebAuthn biometric authentication

**Tasks**:
1. Implement `biometric.service.ts` using WebAuthn API
2. Create biometric setup flow
3. Add biometric unlock option to login screen
4. Store WebAuthn credentials securely
5. Handle fallback to password when biometrics unavailable
6. Test across devices (iPhone, Windows, Mac, Android)

**Deliverables**:
- Face ID unlock on iPhone
- Windows Hello on desktop
- Touch ID on Mac
- Fingerprint on Android

### Phase 5: Export & Advanced Features 
**Goal**: Add export functionality and inline editing

**Tasks**:
1. **NEW**: Implement `export.service.ts`
2. **NEW**: Build export dialog with format/scope options
3. **NEW**: Add security warnings for unencrypted exports
4. **NEW**: Implement CSV, JSON, and TXT export formats
5. **NEW**: Create `inline-edit.service.ts`
6. **NEW**: Build reusable inline editing components
7. **NEW**: Integrate inline editing into all detail views
8. Add import functionality for encrypted backups
9. Implement data migration system for future schema updates

**Deliverables**:
- Multi-format export functionality
- Inline editing across all data types
- Import/export for backup and restore

### Phase 6: Polish & Testing 
**Goal**: Refinement, testing, and optimization

**Tasks**:
1. Comprehensive testing on all target devices
2. Performance optimization (especially encryption/decryption)
3. Accessibility improvements (ARIA labels, keyboard navigation)
4. Add loading states and error boundaries
5. Implement auto-lock after inactivity
6. Add app settings (theme, auto-lock timeout, etc.)
7. Create user documentation
8. **NEW**: Add placeholder for Bank Register feature
9. Security audit of crypto implementation
10. Prepare for production deployment

**Deliverables**:
- Production-ready PWA
- Complete documentation
- Passing security audit

### Phase 7: Future Enhancements (Post-Launch)
**Goals**: Add Bank Register and advanced features

**Tasks**:
1. Implement Bank Register integration
2. Add advanced search filters
3. Implement data sharing (encrypted links)
4. Add support for file attachments (encrypted)
5. Build browser extension for auto-fill
6. Add dark mode theme

---

## 10. Security Best Practices

### 10.1. Cryptographic Security
- ✅ Use Web Crypto API (hardware-accelerated, secure)
- ✅ AES-GCM for authenticated encryption
- ✅ PBKDF2 with 600,000 iterations
- ✅ Random IV for each encryption operation
- ✅ Random salt generated on first setup
- ✅ Never store master password in any form
- ✅ Recovery phrase uses BIP39 word list

### 10.2. Data Security
- ✅ All data encrypted before storage
- ✅ Encryption keys never leave client
- ✅ OneDrive stores only encrypted blobs
- ✅ No telemetry or analytics that could leak data
- ✅ Memory cleared on lock/logout
- ✅ Auto-lock after configurable timeout

### 10.3. Authentication Security
- ✅ WebAuthn for phishing-resistant authentication
- ✅ Biometric data never leaves device hardware
- ✅ Private keys stored in secure enclaves
- ✅ Public key verification on each unlock
- ✅ Fallback to password when biometrics unavailable

---

## 11. Development Setup

### 11.1. Initial Commands

```bash
# Create project
npm create vite@latest lockt -- --template react-ts
cd lockt

# Install dependencies
npm install idb @azure/msal-browser uuid date-fns styled-components

# Dev dependencies
npm install -D @types/styled-components vite-plugin-pwa

# Initialize git
git init
git add .
git commit -m "Initial commit: Lockt v4.0"
```

### 11.2. Vite Configuration

```typescript
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      manifest: {
        name: 'Lockt',
        short_name: 'Lockt',
        description: 'Secure personal data storage',
        theme_color: '#1a1a1a',
        background_color: '#ffffff',
        display: 'standalone'
      }
    })
  ]
});
```

---

## 12. Summary of v4.0 Changes

### New Features:
1. **Freetext Data Type** - Flexible storage for SSNs, insurance info, passports, etc.
2. **Export Service** - Multi-format exports (JSON, CSV, TXT) with security warnings
3. **Inline Editing** - Click-to-edit functionality across all data types
4. **Bank Register Preparation** - Types and architecture for future integration

### Documentation Improvements:
- Complete service implementations
- Detailed implementation phases
- Security best practices
- Testing strategy
- Deployment guide

---

**This specification provides a complete roadmap for building Lockt v4.0 with extensibility for future features.**