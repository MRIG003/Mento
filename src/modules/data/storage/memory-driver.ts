import { err, ok } from '@/modules/domain';
import type { StorageDriver } from './driver';

/**
 * In-memory drivers sharing one store, like browser tabs sharing localStorage: a write in one notifies the others
 * (as the `storage` event does). A fake with real behaviour, used by tests and as a blocked-storage fallback.
 */
export function createMemoryDrivers(count: number, opts: { quotaBytes?: number } = {}): StorageDriver[] {
  const store = new Map<string, string>();
  const listeners: Set<(key: string | null) => void>[] = Array.from({ length: count }, () => new Set());
  const notifyOthers = (from: number, key: string) => listeners.forEach((set, i) => { if (i !== from) set.forEach((l) => l(key)); });

  return listeners.map((own, index): StorageDriver => ({
    persistent: true,
    read: (key) => store.get(key) ?? null,
    write: (key, value) => {
      if (opts.quotaBytes !== undefined && value.length > opts.quotaBytes) return err('STORAGE', 'error.storage.full');
      store.set(key, value);
      notifyOthers(index, key);
      return ok(undefined);
    },
    remove: (key) => { store.delete(key); notifyOthers(index, key); },
    subscribe: (listener) => { own.add(listener); return () => { own.delete(listener); }; },
  }));
}
