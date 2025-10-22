# Lockt - Secure Personal Data PWA

Lockt is a security-focused Progressive Web App (PWA) for storing and accessing sensitive personal data. It uses client-side encryption with OneDrive as the storage backend, enabling secure multi-device access without a custom server infrastructure.

## Project Status

**Phase 2: Core UI & Data Entry (Complete)**

The application's UI foundation is complete. All components for creating, viewing, and editing data for every category (Passwords, Credit Cards, Crypto, Freetext, Health) have been implemented with in-memory state. The visual style is based on the `PayTrax` project aesthetic.

**Next Up: Phase 3 - OneDrive Sync.**

## Technology Stack

- **Build Tool:** Vite
- **Framework:** React 18.x
- **Language:** TypeScript 5.x
- **Styling:** styled-components
- **Encryption:** Web Crypto API (to be implemented in Phase 3)
- **Cloud Storage:** Microsoft OneDrive (to be implemented in Phase 3)

## Development Setup

1.  **Install Dependencies:**
    ```bash
    npm install
    ```

2.  **Run the Development Server:**
    ```bash
    npm run dev
    ```

This will start the Vite development server, and you can view the application in your browser.