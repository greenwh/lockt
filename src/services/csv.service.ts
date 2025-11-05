// src/services/csv.service.ts
import type {
  PasswordEntry,
  CreditCardEntry,
  CryptoEntry,
  FreetextEntry,
  FreetextField,
  HealthProvider,
  HealthCondition,
  HealthImpairment,
  HealthJournalEntry,
} from '../types/data.types';

/**
 * CSV Import/Export Service
 * Handles CSV generation and parsing for all data types in Lockt
 */

// Utility: Escape CSV field (handle quotes, commas, newlines)
const escapeCsvField = (value: any): string => {
  if (value === null || value === undefined) return '';
  const str = String(value);
  // If field contains comma, quote, or newline, wrap in quotes and escape quotes
  if (str.includes(',') || str.includes('"') || str.includes('\n')) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
};

// Utility: Parse CSV line (handles quoted fields with commas)
const parseCsvLine = (line: string): string[] => {
  const fields: string[] = [];
  let currentField = '';
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    const nextChar = line[i + 1];

    if (char === '"') {
      if (inQuotes && nextChar === '"') {
        // Escaped quote
        currentField += '"';
        i++; // Skip next quote
      } else {
        // Toggle quote mode
        inQuotes = !inQuotes;
      }
    } else if (char === ',' && !inQuotes) {
      // End of field
      fields.push(currentField.trim());
      currentField = '';
    } else {
      currentField += char;
    }
  }

  // Add last field
  fields.push(currentField.trim());
  return fields;
};

// ===== PASSWORD ENTRIES =====

export const exportPasswordsToCsv = (entries: PasswordEntry[]): string => {
  const headers = [
    'Account',
    'Username',
    'Password',
    'PIN',
    'Account Number',
    'Routing Number',
    'Email',
    'Phone',
    'Fax',
    'Mailing Address',
    'URL',
    'Notes',
    'Tags',
    'Created At',
    'Updated At',
  ];

  const rows = entries.map((entry) => [
    escapeCsvField(entry.account),
    escapeCsvField(entry.username),
    escapeCsvField(entry.password),
    escapeCsvField(entry.pin),
    escapeCsvField(entry.accountNumber),
    escapeCsvField(entry.routingNumber),
    escapeCsvField(entry.email),
    escapeCsvField(entry.phone),
    escapeCsvField(entry.fax),
    escapeCsvField(entry.mailingAddress),
    escapeCsvField(entry.url),
    escapeCsvField(entry.notes),
    escapeCsvField(entry.tags?.join('; ')),
    escapeCsvField(new Date(entry.createdAt).toISOString()),
    escapeCsvField(new Date(entry.updatedAt).toISOString()),
  ]);

  return [headers.join(','), ...rows.map((row) => row.join(','))].join('\n');
};

export const importPasswordsFromCsv = (csvContent: string): PasswordEntry[] => {
  const lines = csvContent.split('\n').filter((line) => line.trim());
  if (lines.length < 2) throw new Error('CSV file is empty or has no data rows');

  // Skip header row (first line)
  const entries: PasswordEntry[] = [];

  for (let i = 1; i < lines.length; i++) {
    const fields = parseCsvLine(lines[i]);
    if (fields.length === 0 || fields.every((f) => !f)) continue; // Skip empty lines

    const entry: PasswordEntry = {
      id: crypto.randomUUID(),
      account: fields[0] || '',
      username: fields[1] || '',
      password: fields[2] || '',
      pin: fields[3] || '',
      accountNumber: fields[4] || undefined,
      routingNumber: fields[5] || undefined,
      email: fields[6] || undefined,
      phone: fields[7] || undefined,
      fax: fields[8] || undefined,
      mailingAddress: fields[9] || undefined,
      url: fields[10] || undefined,
      notes: fields[11] || undefined,
      tags: fields[12] ? fields[12].split(';').map((t) => t.trim()).filter(Boolean) : undefined,
      createdAt: fields[13] ? new Date(fields[13]).getTime() : Date.now(),
      updatedAt: fields[14] ? new Date(fields[14]).getTime() : Date.now(),
    };

    entries.push(entry);
  }

  return entries;
};

// ===== CREDIT CARD ENTRIES =====

