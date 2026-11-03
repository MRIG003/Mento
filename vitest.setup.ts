import '@testing-library/jest-dom/vitest';
import { cleanup } from '@testing-library/react';
import { afterEach } from 'vitest';
import { resetPrefsForTests } from './src/modules/foundation/lib/prefs-store';

afterEach(() => {
  cleanup();
  localStorage.clear();
  resetPrefsForTests();
  document.documentElement.lang = 'en';
  window.history.replaceState(null, '', '/');
});
