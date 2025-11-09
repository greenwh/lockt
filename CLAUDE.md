# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Overview

**Lockt** is a security-focused Progressive Web App (PWA) for storing and accessing sensitive personal data using client-side encryption with OneDrive as the storage backend. All encryption/decryption happens client-side—OneDrive stores only encrypted data (zero-knowledge security). The app is mobile-first (optimized for iPhone Safari) but fully functional on desktop browsers.

**Current Status**:
- ✅ **Phase 1-2**: Complete (encryption, data entry, UI)
- ✅ **Phase 3**: Complete (OneDrive sync with MSAL, multi-device sync working)
- 🟢 **Phase 3a**: Partially Complete (Oct 2025 bug fixes - see below)
- ✅ **Phase 4**: Complete (Biometric authentication with WebAuthn)
- 📅 **Phase 5+**: Export, advanced features, polish

**Recent Updates (November 2025)**:
**Phase 4 - Biometric Authentication (Complete):**
- ✅ WebAuthn integration (Face ID, Touch ID, Windows Hello, fingerprint)
- ✅ Platform authenticator support with user verification
- ✅ Credential-based password encryption (credential ID as key derivation)
- ✅ Multi-device credential management (enroll multiple devices)
- ✅ Biometric unlock button on login screen
- ✅ Settings UI for credential enrollment and management
- ✅ Password re-encryption on password change
- ✅ Fallback to password/recovery phrase authentication

**Previous Updates (October 25, 2025)**:
Critical bug fixes and security features completing most of Phase 3a:
- ✅ Recovery phrase generation (full BIP39 wordlist - 2048 words)
- ✅ Recovery phrase login support (UI toggle on login screen)
- ✅ Conflict resolution fixed (no more page reload → setup screen)
- ✅ UI auto-refresh after sync (reloadFromDatabase pattern)
- ✅ Seamless state updates (AuthContext.reloadFromDatabase method)
- ✅ Password change feature (Settings tab with recovery phrase verification)

See `PHASE_ROADMAP.md` for complete phase status and timeline.

## Commands

### Development
```bash
# Install dependencies
npm install

# Start development server (runs on http://localhost:5173)
npm run dev

# Build for production
npm run build

# Lint code
npm run lint

# Preview production build
npm run preview
```

### Azure Configuration
The app requires Azure App Registration for OneDrive integration:
- Client ID is configured in `src/config/auth.config.ts`
- Redirect URI must match deployment URL (currently `http://localhost:5173/`)
- Required scopes: `Files.ReadWrite.AppFolder`

## Architecture

### Core Design Patterns

**Zero-Knowledge Encryption Model**
- All data encrypted client-side using Web Crypto API (AES-GCM with PBKDF2 key derivation)
- Master password never stored—derived key used for encryption/decryption
- OneDrive stores only encrypted blobs; no plaintext ever leaves device
- 600,000 PBKDF2 iterations (OWASP 2024 recommendation)

**Single Encrypted Blob Storage**
- All app data (passwords, credit cards, crypto wallets, freetext, health) stored as one encrypted JSON blob
- IndexedDB stores encrypted blob locally
- OneDrive syncs the same encrypted blob across devices
- Blob format: `{ iv, salt, ciphertext, version }`

**State Management Pattern**
- In-memory state only—no persistent decrypted data
- App state exists only while unlocked
- Lock/logout immediately clears all decrypted data from memory
- Components work with in-memory state, sync operations work with encrypted blobs

**Service Layer Architecture**
```
Components (UI)
    ↓
Context (AuthContext, SyncContext)
    ↓
Services (crypto.service, database.service, onedrive.service, sync.service, webauthn.service)
    ↓
Storage (IndexedDB local, OneDrive cloud, Platform Authenticator)
```

### Data Flow

**Initial Setup Flow:**
1. User creates master password + recovery phrase
2. `crypto.service` generates salt and derives encryption key
3. Initial empty data structure encrypted and stored in IndexedDB
4. Salt stored in IndexedDB config for future key derivation

**Unlock Flow:**
1. User enters master password
2. Salt retrieved from IndexedDB
3. Key derived using PBKDF2 (password + salt)
4. Encrypted blob retrieved and decrypted
5. Decrypted data loaded into memory as app state

**Sync Flow:**
1. Compare local timestamp with OneDrive file metadata
2. If remote newer → download and decrypt remote data
3. If local newer → encrypt and upload local data
4. If conflict → present resolution UI to user
5. Update IndexedDB and OneDrive timestamps

