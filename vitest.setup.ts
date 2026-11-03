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

// jsdom has no HTMLDialogElement.showModal/close. Minimal fake for component tests; real behaviour is covered in Playwright.
if (typeof HTMLDialogElement !== 'undefined' && !HTMLDialogElement.prototype.showModal) {
  HTMLDialogElement.prototype.showModal = function showModal(this: HTMLDialogElement) { this.setAttribute('open', ''); };
  HTMLDialogElement.prototype.close = function close(this: HTMLDialogElement) {
    this.removeAttribute('open');
    this.dispatchEvent(new Event('close'));
  };
}
if (typeof Element !== 'undefined' && !Element.prototype.scrollIntoView) {
  Element.prototype.scrollIntoView = function scrollIntoView() {};
}
