import { cryptoRandom } from '@/modules/domain';
import { createLocalRepositories, type Repositories } from '../repositories';
import { createBlobStore } from '../storage/blob-store';
import { createLocalDriver } from '../storage/local-driver';

/** Browser wiring: localStorage records, IndexedDB photos, Web Crypto randomness, real clock. Loaded lazily. */
export function createBrowserRepositories(): Repositories {
  return createLocalRepositories({
    driver: createLocalDriver(),
    blobs: createBlobStore({ indexedDB: globalThis.indexedDB, rng: cryptoRandom }),
    clock: { now: () => new Date() },
  });
}
