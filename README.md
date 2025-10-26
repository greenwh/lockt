# Lockt - Secure Personal Data PWA

Lockt is a security-focused Progressive Web App (PWA) for storing and accessing sensitive personal data. It uses client-side encryption with OneDrive as the storage backend, enabling secure multi-device access without a custom server infrastructure.

## Project Status

| Phase | Feature | Status |
|-------|---------|--------|
| 1 | Encryption & Storage | ✅ Complete |
| 2 | Data Entry UI | ✅ Complete |
| 3 | OneDrive Sync | ✅ Complete |
| 3a | Sync Reliability | 🟢 Mostly Complete (Oct 2025) |
| 4 | Biometric Auth | 📅 Next |
| 5+ | Export & Polish | 📅 Future |

**Latest Update (October 25, 2025)**: Critical bug fixes completing most of Phase 3a:
- ✅ **Recovery Phrase Generation** - Full BIP39 wordlist (2048 words), no duplicates
- ✅ **Recovery Phrase Login** - Toggle on login screen for backup authentication
- ✅ **Conflict Resolution** - Fixed page reload bug, seamless state updates
- ✅ **UI Auto-Refresh** - Changes from sync appear immediately (no restart needed)
- ✅ **Multi-Device Sync** - Fully functional with conflict detection and resolution

**Phase 3 Complete**: OneDrive sync is fully functional with multi-device support. Data encrypts locally, syncs securely to OneDrive, and can be accessed from any device with the same password.

**Remaining Phase 3a Tasks**: Salt recovery system, sync settings UI, enhanced status notifications.

See `PHASE_ROADMAP.md` for detailed timeline and `USER_GUIDE.md` for usage instructions.

## Technology Stack

- **Build Tool:** Vite 5.x
- **Framework:** React 18.x
- **Language:** TypeScript 5.x
- **Styling:** styled-components 6.x
- **Encryption:** Web Crypto API (AES-GCM + PBKDF2, 600k iterations)
- **Cloud Storage:** Microsoft OneDrive (via MSAL.js 3.x)
- **Local Database:** IndexedDB (via `idb` wrapper)
- **PWA:** vite-plugin-pwa

## Development Setup

1.  **Install Dependencies:**
    ```bash
    npm install
    ```

2.  **Run the Development Server:**
    ```bash
    npm run dev
    ```
    Opens at `http://localhost:5173`

3.  **Build for Production:**
    ```bash
    npm run build
    ```

4.  **Preview Production Build:**
    ```bash
    npm run preview
    ```

## Key Features

### ✅ Production Ready (Phase 3 + 3a Partial)
- **Zero-Knowledge Encryption** - All data encrypted client-side using AES-GCM
- **Multi-Device Sync** - OneDrive keeps data synced across devices with conflict detection
- **Recovery Phrases** - 12-word BIP39 phrases for backup authentication
- **Seamless Sync** - UI updates immediately after downloading changes
- **Conflict Resolution** - Choose between local and cloud versions when conflicts occur
- **Secure Authentication** - MSAL OAuth2 for Microsoft account
- **5 Data Categories** - Passwords, Credit Cards, Crypto, Freetext, Health
- **Search & Filter** - Global search across all entries
- **PWA Support** - Works offline, installable on mobile

### 📋 Remaining Phase 3a Tasks
- **Salt Recovery** - Account recovery after IndexedDB data loss
- **Sync Settings UI** - Configure frequency, Wi-Fi-only mode
- **Status Notifications** - Enhanced sync feedback in UI

### 📅 Future (Phase 4+)
- **Biometric Auth** - Face ID, Touch ID, Windows Hello
- **Export** - JSON, CSV, TXT exports
- **Auto-lock** - Configurable inactivity timeout
- **Dark Mode** - Theme toggle
- **Bank Register** - Financial tracking

## Architecture

See `CLAUDE.md` for detailed architecture, data flow, and implementation patterns.

## Documentation

### For Users
- **`USER_GUIDE.md`** - Complete user guide with screenshots and tutorials

### For Developers
- **`README.md`** - This file - project overview and quick start
- **`CLAUDE.md`** - Developer guide for AI assistants and architecture details
- **`PHASE_ROADMAP.md`** - Complete phase timeline and status
- **`PHASE_3A.md`** - Phase 3a specification (10 tasks)
- **`PHASE_3A_SUMMARY.md`** - Quick reference for Phase 3a
- **`lockt-tech-spec-v4.md`** - Full technical specification

## Security

- ✅ **AES-GCM encryption** (256-bit keys)
- ✅ **PBKDF2 key derivation** (600,000 iterations, OWASP 2024 recommendation)
- ✅ **Random IV** for each encryption operation
- ✅ **Zero-knowledge design** (OneDrive/Microsoft cannot decrypt your data)
- ✅ **No plaintext storage** (encrypted locally in IndexedDB, encrypted in OneDrive)
- ✅ **BIP39 recovery phrases** (12-word backup authentication, 2048-word wordlist)
- ✅ **Multi-device sync** with conflict detection and resolution
- ⚠️ **Important**: Save your recovery phrase - it's your only backup if you forget your password!