**Lock Flow:**
1. Clear all in-memory decrypted data
2. IndexedDB still contains encrypted blob
3. User must unlock again to access data

### Key Files & Responsibilities

**Services (Business Logic)**
- `src/services/crypto.service.ts` - All encryption/decryption operations, key derivation, recovery phrase generation
- `src/services/database.service.ts` - IndexedDB operations for local encrypted storage (including biometric credentials)
- `src/services/onedrive.service.ts` - Microsoft Graph API integration for cloud sync
- `src/services/sync.service.ts` - Orchestrates sync logic between local and cloud
- `src/services/webauthn.service.ts` - WebAuthn/biometric authentication, credential management

**Configuration**
- `src/config/auth.config.ts` - MSAL configuration (client ID, scopes, redirect URI)
  - **IMPORTANT**: Contains actual Azure client ID—do not commit changes with test credentials

**Data Models**
- `src/types/data.types.ts` - Complete TypeScript definitions for all data structures
  - `AppData` - Top-level structure containing all user data
  - `EncryptedData` - Encrypted blob format (iv, salt, ciphertext, version)
  - Entry types: `PasswordEntry`, `CreditCardEntry`, `CryptoEntry`, `FreetextEntry`
  - Health data: `HealthProvider`, `HealthCondition`, `HealthImpairment`, `HealthJournalEntry`

**Context**
- `src/context/AuthContext.tsx` - Authentication state (password/biometric), unlock/lock, data mutations, and `reloadFromDatabase()` method
- `src/context/SyncContext.tsx` - Global state for sync status, account info, and sync operations

**Components**
- `src/components/layout/` - App shell, tab navigation, header
- `src/components/auth/` - Login and setup screens (with biometric unlock)
- `src/components/settings/` - Settings screens (password change, biometric management)
- `src/components/[category]/` - Category-specific list/detail/form components
- `src/components/sync/` - Sync UI components

### IndexedDB Schema

**Database**: `lockt-db` (version 2)

**Object Stores:**
1. `encrypted-data` - Single record with key `'main'` containing the encrypted blob
2. `app-config` - Key-value store for salt, deviceId, lastSyncTime, encryptedPassword, etc.
3. `biometric-credentials` - WebAuthn credentials (credential ID as key), added in v2

**Critical Pattern**: Always call `await databaseService.init()` before any database operations to ensure stores exist.

**Common Pitfall**: "Object store was not found" errors occur if:
- Database not initialized before first use
- Object store names don't match schema exactly (use `'encrypted-data'` and `'app-config'`)
- Browser has cached old database version (solution: increment `DB_VERSION` or clear IndexedDB in DevTools)

See `indexeddb-fix.md` for detailed debugging steps.

## Data Categories

The app stores five main data categories:

1. **Passwords** - Bank accounts, logins (username, password, pin, account/routing numbers, contact info)
2. **Credit Cards** - Card details (number, expiration, CSC, contact info)
3. **Crypto** - Cryptocurrency accounts (wallet addresses for ETH/BTC/SOL, recovery phrases)
4. **Freetext** - Flexible storage for SSNs, insurance policies, passports, etc. (with structured fields)
5. **Health** - Medical information split into 4 sub-tabs:
   - Providers (doctors, specialists)
   - Conditions (diagnoses)
   - Impairments (functional limitations)
   - Journal (daily health entries with pain levels)

## Important Technical Decisions

| Decision | Rationale |
|----------|-----------|
| **Single encrypted blob** | Simplifies sync logic—one file to compare/upload/download |
| **In-memory only decrypted data** | Security—no plaintext persisted anywhere |
| **Web Crypto API** | Hardware-accelerated, browser-native, audited crypto primitives |
| **MSAL.js for auth** | Official Microsoft library for OAuth2/OIDC with OneDrive |
| **styled-components** | Component-scoped styling matching PayTrax aesthetic |
| **React Context for state** | Simple global state without external dependencies |
| **IndexedDB via `idb`** | Type-safe wrapper, async/await API, browser storage |
| **OneDrive approot** | App-specific folder, no access to user's personal files |

## Common Development Tasks

### Working with Encrypted Data

