# Lockt - Secure Personal Data PWA

Lockt is a security-focused Progressive Web App (PWA) for storing and accessing sensitive personal data. It uses client-side encryption with OneDrive as the storage backend, enabling secure multi-device access without a custom server infrastructure.

## Project Status

| Phase | Feature | Status |
|-------|---------|--------|
| 1 | Encryption & Storage | ✅ Complete |
| 2 | Data Entry UI | ✅ Complete |
| 3 | OneDrive Sync | ✅ Complete |
| 3a | Sync Reliability | 📋 Planned |
| 4 | Biometric Auth | 📅 Next |
| 5+ | Export & Polish | 📅 Future |

**Phase 3 Complete**: OneDrive sync is fully functional with multi-device support. Data encrypts locally, syncs securely to OneDrive, and can be accessed from any device with the same password.

**Phase 3a Next**: Focus on production readiness with salt recovery, conflict resolution UI, sync settings, and status notifications.

See `PHASE_ROADMAP.md` for detailed timeline and `PHASE_3A.md` for next phase specifications.

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

### ✅ Phase 3 Complete
- **Zero-Knowledge Encryption** - All data encrypted client-side using AES-GCM
- **Multi-Device Sync** - OneDrive keeps data synced across devices
- **Secure Authentication** - MSAL OAuth2 for Microsoft account
- **5 Data Categories** - Passwords, Credit Cards, Crypto, Freetext, Health
- **Search & Filter** - Global search across all entries
- **PWA Support** - Works offline, installable on mobile

### 📋 Planned (Phase 3a)
- **Salt Recovery** - Account recovery after data loss
- **Conflict Resolution** - User control over sync conflicts
- **Sync Settings** - Configure frequency, Wi-Fi-only mode
- **Status Notifications** - Real-time sync feedback

### 📅 Future (Phase 4+)
- **Biometric Auth** - Face ID, Touch ID, Windows Hello
- **Export** - JSON, CSV, TXT exports
- **Auto-lock** - Configurable inactivity timeout
- **Dark Mode** - Theme toggle
- **Bank Register** - Financial tracking

## Architecture

See `CLAUDE.md` for detailed architecture, data flow, and implementation patterns.

## Documentation

- **`CLAUDE.md`** - Developer guide and architecture
- **`PHASE_ROADMAP.md`** - Complete phase timeline
- **`PHASE_3A.md`** - Phase 3a specification (10 tasks)
- **`PHASE_3A_SUMMARY.md`** - Quick reference
- **`lockt-tech-spec-v4.md`** - Full technical specification

## Security

- ✅ AES-GCM encryption (256-bit keys)
- ✅ PBKDF2 key derivation (600,000 iterations)
- ✅ Random IV for each encryption
- ✅ Zero-knowledge design (server can't decrypt)
- ✅ No plaintext stored locally or in cloud
- ⚠️ Recovery phrase backup recommended