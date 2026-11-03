import { err, newId, ok, type RandomSource, type Result } from '@/modules/domain';

/** Photos and other blobs, on this device only (threat model I4). IndexedDB via a small wrapper (ADR-001). */
export type BlobStore = {
  put(blob: Blob): Promise<Result<string>>;
  get(key: string): Promise<Result<Blob>>;
  delete(key: string): Promise<void>;
  keys(): Promise<string[]>;
  clear(): Promise<void>;
};

const DB_NAME = 'mento-blobs';
const STORE = 'blobs';
/** Compressed photos target ≤ 300 KB (SPEC §8); this is the hard ceiling. */
const DEFAULT_MAX_BYTES = 2 * 1024 * 1024;

/** Stored as bytes + type rather than Blob: the most portable choice across older WebViews. */
type StoredBlob = { type: string; bytes: ArrayBuffer };

function request<T>(req: IDBRequest<T>): Promise<T> {
  return new Promise((resolve, reject) => {
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

export function createBlobStore(deps: { indexedDB: IDBFactory | undefined; rng: RandomSource; maxBytes?: number }): BlobStore {
  const maxBytes = deps.maxBytes ?? DEFAULT_MAX_BYTES;
  let opening: Promise<IDBDatabase> | null = null;

  const open = (): Promise<IDBDatabase> => {
    if (!deps.indexedDB) return Promise.reject(new Error('indexedDB unavailable'));
    opening ??= new Promise((resolve, reject) => {
      const factory = deps.indexedDB;
      if (!factory) { reject(new Error('indexedDB unavailable')); return; }
      const req = factory.open(DB_NAME, 1);
      req.onupgradeneeded = () => { req.result.createObjectStore(STORE); };
      req.onsuccess = () => resolve(req.result);
      req.onerror = () => { opening = null; reject(req.error); };
    });
    return opening;
  };

  const withStore = async <T>(mode: IDBTransactionMode, run: (store: IDBObjectStore) => IDBRequest<T>): Promise<T> => {
    const db = await open();
    return request(run(db.transaction(STORE, mode).objectStore(STORE)));
  };

  return {
    async put(blob) {
      if (blob.size > maxBytes) return err('VALIDATION', 'error.validation', { size: blob.size, maxBytes });
      const key = newId('photo', deps.rng);
      try {
        const value: StoredBlob = { type: blob.type, bytes: await blob.arrayBuffer() };
        await withStore('readwrite', (s) => s.put(value, key));
        return ok(key);
      } catch (e) {
        return err('STORAGE', deps.indexedDB ? 'error.storage.full' : 'error.storage.unavailable', e instanceof Error ? e.name : undefined);
      }
    },
    async get(key) {
      try {
        const value = (await withStore('readonly', (s) => s.get(key))) as StoredBlob | undefined;
        if (!value || !(value.bytes instanceof ArrayBuffer) || typeof value.type !== 'string') return err('NOT_FOUND', 'error.notFound.title');
        return ok(new Blob([value.bytes], { type: value.type }));
      } catch {
        return err('STORAGE', 'error.storage.unavailable');
      }
    },
    async delete(key) {
      try { await withStore('readwrite', (s) => s.delete(key)); } catch { /* nothing to delete */ }
    },
    async keys() {
      try { return (await withStore('readonly', (s) => s.getAllKeys())).map(String); } catch { return []; }
    },
    async clear() {
      try { await withStore('readwrite', (s) => s.clear()); } catch { /* nothing to clear */ }
    },
  };
}