**Always follow this pattern:**
```typescript
// 1. Get encrypted blob from IndexedDB
const encryptedData = await databaseService.getEncryptedData();

// 2. Decrypt to get AppData
const decryptedJson = await cryptoService.decrypt(encryptedData, password);
const appData: AppData = JSON.parse(decryptedJson);

// 3. Modify data
appData.passwords.push(newPassword);
appData.metadata.lastModified = Date.now();

// 4. Re-encrypt
const newEncryptedData = await cryptoService.encrypt(
  JSON.stringify(appData),
  password,
  saltFromConfig
);

// 5. Save back to IndexedDB
await databaseService.saveEncryptedData(newEncryptedData);
```

### Refreshing UI After Sync Operations

**Pattern: `reloadFromDatabase()` for Seamless State Updates**

After sync operations that modify IndexedDB (downloads, conflict resolution), the UI must be refreshed without requiring a full page reload. The `AuthContext.reloadFromDatabase()` method handles this:

```typescript
// In SyncContext after downloading data from OneDrive
if (result.action === 'download') {
  try {
    await reloadFromDatabase(); // Decrypts latest IndexedDB data into memory
    console.log('UI refreshed after download');
  } catch (err) {
    console.error('Failed to reload data:', err);
    toast.warning('Data synced but UI refresh failed. Please restart the app.');
  }
}
```

**Key Benefits:**
- No page reload required (avoids losing unlocked state)
- Uses stored password from AuthContext to decrypt updated data
- Updates in-memory state immediately
- Prevents "setup screen" bug after conflict resolution

**When to Use:**
- After downloading data from OneDrive (sync, force download)
- After conflict resolution with "download-remote" action
- Any time IndexedDB is updated externally (not through AuthContext update methods)

**Files Involved:**
- `src/context/AuthContext.tsx:164-190` - `reloadFromDatabase()` implementation
- `src/context/SyncContext.tsx` - Integration into sync workflows

### Changing Password

**Pattern: Password Change with Recovery Phrase Verification**

The password change feature allows users to update their master password while maintaining the same recovery phrase. This is critical for security if a password is compromised.

**Technical Flow:**
```typescript
// In AuthContext.changePassword()
const changePassword = async (
  currentPassword: string | null,
  newPassword: string,
  recoveryPhrase: string
) => {
  // 1. Determine actual current password
  let actualCurrentPassword: string;
  if (unlockedViaRecovery) {
    // User unlocked with recovery phrase - use stored password
    actualCurrentPassword = password; // from AuthContext state
  } else {
    // User unlocked normally - verify provided current password
    actualCurrentPassword = currentPassword;
    await cryptoService.decrypt(encryptedData, currentPassword); // Throws if wrong
  }

  // 2. Verify recovery phrase is correct
  const storedEncryptedPassword = await databaseService.getConfig('encryptedPassword');
  const decryptedPassword = await cryptoService.decryptPasswordWithRecoveryPhrase(
    storedEncryptedPassword,
    recoveryPhrase
  );
  if (decryptedPassword !== actualCurrentPassword) {
    throw new Error('Recovery phrase is incorrect');
  }

  // 3. Re-encrypt all data with new password (and new salt for forward secrecy)
  const newSalt = crypto.getRandomValues(new Uint8Array(16));
  const newEncryptedData = await cryptoService.encrypt(
    JSON.stringify(appData),
    newPassword,
    newSalt
  );

  // 4. Encrypt new password with same recovery phrase
  const newEncryptedPassword = await cryptoService.encryptPasswordWithRecoveryPhrase(
    newPassword,
    recoveryPhrase
  );

  // 5. Save everything to IndexedDB
  await databaseService.saveEncryptedData(newEncryptedData);
  await databaseService.setConfig('salt', newEncryptedData.salt);
  await databaseService.setConfig('encryptedPassword', newEncryptedPassword);

  // 6. Update in-memory password (stay unlocked)
  setPassword(newPassword);
};
```

**Key Design Decisions:**

1. **Same Recovery Phrase**: Recovery phrase remains unchanged when password changes
   - Simpler UX (only one recovery phrase to remember)
   - Recovery phrase can still decrypt new password
   - New password is encrypted with same recovery phrase

2. **Conditional Current Password**: Skip verification if unlocked via recovery
   - If user unlocked with recovery phrase, they don't know their current password
   - Use stored password from AuthContext state instead
   - UI hides current password field in this case

3. **Recovery Phrase Verification Required**:
   - Ensures user still has access to recovery phrase
   - Prevents unauthorized password changes
   - Verified by decrypting stored encrypted password

4. **Forward Secrecy**: New salt generated when changing password
   - Extra security layer
   - Old encrypted data cannot be correlated with new

