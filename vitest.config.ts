import { defineConfig } from 'vitest/config';

// Separate from vite.config.ts so the PWA plugin doesn't run during tests.
// Tests run in the Node environment, which provides Web Crypto via globalThis.crypto.
export default defineConfig({
  test: {
    environment: 'node',
    include: ['src/**/*.{test,spec}.{ts,tsx}'],
  },
});
