import { describe, expect, it } from 'vitest';
import { createLocalDriver } from './local-driver';

function fakeStorage(opts: { throwOnGet?: boolean; quota?: number } = {}) {
  const map = new Map<string, string>();
  return {
    getItem: (k: string) => { if (opts.throwOnGet) throw new Error('SecurityError'); return map.get(k) ?? null; },
    setItem: (k: string, v: string) => {
      if (opts.quota !== undefined && v.length > opts.quota) throw new DOMException('full', 'QuotaExceededError');
      map.set(k, v);
    },
    removeItem: (k: string) => { map.delete(k); },
  };
}

describe('createLocalDriver', () => {
  it('reads and writes through localStorage', () => {
    const d = createLocalDriver({ storage: fakeStorage(), target: new EventTarget() });
    expect(d.write('k', 'v')).toEqual({ ok: true, value: undefined });
    expect(d.read('k')).toBe('v');
  });
  it('reports a full store as STORAGE / error.storage.full', () => {
    const d = createLocalDriver({ storage: fakeStorage({ quota: 3 }), target: new EventTarget() });
    expect(d.write('k', 'too long')).toMatchObject({ ok: false, error: { code: 'STORAGE', messageKey: 'error.storage.full' } });
  });
  it('falls back to memory when storage is blocked (private mode, some in-app browsers)', () => {
    const d = createLocalDriver({ storage: fakeStorage({ throwOnGet: true }), target: new EventTarget() });
    d.write('k', 'v');
    expect(d.read('k')).toBe('v');
    expect(d.persistent).toBe(false);
  });
  it('forwards storage events from other tabs', () => {
    const target = new EventTarget();
    const d = createLocalDriver({ storage: fakeStorage(), target });
    const seen: (string | null)[] = [];
    const off = d.subscribe((key) => seen.push(key));
    const event = new Event('storage') as Event & { key: string | null };
    Object.defineProperty(event, 'key', { value: 'mento:db' });
    target.dispatchEvent(event);
    off();
    target.dispatchEvent(event);
    expect(seen).toEqual(['mento:db']);
  });
});