5. **Stay Unlocked**: App remains unlocked after password change
   - In-memory password updated
   - No need for user to re-authenticate

**UI Components:**
- `src/components/settings/ChangePasswordForm.tsx` - Main password change form
- `src/components/settings/SettingsScreen.tsx` - Settings container
- `src/App.tsx:119-136` - Settings tab routing

**Files Involved:**
- `src/context/AuthContext.tsx:24,48,162,291-372` - unlockedViaRecovery state, changePassword() method
- `src/services/crypto.service.ts` - Password escrow encryption/decryption methods
- `src/components/settings/` - UI components

### Biometric Authentication (Phase 4)

**Pattern: WebAuthn-Based Biometric Authentication**

Lockt supports biometric authentication (Face ID, Touch ID, Windows Hello, fingerprint) using the WebAuthn API. This provides a convenient and secure way to unlock the app without entering the master password.

**Architecture:**

The biometric authentication system uses a credential-based password encryption model:

1. **Enrollment:** User's master password is encrypted using a key derived from the WebAuthn credential ID
2. **Authentication:** WebAuthn verifies the user's biometric, returns the credential ID, which is used to decrypt the password
3. **Unlock:** Decrypted password is used with the existing unlock flow

**Technical Flow:**

```typescript
// ENROLLMENT (Settings → Enable Biometric)
async enableBiometric(deviceName: string) {
  // 1. User must be unlocked (have password in memory)
  if (isLocked || !password) throw new Error('Must be unlocked first');

  // 2. Register WebAuthn credential with platform authenticator
  const credential = await webAuthnService.registerCredential(
    deviceId,
    deviceName,
    password // Current master password
  );

  // Behind the scenes:
  // - Generate WebAuthn credential with user verification required
  // - Derive encryption key from credential ID using PBKDF2
  // - Encrypt password with derived key
  // - Store encrypted password + credential metadata in IndexedDB

  // 3. Save to database
  await databaseService.saveBiometricCredential(credential);
}

// AUTHENTICATION (Login Screen → Use Face ID)
async unlockWithBiometric() {
  // 1. Get stored credentials from IndexedDB
  const credentials = await databaseService.getBiometricCredentials();

  // 2. Trigger WebAuthn authentication (biometric prompt)
  const { credentialId } = await webAuthnService.authenticate(
    credentials.map(c => c.id)
  );

  // 3. Find matching credential and decrypt password
  const credential = credentials.find(c => c.id === credentialId);
  const password = await webAuthnService.decryptPasswordWithCredential(
    credential.encryptedPassword,
    credentialId
  );

  // 4. Use existing unlock flow
  await unlock(password);
}
```

**Key Security Properties:**

1. **Credential-Based Encryption**: Password encrypted with key derived from credential ID
   - Credential ID is only returned after successful biometric verification
   - No way to decrypt password without passing biometric check

2. **Platform Authenticator**: Requires device-native biometrics
   - `authenticatorAttachment: 'platform'`
   - `userVerification: 'required'`
   - Uses device's secure enclave (iOS) or TPM (Windows)

3. **Multi-Device Support**: Each device gets its own credential
   - Credentials are device-specific
   - User can enroll multiple devices
   - Removing a credential doesn't affect other devices

4. **Password Change Compatibility**: Re-encrypts credentials when password changes
   - Same credential ID used (no re-registration needed)
   - New password encrypted with same credential-derived key
   - Maintains biometric access after password change

5. **Fallback Authentication**: Password and recovery phrase remain available
   - Biometric is convenience feature, not replacement
   - User can always use password/recovery phrase
   - Critical if device biometric sensor fails

**Database Schema:**

```typescript
// IndexedDB object store: 'biometric-credentials'
interface BiometricCredential {
  id: string;                    // Base64-encoded credential ID
  publicKey: string;             // Base64-encoded public key
  encryptedPassword: EncryptedData; // Password encrypted with credential-derived key
  deviceName: string;            // User-friendly label
  authenticatorType: 'platform'; // Platform authenticator
  createdAt: number;             // Timestamp
  lastUsedAt: number;            // Last authentication timestamp
}
```

**UI Components:**

- **Login Screen** (`src/components/auth/LoginScreen.tsx`):
  - Shows biometric unlock button if credentials enrolled
  - Prominent "Use Face ID / Windows Hello" button
  - Fallback to password/recovery phrase options

- **Biometric Settings** (`src/components/settings/BiometricSettings.tsx`):
  - Enrollment form (requires user to be unlocked)
  - List of enrolled devices with metadata
  - Remove credential functionality
  - Platform availability detection