export const exportCreditCardsToCsv = (entries: CreditCardEntry[]): string => {
  const headers = [
    'Account Name',
    'Card Number',
    'Expiration Date',
    'CSC Code',
    'Email',
    'Phone',
    'Fax',
    'Mailing Address',
    'URL',
    'Notes',
    'Tags',
    'Created At',
    'Updated At',
  ];

  const rows = entries.map((entry) => [
    escapeCsvField(entry.accountName),
    escapeCsvField(entry.cardNumber),
    escapeCsvField(entry.expirationDate),
    escapeCsvField(entry.cscCode),
    escapeCsvField(entry.email),
    escapeCsvField(entry.phone),
    escapeCsvField(entry.fax),
    escapeCsvField(entry.mailingAddress),
    escapeCsvField(entry.url),
    escapeCsvField(entry.notes),
    escapeCsvField(entry.tags?.join('; ')),
    escapeCsvField(new Date(entry.createdAt).toISOString()),
    escapeCsvField(new Date(entry.updatedAt).toISOString()),
  ]);

  return [headers.join(','), ...rows.map((row) => row.join(','))].join('\n');
};

export const importCreditCardsFromCsv = (csvContent: string): CreditCardEntry[] => {
  const lines = csvContent.split('\n').filter((line) => line.trim());
  if (lines.length < 2) throw new Error('CSV file is empty or has no data rows');

  // Skip header row (first line)
  const entries: CreditCardEntry[] = [];

  for (let i = 1; i < lines.length; i++) {
    const fields = parseCsvLine(lines[i]);
    if (fields.length === 0 || fields.every((f) => !f)) continue;

    const entry: CreditCardEntry = {
      id: crypto.randomUUID(),
      accountName: fields[0] || '',
      cardNumber: fields[1] || '',
      expirationDate: fields[2] || '',
      cscCode: fields[3] || '',
      email: fields[4] || undefined,
      phone: fields[5] || undefined,
      fax: fields[6] || undefined,
      mailingAddress: fields[7] || undefined,
      url: fields[8] || undefined,
      notes: fields[9] || undefined,
      tags: fields[10] ? fields[10].split(';').map((t) => t.trim()).filter(Boolean) : undefined,
      createdAt: fields[11] ? new Date(fields[11]).getTime() : Date.now(),
      updatedAt: fields[12] ? new Date(fields[12]).getTime() : Date.now(),
    };

    entries.push(entry);
  }

  return entries;
};

// ===== CRYPTO ENTRIES =====

export const exportCryptoToCsv = (entries: CryptoEntry[]): string => {
  const headers = [
    'Account',
    'Username',
    'Password',
    'PIN',
    'Account Number',
    'Routing Number',
    'Recovery Phrase',
    'Email',
    'Phone',
    'Fax',
    'ETH Address',
    'BTC Address',
    'SOL Address',
    'Other Address',
    'Notes',
    'Tags',
    'Created At',
    'Updated At',
  ];

  const rows = entries.map((entry) => [
    escapeCsvField(entry.account),
    escapeCsvField(entry.username),
    escapeCsvField(entry.password),
    escapeCsvField(entry.pin),
    escapeCsvField(entry.accountNumber),
    escapeCsvField(entry.routingNumber),
    escapeCsvField(entry.recoveryPhrase),
    escapeCsvField(entry.email),
    escapeCsvField(entry.phone),
    escapeCsvField(entry.fax),
    escapeCsvField(entry.walletAddressEth),
    escapeCsvField(entry.walletAddressBtc),
    escapeCsvField(entry.walletAddressSol),
    escapeCsvField(entry.walletAddressOther),
    escapeCsvField(entry.notes),
    escapeCsvField(entry.tags?.join('; ')),
    escapeCsvField(new Date(entry.createdAt).toISOString()),
    escapeCsvField(new Date(entry.updatedAt).toISOString()),
  ]);

  return [headers.join(','), ...rows.map((row) => row.join(','))].join('\n');
};

