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
  notes?: string;
  createdAt: number;
  updatedAt: number;
  tags?: string[];
}

// NEW: Freetext Entry for flexible data storage
export interface FreetextEntry {
  id: string;
  title: string;                 // e.g., "John's SSN", "Home Insurance Policy"
  description: string;              // Detailed description of the entry
  category?: string;                // e.g., "SSN", "Insurance", "Passport", "Custom"
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

export type MedicationType = 'prescription' | 'supplement' | 'otc';
export type MedicationStatus = 'active' | 'planned' | 'prn' | 'not-taking';

export interface HealthMedication {
  id: string;
  name: string;
  dose: string;
  frequency: string;
  timing?: string;
  type: MedicationType;
  status: MedicationStatus;
  purpose: string;
  prescriber?: string;
  interactionNotes?: string;
  depletionNotes?: string;
  startDate?: string;
  notes?: string;
  createdAt: number;
  updatedAt: number;
}

export interface HealthDevice {
  id: string;
  deviceName: string;
  manufacturer: string;
  model: string;
  serialNumber: string;
  deviceType: string;
  implantDate: string;
  implantingPhysician: string;
  implantLocation: string;
  indication: string;
  pacingMode: string;
  lowerRate: number;
  upperTrackingRate: number;
  upperActivityRate?: number;
  rvThreshold?: string;
  rvSensing?: string;
  impedance?: string;
  batteryLife?: string;
  lastCheck?: string;
  lastRemoteUpload?: string;
  mriCompatible: boolean;
  medtronicRep?: string;
  medtronicRepPhone?: string;
  managingPhysician?: string;
  managingPhysicianPhone?: string;
  notes?: string;
  createdAt: number;
  updatedAt: number;
}

export interface HealthEmergency {
  id: string;
  fullName: string;
  dateOfBirth: string;
  bloodType?: string;
  allergies: string;
  emergencyContact1Name: string;
  emergencyContact1Relationship: string;
  emergencyContact1Phone: string;
  emergencyContact2Name?: string;
  emergencyContact2Relationship?: string;
  emergencyContact2Phone?: string;
  primaryCarePhysician: string;
  primaryCarePhone: string;
  insurancePrimary?: string;
  insurancePrimaryId?: string;
  insuranceSecondary?: string;
  insuranceSecondaryId?: string;
  advanceDirective?: boolean;
  advanceDirectiveLocation?: string;
  dnrStatus?: string;
  specialInstructions?: string;
  createdAt: number;
  updatedAt: number;
}

// ===== VSO (Veterans Service Officer) CLAIMS TYPES =====

export type VSOClaimType = 'direct' | 'secondary' | 'presumptive' | 'aggravation' | 'increase';
export type VSOClaimTrack = 'cervical-spine' | 'secondary-conditions' | 'tera-toxic-exposure' | 'mental-health' | 'rating-increase';
export type VSOClaimStatus = 'planning' | 'intent-filed' | 'filed' | 'pending-development' | 'c-and-p-scheduled' | 'c-and-p-completed' | 'rating-decision' | 'appealing' | 'granted' | 'denied';

export interface VSOClaim {
  id: string;
  claimName: string;
  conditionClaimed: string;
  icd10: string;
  diagnosticCode: string;
  claimType: VSOClaimType;
  claimTrack: VSOClaimTrack;
  status: VSOClaimStatus;
  theoryOfConnection: string;
  alternativeTheory?: string;
  inServiceEvent: string;
  estimatedRating?: string;
  currentRating?: string;
  effectiveDate?: string;
  intentToFileDate?: string;
  filingDate?: string;
  filingDeadline?: string;
  ratingDecisionDate?: string;
  linkedConditionIds?: string;
  assignedVSO?: string;
  notes?: string;
  createdAt: number;
  updatedAt: number;
}

export type VSOEvidenceType = 'medical-record' | 'imaging' | 'lab-result' | 'pft' | 'personal-statement' | 'buddy-statement' | 'nexus-opinion' | 'military-record' | 'va-record' | 'research-literature' | 'va-form' | 'other';
export type VSOEvidenceStatus = 'obtained' | 'pending-request' | 'needed' | 'in-progress' | 'submitted-to-va';
export type VSOEvidencePriority = 'critical' | 'high' | 'moderate' | 'low';

export interface VSOEvidence {
  id: string;
  evidenceName: string;
  evidenceType: VSOEvidenceType;
  status: VSOEvidenceStatus;
  priority: VSOEvidencePriority;
  linkedClaimNames: string;
  source: string;
  dateOfEvidence?: string;
  dateObtained?: string;
  dateSubmitted?: string;
  description: string;
  relevanceNotes?: string;
  location?: string;
  gapNotes?: string;
  notes?: string;
  createdAt: number;
  updatedAt: number;
}

export type VSOActionPhase = 'phase-1-foundation' | 'phase-2-evidence' | 'phase-3-nexus' | 'phase-4-filing' | 'ongoing';
export type VSOActionPriority = 'critical' | 'high' | 'moderate' | 'low';
export type VSOActionStatus = 'not-started' | 'in-progress' | 'blocked' | 'completed';

export interface VSOAction {
  id: string;
  actionItem: string;
  phase: VSOActionPhase;
  priority: VSOActionPriority;
  status: VSOActionStatus;
  dueDate?: string;
  completedDate?: string;
  linkedClaimNames?: string;
  linkedEvidenceNames?: string;
  dependsOn?: string;
  assignedTo?: string;
  notes?: string;
  createdAt: number;
  updatedAt: number;
}

export type VSOExposureType = 'rf-radiation' | 'chemical' | 'fuel' | 'paint' | 'solvent' | 'particulate' | 'noise' | 'nuclear' | 'other';

export interface VSOExposure {
  id: string;
  exposureType: VSOExposureType;
  substance: string;
  weaponSystem: string;
  mosAtTimeOfExposure?: string;
  description: string;
  frequency: string;
  duration: string;
  ppeProvided: string;
  healthEffectPathway?: string;
  linkedClaimNames: string;
  witnessAvailable?: boolean;
  notes?: string;
  createdAt: number;
  updatedAt: number;
}

export type VSOCurrentlyMet = 'met' | 'partially-met' | 'not-met' | 'unknown-need-testing';

export interface VSORating {
  id: string;
  diagnosticCode: string;
  conditionName: string;
  ratingPercent: number;
  criteria: string;
  currentlyMet: VSOCurrentlyMet;
  veteranEvidence?: string;
  notes?: string;
  createdAt: number;
  updatedAt: number;
}

export interface VSOData {
  claims: VSOClaim[];
  evidence: VSOEvidence[];
  actions: VSOAction[];
  exposures: VSOExposure[];
  ratings: VSORating[];
}

export interface HealthData {
  providers: HealthProvider[];
  conditions: HealthCondition[];
  impairments: HealthImpairment[];
  journal: HealthJournalEntry[];
  medications: HealthMedication[];
  devices: HealthDevice[];
  emergency: HealthEmergency | null;
  vso?: VSOData;
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
