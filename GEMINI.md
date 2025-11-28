# Project Overview
Lockt is a security-focused Progressive Web App (PWA) for storing sensitive personal data (passwords, cards, health info). It utilizes client-side encryption and integrates with Microsoft OneDrive for secure cloud storage.

## Technical Stack
- **Frontend**: React 18, TypeScript, Vite.
- **Styling**: Styled-Components.
- **Storage**: OneDrive (via MSAL/Graph API).
- **Encryption**: Client-side (likely AES/CryptoJS).

## Key Features
- **Secure Storage**: Passwords, Credit Cards, Crypto, Health records.
- **Cloud Sync**: OneDrive integration.
- **Security**: Zero-knowledge architecture (encryption happens in browser).
- **UI**: Mobile-first design inspired by PayTrax.

## Directory Structure
- `src/components/`: React components.
- `src/styles/`: Theming.
- `vite.config.ts`: Build configuration.

## Current Status
- **Phase 2 Complete**: UI and local data entry functional.
- **Next Steps**: Phase 3 (OneDrive Sync).