export const importCryptoFromCsv = (csvContent: string): CryptoEntry[] => {
  const lines = csvContent.split('\n').filter((line) => line.trim());
  if (lines.length < 2) throw new Error('CSV file is empty or has no data rows');

  // Skip header row (first line)
  const entries: CryptoEntry[] = [];

  for (let i = 1; i < lines.length; i++) {
    const fields = parseCsvLine(lines[i]);
    if (fields.length === 0 || fields.every((f) => !f)) continue;

    const entry: CryptoEntry = {
      id: crypto.randomUUID(),
      account: fields[0] || '',
      username: fields[1] || '',
      password: fields[2] || '',
      pin: fields[3] || '',
      accountNumber: fields[4] || undefined,
      routingNumber: fields[5] || undefined,
      recoveryPhrase: fields[6] || undefined,
      email: fields[7] || undefined,
      phone: fields[8] || undefined,
      fax: fields[9] || undefined,
      walletAddressEth: fields[10] || undefined,
      walletAddressBtc: fields[11] || undefined,
      walletAddressSol: fields[12] || undefined,
      walletAddressOther: fields[13] || undefined,
      notes: fields[14] || undefined,
      tags: fields[15] ? fields[15].split(';').map((t) => t.trim()).filter(Boolean) : undefined,
      createdAt: fields[16] ? new Date(fields[16]).getTime() : Date.now(),
      updatedAt: fields[17] ? new Date(fields[17]).getTime() : Date.now(),
    };

    entries.push(entry);
  }

  return entries;
};

// ===== FREETEXT ENTRIES =====

export const exportFreetextToCsv = (entries: FreetextEntry[]): string => {
  const headers = [
    'Title',
    'Description',
    'Category',
    'Content',
    'Fields (JSON)',
    'Attached To',
    'Email',
    'Phone',
    'URL',
    'Notes',
    'Tags',
    'Created At',
    'Updated At',
  ];

  const rows = entries.map((entry) => [
    escapeCsvField(entry.title),
    escapeCsvField(entry.description),
    escapeCsvField(entry.category),
    escapeCsvField(entry.content),
    escapeCsvField(entry.fields ? JSON.stringify(entry.fields) : ''),
    escapeCsvField(entry.attachedTo),
    escapeCsvField(entry.email),
    escapeCsvField(entry.phone),
    escapeCsvField(entry.url),
    escapeCsvField(entry.notes),
    escapeCsvField(entry.tags?.join('; ')),
    escapeCsvField(new Date(entry.createdAt).toISOString()),
    escapeCsvField(new Date(entry.updatedAt).toISOString()),
  ]);

  return [headers.join(','), ...rows.map((row) => row.join(','))].join('\n');
};

export const importFreetextFromCsv = (csvContent: string): FreetextEntry[] => {
  const lines = csvContent.split('\n').filter((line) => line.trim());
  if (lines.length < 2) throw new Error('CSV file is empty or has no data rows');

  // Skip header row (first line)
  const entries: FreetextEntry[] = [];

  for (let i = 1; i < lines.length; i++) {
    const fields = parseCsvLine(lines[i]);
    if (fields.length === 0 || fields.every((f) => !f)) continue;

    let parsedFields: FreetextField[] | undefined;
    try {
      parsedFields = fields[4] ? JSON.parse(fields[4]) : undefined;
    } catch {
      parsedFields = undefined;
    }

    const entry: FreetextEntry = {
      id: crypto.randomUUID(),
      title: fields[0] || '',
      description: fields[1] || '',
      category: fields[2] || undefined,
      content: fields[3] || '',
      fields: parsedFields,
      attachedTo: fields[5] || undefined,
      email: fields[6] || undefined,
      phone: fields[7] || undefined,
      url: fields[8] || undefined,
      notes: fields[9] || undefined,
      tags: fields[10] ? fields[10].split(';').map((t) => t.trim()).filter(Boolean) : undefined,
      createdAt: fields[11] ? new Date(fields[11]).getTime() : Date.now(),
      updatedAt: fields[12] ? new Date(fields[12]).getTime() : Date.now(),
    };

    entries.push(entry);
  }

  return entries;
};

// ===== HEALTH PROVIDERS =====

