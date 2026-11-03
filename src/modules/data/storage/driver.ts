import type { Result } from '@/modules/domain';

/** Low-level key/value storage (ADR-001). Local impl = localStorage; tests = in-memory fake; later a sync adapter. */
export type StorageDriver = {
  /** false when storage is blocked and values live only in memory for this page. */
  readonly persistent: boolean;
  read(key: string): string | null;
  write(key: string, value: string): Result<void>;
  remove(key: string): void;
  /** Changes made by another tab (or another driver instance in tests). */
  subscribe(listener: (key: string | null) => void): () => void;
};
