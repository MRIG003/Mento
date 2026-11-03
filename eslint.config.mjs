// Flat config per Next 16.4.2 docs (node_modules/next/dist/docs/01-app/03-api-reference/05-config/03-eslint.md).
import { defineConfig, globalIgnores } from 'eslint/config';
import nextVitals from 'eslint-config-next/core-web-vitals';
import nextTs from 'eslint-config-next/typescript';

const FEATURE_MODULES = [
  'homework', 'student-link', 'insights', 'capture', 'family',
  'principal', 'privacy', 'onboarding', 'desk',
];

/** ADR-011: import other modules only through their public index; features never import features. */
const boundaryRules = FEATURE_MODULES.map((self) => ({
  files: [`src/modules/${self}/**/*.{ts,tsx}`],
  rules: {
    'no-restricted-imports': ['error', {
      patterns: [
        { group: ['@/modules/*/*'], message: 'Import modules through their public index (ADR-011).' },
        {
          group: FEATURE_MODULES.filter((m) => m !== self).map((m) => `@/modules/${m}`),
          message: 'Feature modules must not import each other; link by route and share via data (ADR-011).',
        },
      ],
    }],
  },
}));

export default defineConfig([
  ...nextVitals,
  ...nextTs,
  {
    rules: {
      'no-restricted-imports': ['error', {
        patterns: [{ group: ['@/modules/*/*'], message: 'Import modules through their public index (ADR-011).' }],
      }],
      // Threat model T2: never render HTML from strings.
      'react/no-danger': 'error',
      'no-restricted-properties': ['error',
        { property: 'innerHTML', message: 'Never set innerHTML (threat model T2).' },
        { property: 'outerHTML', message: 'Never set outerHTML (threat model T2).' },
      ],
      'no-eval': 'error',
      'no-implied-eval': 'error',
      '@typescript-eslint/no-explicit-any': 'error',
      '@typescript-eslint/consistent-type-definitions': ['error', 'type'],
      // App Router only; this Pages-Router rule has nothing to check.
      '@next/next/no-html-link-for-pages': 'off',
    },
  },
  {
    // All UI text goes through t() (SPEC-foundation i18n).
    files: ['src/**/*.tsx'],
    ignores: ['src/**/*.test.tsx'],
    rules: {
      'react/jsx-no-literals': ['error', { noStrings: false, ignoreProps: true, allowedStrings: ['·', '|', '/', '–', '—', '✓', '×', '…', 'EN', 'हिं', ':', '%'] }],
    },
  },
  {
    // domain is pure: no React, Next, storage, clock or randomness (SPEC-domain).
    files: ['src/modules/domain/**/*.ts'],
    ignores: ['src/modules/domain/**/*.test.ts'],
    rules: {
      'no-restricted-imports': ['error', { patterns: [{ group: ['react', 'react-dom', 'next', 'next/*', '@/modules/*'], message: 'domain must stay pure.' }] }],
      'no-restricted-globals': ['error', 'localStorage', 'indexedDB', 'window', 'document'],
      'no-restricted-properties': ['error',
        { object: 'Date', property: 'now', message: 'Inject a Clock.' },
        { object: 'Math', property: 'random', message: 'Inject a RandomSource.' },
      ],
    },
  },
  ...boundaryRules,
  globalIgnores(['.next/**', 'out/**', 'build/**', 'coverage/**', 'playwright-report/**', 'test-results/**', 'next-env.d.ts', 'public/sw.js']),
]);