export const exportHealthProvidersToCsv = (entries: HealthProvider[]): string => {
  const headers = ['Dr Name', 'Specialty', 'Email', 'Phone', 'Fax', 'Account', 'Created At', 'Updated At'];

  const rows = entries.map((entry) => [
    escapeCsvField(entry.drName),
    escapeCsvField(entry.specialty),
    escapeCsvField(entry.email),
    escapeCsvField(entry.phone),
    escapeCsvField(entry.fax),
    escapeCsvField(entry.account),
    escapeCsvField(new Date(entry.createdAt).toISOString()),
    escapeCsvField(new Date(entry.updatedAt).toISOString()),
  ]);

  return [headers.join(','), ...rows.map((row) => row.join(','))].join('\n');
};

export const importHealthProvidersFromCsv = (csvContent: string): HealthProvider[] => {
  const lines = csvContent.split('\n').filter((line) => line.trim());
  if (lines.length < 2) throw new Error('CSV file is empty or has no data rows');

  // Skip header row (first line)
  const entries: HealthProvider[] = [];

  for (let i = 1; i < lines.length; i++) {
    const fields = parseCsvLine(lines[i]);
    if (fields.length === 0 || fields.every((f) => !f)) continue;

    const entry: HealthProvider = {
      id: crypto.randomUUID(),
      drName: fields[0] || '',
      specialty: fields[1] || '',
      email: fields[2] || undefined,
      phone: fields[3] || undefined,
      fax: fields[4] || undefined,
      account: fields[5] || undefined,
      createdAt: fields[6] ? new Date(fields[6]).getTime() : Date.now(),
      updatedAt: fields[7] ? new Date(fields[7]).getTime() : Date.now(),
    };

    entries.push(entry);
  }

  return entries;
};

// ===== HEALTH CONDITIONS =====

export const exportHealthConditionsToCsv = (entries: HealthCondition[]): string => {
  const headers = ['Condition', 'Date of Diagnosis', 'Diagnosing Doctor/Agency', 'Symptomology', 'Created At', 'Updated At'];

  const rows = entries.map((entry) => [
    escapeCsvField(entry.condition),
    escapeCsvField(entry.dateOfDiagnosis ? new Date(entry.dateOfDiagnosis).toISOString() : ''),
    escapeCsvField(entry.diagnosingDoctorOrAgency),
    escapeCsvField(entry.symptomology),
    escapeCsvField(new Date(entry.createdAt).toISOString()),
    escapeCsvField(new Date(entry.updatedAt).toISOString()),
  ]);

  return [headers.join(','), ...rows.map((row) => row.join(','))].join('\n');
};

export const importHealthConditionsFromCsv = (csvContent: string): HealthCondition[] => {
  const lines = csvContent.split('\n').filter((line) => line.trim());
  if (lines.length < 2) throw new Error('CSV file is empty or has no data rows');

  // Skip header row (first line)
  const entries: HealthCondition[] = [];

  for (let i = 1; i < lines.length; i++) {
    const fields = parseCsvLine(lines[i]);
    if (fields.length === 0 || fields.every((f) => !f)) continue;

    const entry: HealthCondition = {
      id: crypto.randomUUID(),
      condition: fields[0] || '',
      dateOfDiagnosis: fields[1] ? new Date(fields[1]).getTime() : undefined,
      diagnosingDoctorOrAgency: fields[2] || undefined,
      symptomology: fields[3] || undefined,
      createdAt: fields[4] ? new Date(fields[4]).getTime() : Date.now(),
      updatedAt: fields[5] ? new Date(fields[5]).getTime() : Date.now(),
    };

    entries.push(entry);
  }

  return entries;
};

// ===== HEALTH IMPAIRMENTS =====

export const exportHealthImpairmentsToCsv = (entries: HealthImpairment[]): string => {
  const headers = ['Description', 'Date of Onset', 'Contributing Condition IDs', 'Elaboration', 'Created At', 'Updated At'];

  const rows = entries.map((entry) => [
    escapeCsvField(entry.description),
    escapeCsvField(entry.dateOfOnset ? new Date(entry.dateOfOnset).toISOString() : ''),
    escapeCsvField(entry.contributingConditionIds?.join('; ')),
    escapeCsvField(entry.elaboration),
    escapeCsvField(new Date(entry.createdAt).toISOString()),
    escapeCsvField(new Date(entry.updatedAt).toISOString()),
  ]);

  return [headers.join(','), ...rows.map((row) => row.join(','))].join('\n');
};

