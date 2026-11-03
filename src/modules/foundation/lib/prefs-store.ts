import { parseLang } from '../i18n/resolve-lang';
import type { Lang } from '../i18n/t';

/**
 * Device preferences (no personal data): language, text size, sound. Read through useSyncExternalStore.
 * Storage is untrusted (threat model T1): every field is validated, and blocked storage falls back to memory.
 */
export type TextSize = 100 | 115 | 130;
export type Prefs = { lang?: Lang; textSize?: TextSize; sound?: boolean };

export const PREFS_KEY = 'mento:prefs';
const TEXT_SIZES: readonly number[] = [100, 115, 130];

export function parsePrefs(raw: string | null): Prefs {
  if (!raw) return {};
  let data: unknown;
  try {
    data = JSON.parse(raw);
  } catch {
    return {};
  }
  if (typeof data !== 'object' || data === null) return {};
  const record = data as Record<string, unknown>;
  const prefs: Prefs = {};
  const lang = parseLang(record.lang);
  if (lang) prefs.lang = lang;
  if (typeof record.textSize === 'number' && TEXT_SIZES.includes(record.textSize)) prefs.textSize = record.textSize as TextSize;
  if (typeof record.sound === 'boolean') prefs.sound = record.sound;
  return prefs;
}

let memoryRaw: string | null = null; // used when localStorage is blocked (private mode, some in-app browsers)
let cachedRaw: string | null | undefined;
let cachedPrefs: Prefs = {};
const listeners = new Set<() => void>();

function readRaw(): string | null {
  try {
    return window.localStorage.getItem(PREFS_KEY) ?? memoryRaw;
  } catch {
    return memoryRaw;
  }
}

export function readPrefs(): Prefs {
  const raw = readRaw();
  if (raw !== cachedRaw) {
    cachedRaw = raw;
    cachedPrefs = parsePrefs(raw);
  }
  return cachedPrefs;
}

export function writePrefs(patch: Prefs): void {
  const raw = JSON.stringify({ ...readPrefs(), ...patch });
  memoryRaw = raw;
  try {
    window.localStorage.setItem(PREFS_KEY, raw);
  } catch {
    // Storage blocked: keep the in-memory copy for this session.
  }
  listeners.forEach((notify) => notify());
}

export function subscribePrefs(notify: () => void): () => void {
  listeners.add(notify);
  const onStorage = (event: StorageEvent) => {
    if (event.key === PREFS_KEY || event.key === null) notify();
  };
  window.addEventListener('storage', onStorage);
  return () => {
    listeners.delete(notify);
    window.removeEventListener('storage', onStorage);
  };
}

/** Test helper: forget cached and in-memory state. */
export function resetPrefsForTests(): void {
  memoryRaw = null;
  cachedRaw = undefined;
  cachedPrefs = {};
}
