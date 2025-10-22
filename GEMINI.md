# Lockt: Project Context (GEMINI.md)

## 1. Project Overview

**Lockt** is a security-focused Progressive Web App (PWA) for storing sensitive personal data. It uses client-side encryption with OneDrive as the storage backend. The project is built with React, TypeScript, and Vite, featuring a mobile-first UI styled to match the aesthetic of the `PayTrax` application.

**Current Status (Phase 2 Complete):** The core UI foundation and all data entry/viewing components for every data category have been implemented. The application is functional with in-memory state management and is ready to proceed to Phase 3 (OneDrive Sync).

## 2. Technology Stack

- **Build Tool:** Vite
- **Framework:** React 18.x
- **Language:** TypeScript 5.x
- **Styling:** styled-components
- **State Management:** React Hooks (`useState`)
- **Dependencies:** `uuid`, `styled-components`

## 3. Project Structure

```
lockt/
├── src/
│   ├── components/
│   │   ├── auth/
│   │   ├── common/ (Button.tsx, Input.tsx)
│   │   ├── credit-cards/ (CreditCardDetail.tsx, CreditCardForm.tsx, etc.)
│   │   ├── crypto/ (CryptoDetail.tsx, CryptoForm.tsx, etc.)
│   │   ├── freetext/ (FreetextDetail.tsx, FreetextForm.tsx, etc.)
│   │   ├── health/ (HealthTabs.tsx, ProviderForm.tsx, ConditionList.tsx, etc.)
│   │   ├── layout/ (AppShell.tsx, TabNavigation.tsx)
│   │   └── passwords/ (PasswordDetail.tsx, PasswordForm.tsx, etc.)
│   ├── styles/ (GlobalStyles.ts, theme.ts)
│   ├── types/ (data.types.ts)
│   ├── App.tsx
│   └── main.tsx
├── package.json
├── tsconfig.json
└── vite.config.ts
```

## 4. Phase 2 Implementation Summary

**Goal:** Build out all data entry forms and core UI, matching the `PayTrax` look and feel.

**Completed Tasks:**
- **Theming & Styling:** Implemented a `styled-components` theme and global styles inspired by `PayTrax`.
- **App Shell:** Created the main application layout (`AppShell`) with a consistent header and content area.
- **Tab Navigation:** Built a top-level tab navigator for switching between data categories.
- **Common Components:** Developed reusable `Button` and `Input` components.
- **Data Sections Implemented (Full CRUD pattern):**
    - **Passwords:** Form, Quick View, and Detail View created.
    - **Credit Cards:** Form, Quick View, and Detail View created.
    - **Crypto:** Form, Quick View, and Detail View created.
    - **Freetext:** Form, Quick View, and Detail View created.
- **Complex Health Section:**
    - Implemented a sub-tab navigation for Providers, Conditions, Impairments, and Journal.
    - Built out the full CRUD pattern for all four health sub-categories.
    - Lifted state to the `HealthTabs` component to manage dependencies (e.g., linking Impairments to Conditions).
- **Bug Fixes & Refinements:**
    - Resolved multiple TypeScript `import type` errors.
    - Fixed `styled-components` transient prop warnings.
    - Adjusted UI based on feedback (e.g., making passwords visible, changing "Category" to "Description").

**Outcome:** All UI and in-memory data management for Phase 2 is complete. The application has a consistent and functional user interface for all specified data types.

## 5. Next Steps

- **Phase 3: OneDrive Sync:** Implement cloud synchronization with Microsoft OneDrive using MSAL.js and the Graph API.