export const importHealthImpairmentsFromCsv = (csvContent: string): HealthImpairment[] => {
  const lines = csvContent.split('\n').filter((line) => line.trim());
  if (lines.length < 2) throw new Error('CSV file is empty or has no data rows');

  // Skip header row (first line)
  const entries: HealthImpairment[] = [];

  for (let i = 1; i < lines.length; i++) {
    const fields = parseCsvLine(lines[i]);
    if (fields.length === 0 || fields.every((f) => !f)) continue;

    const entry: HealthImpairment = {
      id: crypto.randomUUID(),
      description: fields[0] || '',
      dateOfOnset: fields[1] ? new Date(fields[1]).getTime() : undefined,
      contributingConditionIds: fields[2] ? fields[2].split(';').map((id) => id.trim()).filter(Boolean) : undefined,
      elaboration: fields[3] || undefined,
      createdAt: fields[4] ? new Date(fields[4]).getTime() : Date.now(),
      updatedAt: fields[5] ? new Date(fields[5]).getTime() : Date.now(),
    };

    entries.push(entry);
  }

  return entries;
};

// ===== HEALTH JOURNAL =====

export const exportHealthJournalToCsv = (entries: HealthJournalEntry[]): string => {
  const headers = ['Date', 'Reason for Entry', 'Pain Level', 'Entry', 'Created At', 'Updated At'];

  const rows = entries.map((entry) => [
    escapeCsvField(new Date(entry.date).toISOString()),
    escapeCsvField(entry.reasonForEntry),
    escapeCsvField(entry.painLevel),
    escapeCsvField(entry.entry),
    escapeCsvField(new Date(entry.createdAt).toISOString()),
    escapeCsvField(new Date(entry.updatedAt).toISOString()),
  ]);

  return [headers.join(','), ...rows.map((row) => row.join(','))].join('\n');
};

export const importHealthJournalFromCsv = (csvContent: string): HealthJournalEntry[] => {
  const lines = csvContent.split('\n').filter((line) => line.trim());
  if (lines.length < 2) throw new Error('CSV file is empty or has no data rows');

  // Skip header row (first line)
  const entries: HealthJournalEntry[] = [];

  for (let i = 1; i < lines.length; i++) {
    const fields = parseCsvLine(lines[i]);
    if (fields.length === 0 || fields.every((f) => !f)) continue;

    const entry: HealthJournalEntry = {
      id: crypto.randomUUID(),
      date: fields[0] ? new Date(fields[0]).getTime() : Date.now(),
      reasonForEntry: fields[1] || '',
      painLevel: fields[2] ? parseInt(fields[2], 10) : 0,
      entry: fields[3] || '',
      createdAt: fields[4] ? new Date(fields[4]).getTime() : Date.now(),
      updatedAt: fields[5] ? new Date(fields[5]).getTime() : Date.now(),
    };

    entries.push(entry);
  }

  return entries;
};

// ===== UTILITY FUNCTIONS =====

/**
 * Download CSV file to user's device
 */
export const downloadCsv = (csvContent: string, filename: string): void => {
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);

  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

/**
 * Read CSV file from user's device
 */
export const readCsvFile = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const content = e.target?.result as string;
      resolve(content);
    };
    reader.onerror = () => reject(new Error('Failed to read file'));
    reader.readAsText(file);
  });
};

export const csvService = {
  // Export functions
  exportPasswordsToCsv,
  exportCreditCardsToCsv,
  exportCryptoToCsv,
  exportFreetextToCsv,
  exportHealthProvidersToCsv,
  exportHealthConditionsToCsv,
  exportHealthImpairmentsToCsv,
  exportHealthJournalToCsv,

  // Import functions
  importPasswordsFromCsv,
  importCreditCardsFromCsv,
  importCryptoFromCsv,
  importFreetextFromCsv,
  importHealthProvidersFromCsv,
  importHealthConditionsFromCsv,
  importHealthImpairmentsFromCsv,
  importHealthJournalFromCsv,

  // Utility functions
  downloadCsv,
  readCsvFile,
};
