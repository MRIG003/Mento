import { IDBFactory } from 'fake-indexeddb';
import { describe, expect, it } from 'vitest';
import { seededRandom } from '@/modules/domain';
import { createBlobStore } from './blob-store';

const make = () => createBlobStore({ indexedDB: new IDBFactory(), rng: seededRandom(1) });

describe('BlobStore (photos stay on this device)', () => {
  it('stores a photo and reads back the same bytes and type', async () => {
    const store = make();
    const photo = new Blob([new Uint8Array([0xff, 0xd8, 0xff, 1, 2, 3])], { type: 'image/jpeg' });
    const put = await store.put(photo);
    expect(put.ok).toBe(true);
    if (!put.ok) return;
    expect(put.value).toMatch(/^photo_[A-Za-z0-9_-]{14}$/);
    const got = await store.get(put.value);
    expect(got.ok).toBe(true);
    if (!got.ok) return;
    expect(got.value.type).toBe('image/jpeg');
    expect(new Uint8Array(await got.value.arrayBuffer())).toEqual(new Uint8Array([0xff, 0xd8, 0xff, 1, 2, 3]));
  });

  it('returns NOT_FOUND for an unknown key and after deletion', async () => {
    const store = make();
    expect(await store.get('photo_missing')).toMatchObject({ ok: false, error: { code: 'NOT_FOUND' } });
    const put = await store.put(new Blob(['x'], { type: 'image/png' }));
    if (!put.ok) throw new Error('put failed');
    await store.delete(put.value);
    expect(await store.get(put.value)).toMatchObject({ ok: false, error: { code: 'NOT_FOUND' } });
  });

  it('refuses files over the size limit', async () => {
    const store = createBlobStore({ indexedDB: new IDBFactory(), rng: seededRandom(1), maxBytes: 4 });
    expect(await store.put(new Blob(['12345']))).toMatchObject({ ok: false, error: { code: 'VALIDATION' } });
  });

  it('reports STORAGE when IndexedDB is not available', async () => {
    const store = createBlobStore({ indexedDB: undefined, rng: seededRandom(1) });
    expect(await store.put(new Blob(['x']))).toMatchObject({ ok: false, error: { code: 'STORAGE', messageKey: 'error.storage.unavailable' } });
  });

  it('can list and clear everything (delete-all-my-data flow)', async () => {
    const store = make();
    await store.put(new Blob(['a']));
    await store.put(new Blob(['b']));
    expect((await store.keys()).length).toBe(2);
    await store.clear();
    expect(await store.keys()).toEqual([]);
  });
});
