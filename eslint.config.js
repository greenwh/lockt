import js from '@eslint/js'
import globals from 'globals'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'
import tseslint from 'typescript-eslint'
import { defineConfig, globalIgnores } from 'eslint/config'

export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      js.configs.recommended,
      tseslint.configs.recommended,
      reactHooks.configs['recommended-latest'],
      reactRefresh.configs.vite,
    ],
    languageOptions: {
      ecmaVersion: 2020,
      globals: globals.browser,
    },
    rules: {
      // This codebase intentionally uses `any` in generic data-shuffling code
      // (merge/diff utilities, CSV import/export, error handlers). Keep it
      // visible as a warning rather than a build-blocking error, so genuine
      // errors stand out and `npm run lint` stays green.
      '@typescript-eslint/no-explicit-any': 'warn',
      // Allow intentionally-unused args/vars when prefixed with underscore.
      '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_', varsIgnorePattern: '^_' }],
      // styled.d.ts module augmentation legitimately extends an interface.
      '@typescript-eslint/no-empty-object-type': 'off',
      // Fast-refresh export hygiene is a dev-only concern, not a correctness bug.
      'react-refresh/only-export-components': 'warn',
    },
  },
])