**Files Involved:**

- `src/services/webauthn.service.ts` - WebAuthn credential management, encryption/decryption
- `src/context/AuthContext.tsx:26-27,31,38-41,59-60,63-76,319-428` - Biometric state and methods
- `src/services/database.service.ts:6,18-21,27,45-46,219-283` - Credential storage (DB v2)
- `src/components/auth/LoginScreen.tsx:10,55-66,73-92` - Biometric unlock button
- `src/components/settings/BiometricSettings.tsx` - Credential management UI
- `src/components/settings/SettingsScreen.tsx:6,16-19` - Settings integration

**Common Patterns:**

1. **Check Availability:**
```typescript
const isAvailable = await webAuthnService.isPlatformAuthenticatorAvailable();
const hasCredentials = await databaseService.hasBiometricCredentials();
```

2. **Enroll New Device:**
```typescript
// User must be unlocked first
await enableBiometric('My iPhone');
```

3. **Authenticate:**
```typescript
await unlockWithBiometric(); // Triggers biometric prompt
```

4. **Manage Credentials:**
```typescript
const credentials = await getBiometricCredentials();
await disableBiometric(credentialId);
```

**Platform Support:**

- **iOS/iPadOS**: Face ID, Touch ID (Safari, PWA)
- **macOS**: Touch ID (Safari, Chrome)
- **Windows**: Windows Hello (PIN, face, fingerprint) (Edge, Chrome)
- **Android**: Fingerprint, face unlock (Chrome, Edge)

**Error Handling:**

- `NotAllowedError`: User cancelled biometric prompt
- `NotSupportedError`: Platform authenticator not available
- `InvalidStateError`: Credential already exists (during enrollment)

**Testing:**

1. Enroll biometric on a device with platform authenticator
2. Lock the app and verify biometric unlock works
3. Change password and verify biometric still works
4. Enroll second device and verify both work independently
5. Remove credential and verify it's no longer usable
6. Test fallback to password when biometric unavailable

### Testing OneDrive Sync

**Common issues:**
- **401 Unauthorized** - Token expired, trigger re-authentication via `acquireTokenPopup`
- **404 Not Found** - File doesn't exist yet on OneDrive (normal for first upload)
- **Object store not found** - Call `await databaseService.init()` before operations

**Testing checklist:**
1. Test first-time upload (no remote file)
2. Test download (remote file exists, no local data)
3. Test conflict resolution (both modified)
4. Test offline behavior (should gracefully fail, allow local-only work)

### Debugging Encryption Issues

**Symptoms of wrong key/password:**
- "Failed to decrypt data - incorrect password or corrupted data"
- DOMException in `crypto.subtle.decrypt()`

**Debugging steps:**
1. Verify salt is retrieved correctly from IndexedDB config
2. Check password is exact match (no extra whitespace)
3. Confirm encrypted data structure has all fields (iv, salt, ciphertext, version)
4. Try with recovery phrase if password forgotten

### Adding New Data Types

**Pattern to follow (see existing categories):**
1. Define interface in `src/types/data.types.ts`
2. Add to `AppData` interface
3. Create components in `src/components/[new-category]/`
   - `[Name]List.tsx` - Main list view with search
   - `[Name]QuickView.tsx` - Collapsed item in list
   - `[Name]Detail.tsx` - Expanded/detail view
   - `[Name]Form.tsx` - Create/edit form
4. Add tab to `TabNavigation` in `src/components/layout/TabNavigation.tsx`
5. Add route in `App.tsx`

## Security Notes

**What is encrypted:**
- All user data (passwords, cards, crypto, freetext, health)
- Stored in IndexedDB as encrypted blob
- Stored in OneDrive as encrypted blob

**What is NOT encrypted:**
- Salt (needed for key derivation, stored in IndexedDB config)
- App metadata (version, deviceId, timestamps)
- MSAL tokens (handled by MSAL library in localStorage)

**Key Security Properties:**
- Zero-knowledge: OneDrive cannot decrypt data
- Master password never stored (only used to derive encryption key)
- Password escrow: Master password encrypted with recovery phrase for recovery
- Recovery phrase as backup authentication mechanism
- Password change capability: Users can change password if compromised
- Forward secrecy: New salt generated when changing password
- Auto-lock after inactivity (future feature)
- Memory cleared on lock/logout

## Troubleshooting

