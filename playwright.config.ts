import { defineConfig, devices } from '@playwright/test';

/** Smoke tests at 390 px in both languages, against the production build (SPEC §6). */
const phone = { ...devices['Desktop Chrome'], viewport: { width: 390, height: 844 }, deviceScaleFactor: 1, hasTouch: true };

export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  reporter: process.env.CI ? 'github' : 'list',
  use: { baseURL: 'http://localhost:3100', trace: 'retain-on-failure' },
  projects: [
    { name: 'en-390', use: { ...phone, locale: 'en-IN' } },
    { name: 'hi-390', use: { ...phone, locale: 'hi-IN' } },
  ],
  webServer: {
    command: 'npx next start -p 3100',
    url: 'http://localhost:3100',
    reuseExistingServer: !process.env.CI,
    timeout: 60_000,
  },
});
