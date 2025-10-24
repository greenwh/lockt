# Lockt: Project Context (GEMINI.md)

## 1. Project Overview

**Lockt** is a security-focused Progressive Web App (PWA) for storing sensitive personal data. It uses **app-level password protection** with OneDrive as the storage backend, leveraging Microsoft's built-in encryption for data at rest and in transit. This simplified architecture removes client-side encryption, focusing on device-level security and seamless cloud sync. The project is built with React, TypeScript, and Vite.

**Current Status (Phase 3 Complete):** The application is feature-complete for its core requirements. All UI components are implemented, local data persistence via IndexedDB is fully functional, and OneDrive sync is integrated and working. The project is ready to proceed to Phase 4 (Biometric Auth).

**Known Issue:** The project experiences a persistent, intermittent issue where the production build process (`npm run build`) hangs. A clean install of `node_modules` and downgrading Vite has proven to be a temporary fix. **It is highly recommended to use the development server (`npm run dev`) for running and testing the application.**

## 2. Technology Stack & Services

- **Build Tool:** Vite (v5.3.1)
- **Framework:** React 18.x
- **Language:** TypeScript 5.x
- **Styling:** styled-components
- **State Management:** React Context + Hooks (`useData`)
- **Local Database:** IndexedDB via `idb`
- **Cloud Sync:** Microsoft OneDrive via MSAL.js and Graph API
- **App Authentication:** Web Crypto API (SHA-256 for password hashing)

## 3. Project Status Summary

### Phase 1: Core Foundation - COMPLETE
- **`auth.service.ts`:** Refactored to handle local password hashing (SHA-256) and session management.
- **`database.service.ts`:** Refactored to store plain JSON `AppData` in IndexedDB, removing all client-side encryption logic.
- **`DataContext.tsx`:** Implemented to provide global state management and abstract data persistence.

### Phase 2: Data Entry & Core UI - COMPLETE
- **UI Implementation:** All components for Passwords, Credit Cards, Crypto, Freetext, and Health (including all sub-tabs) are fully implemented with styled forms, detail views, and list views.
- **Data Integration:** All UI components are connected to the `DataContext`, enabling full CRUD (Create, Read, Update, Delete) functionality backed by local IndexedDB storage.
- **Styling Reconciliation:** The UI has been restored to match the intended `PayTrax` aesthetic by correctly implementing all styled components.
- **Feature Refinements:** Implemented user feedback, including adding CSC to credit card view, masked data to crypto view, and date/association fields to the health section.

### Phase 3: OneDrive Sync - COMPLETE
- **`onedrive.service.ts`:** Fully implemented with MSAL.js for Microsoft authentication and Graph API calls for file operations (upload, download, metadata).
- **`SyncSettings.tsx`:** UI component created and integrated, allowing users to sign in, sign out, and manually trigger a sync with OneDrive.
- **Sync Logic:** The sync process correctly compares local and remote timestamps to determine whether to upload or download data.

## 4. Next Steps

- **Phase 4: Biometric Auth:** Implement WebAuthn for biometric unlock (Face ID, Windows Hello, etc.) as outlined in the specification.
- **Troubleshoot Build Issue:** Further investigate the root cause of the intermittent `npm run build` hang.