### "Object store was not found"
1. Open DevTools → Application → IndexedDB → Delete `lockt-db`
2. Increment `DB_VERSION` in `database.service.ts` to force upgrade
3. Add `await databaseService.init()` before sync operations
4. Verify object store names are exactly `'encrypted-data'` and `'app-config'`

### OneDrive sync fails
1. Check if signed in: `oneDriveService.isSignedIn()`
2. Check if online: `oneDriveService.isOnline()`
3. Verify Azure app registration has correct redirect URI
4. Check browser console for MSAL errors

### Decryption fails
1. Verify correct password
2. Check salt exists in IndexedDB config
3. Confirm encrypted data structure is valid
4. Try with recovery phrase if available

## Future Enhancements

### Phase 3a: Sync Reliability & Recovery (Next Priority)
- **Salt Recovery** - Store salt in localStorage + OneDrive for account recovery
- **Conflict Resolution** - Dialog UI for choosing between local/remote versions
- **Sync Settings** - UI to control auto-sync frequency, Wi-Fi only, etc.
- **Sync Status** - Toast notifications and last sync time display
- **Retry Logic** - Automatic retry with exponential backoff for failed syncs
- **Error Handling** - User-friendly error messages

### Phase 4: Biometric Authentication
- **WebAuthn Integration** - Face ID/Touch ID/Windows Hello/Fingerprint
- **Passkeys Support** - Synced biometric credentials across devices
- **Fallback** - Password option when biometrics unavailable

### Phase 5: Export & Advanced Features
- **Export Functionality** - JSON, CSV, TXT exports with security warnings
- **Import** - Restore from encrypted backup files
- **Inline Editing** - Click-to-edit fields in detail views

### Phase 6: Polish & Testing
- **Auto-lock** - Lock after configurable inactivity timeout
- **App Settings** - User-configurable preferences
- **Error Boundaries** - Graceful error handling
- **Performance** - Optimization and profiling

### Phase 7: Future Features
- **Bank Register** - Financial transaction tracking
- **Data Sharing** - Encrypted link sharing
- **File Attachments** - Encrypted file storage
- **Browser Extension** - Auto-fill support
- **Dark Mode** - Theme toggle

## Known Limitations & Fixes

### ✅ Fixed (October 2025)
1. ~~**Recovery Phrase Issues**~~ - Now uses full BIP39 wordlist (2048 words), no duplicates
2. ~~**Conflict Resolution Bug**~~ - No longer sends to setup screen after choosing cloud version
3. ~~**UI Refresh After Sync**~~ - Data updates immediately via `reloadFromDatabase()` pattern
4. ~~**Recovery Phrase Login**~~ - Toggle on login screen allows recovery phrase authentication

### ⚠️ Remaining Limitations
1. **No Salt Recovery** - If IndexedDB deleted, encrypted data on OneDrive can't be recovered
2. **No Sync Settings UI** - Users can't configure auto-sync frequency or Wi-Fi-only mode
3. **Limited Status Feedback** - Last sync time not prominently displayed in UI
4. **Retry Logic** - Failed syncs have exponential backoff but no manual retry button

### 🛠️ Device-Specific Issues
- **iPhone PWA MSAL Cache** - Some devices may experience OneDrive sign-in crash due to corrupted MSAL cache
  - **Solution**: Clear Safari website data, reinstall PWA, or clear localStorage manually

See `PHASE_3A.md` for detailed plans to address remaining limitations.

## Documentation

- `README.md` - Project overview and quick start guide
- `USER_GUIDE.md` - End-user documentation for using the app
- `CLAUDE.md` - This file - developer guide for AI assistants
- `PHASE_ROADMAP.md` - Visual timeline and status of all phases
- `PHASE_3A.md` - Complete specification for Phase 3a (10 tasks)
- `PHASE_3A_SUMMARY.md` - Quick reference for Phase 3a implementation
- `lockt-tech-spec-v4.md` - Complete technical specification (types, services, architecture)

**Key Utilities:**
- `src/utils/bip39-wordlist.ts` - Official BIP39 English wordlist (2048 words) for recovery phrases

## Notes for Future Sessions

- This is a monorepo package at `packages/lockt/` within a larger `react-apps` workspace
- Styling follows PayTrax aesthetic (sibling project)
- Mobile-first design with iPhone as primary target
- Phase 3 (OneDrive Sync) complete and working for multi-device scenarios
- Phase 3a (Sync Reliability) is the critical next step before production
- Core encryption and sync are battle-tested; focus next on recovery mechanisms and UX
