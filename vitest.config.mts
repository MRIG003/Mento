// Based on Next 16.4.2 docs (guides/testing/vitest.md); tsconfig paths via Vite 8's native resolve.tsconfigPaths.
import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  resolve: { tsconfigPaths: true },
  test: {
    projects: [
      {
        extends: true,
        test: { name: 'unit', environment: 'node', include: ['src/**/*.test.ts'] },
      },
      {
        extends: true,
        test: {
          name: 'dom',
          environment: 'jsdom',
          include: ['src/**/*.test.tsx'],
          setupFiles: ['./vitest.setup.ts'],
        },
      },
    ],
    coverage: { provider: 'v8', include: ['src/modules/**/*.{ts,tsx}'], exclude: ['**/*.test.*'] },
  },
});
