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
  recoveryPhrase?: string;    // A single recovery phrase
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
  description: string;              // e.g., "SSN", "Insurance", "Passport", "Custom"
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
  elaboration?: string;          // Freetext for more detail
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
