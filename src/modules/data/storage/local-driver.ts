import { err, ok } from '@/modules/domain';
import type { StorageDriver } from './driver';

type KeyValueStorage = Pick<Storage, 'getItem' | 'setItem' | 'removeItem'>;

function usable(storage: KeyValueStorage): boolean {
  try {
    storage.getItem('mento:probe');
    return true;
  } catch {
    return false;
  }
}

/**
 * localStorage driver. Blocked storage (private mode, some in-app browsers) falls back to memory for this page,
 * and the UI can say so (`persistent: false`). Other tabs' writes arrive through the `storage` event.
 */
export function createLocalDriver(deps: { storage?: KeyValueStorage; target?: EventTarget } = {}): StorageDriver {
  const storage = deps.storage ?? globalThis.localStorage;
  const target = deps.target ?? globalThis;
  const persistent = Boolean(storage) && usable(storage);
  const memory = new Map<string, string>();

  return {
    persistent,
    read: (key) => (persistent ? storage.getItem(key) : memory.get(key) ?? null),
    write: (key, value) => {
      if (!persistent) {
        memory.set(key, value);
        return ok(undefined);
      }
      try {
        storage.setItem(key, value);
        return ok(undefined);
      } catch (e) {
        return err('STORAGE', 'error.storage.full', e instanceof Error ? e.name : undefined);
      }
    },
    remove: (key) => {
      if (persistent) storage.removeItem(key);
      else memory.delete(key);
    },
    subscribe: (listener) => {
      const onStorage = (event: Event) => listener((event as StorageEvent).key ?? null);
      target.addEventListener('storage', onStorage);
      return () => target.removeEventListener('storage', onStorage);
    },
  };
}
