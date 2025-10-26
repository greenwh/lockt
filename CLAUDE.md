# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Overview

**Lockt** is a security-focused Progressive Web App (PWA) for storing and accessing sensitive personal data using client-side encryption with OneDrive as the storage backend. All encryption/decryption happens client-side—OneDrive stores only encrypted data (zero-knowledge security). The app is mobile-first (optimized for iPhone Safari) but fully functional on desktop browsers.

**Current Status**:
- ✅ **Phase 1-2**: Complete (encryption, data entry, UI)
- ✅ **Phase 3**: Complete (OneDrive sync with MSAL, multi-device sync working)
- 🟢 **Phase 3a**: Partially Complete (Oct 2025 bug fixes - see below)
- 📅 **Phase 4+**: Biometric auth, export, polish

**Recent Updates (October 25, 2025)**:
Critical bug fixes completing most of Phase 3a:
- ✅ Recovery phrase generation (full BIP39 wordlist - 2048 words)
- ✅ Recovery phrase login support (UI toggle on login screen)
- ✅ Conflict resolution fixed (no more page reload → setup screen)
- ✅ UI auto-refresh after sync (reloadFromDatabase pattern)
- ✅ Seamless state updates (AuthContext.reloadFromDatabase method)

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
Context (SyncContext)
    ↓
Services (crypto.service, database.service, onedrive.service, sync.service)
    ↓
Storage (IndexedDB local, OneDrive cloud)
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
- `src/services/database.service.ts` - IndexedDB operations for local encrypted storage
- `src/services/onedrive.service.ts` - Microsoft Graph API integration for cloud sync
- `src/services/sync.service.ts` - Orchestrates sync logic between local and cloud

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
- `src/context/AuthContext.tsx` - Authentication state, unlock/lock, data mutations, and `reloadFromDatabase()` method
- `src/context/SyncContext.tsx` - Global state for sync status, account info, and sync operations

**Components**
- `src/components/layout/` - App shell, tab navigation, header
- `src/components/auth/` - Login and setup screens
- `src/components/[category]/` - Category-specific list/detail/form components
- `src/components/sync/` - Sync UI components

### IndexedDB Schema

**Database**: `lockt-db` (version 1)

**Object Stores:**
1. `encrypted-data` - Single record with key `'main'` containing the encrypted blob
2. `app-config` - Key-value store for salt, deviceId, lastSyncTime, etc.

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
- Master password never stored
- Recovery phrase as backup authentication mechanism
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
