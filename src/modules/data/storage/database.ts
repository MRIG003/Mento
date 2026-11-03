import { err, ok, type Clock, type Result } from '@/modules/domain';
import { CURRENT_SCHEMA_VERSION, CollectionsSchema, DB_KEY, type Collections } from './collections';
import type { StorageDriver } from './driver';
import { migrate } from './migrations';

export function emptyCollections(now = '1970-01-01T00:00:00.000Z'): Collections {
  return {
    meta: { createdAt: now, demo: false },
    schools: [], teachers: [], subjects: [], classes: [], students: [], concepts: [], questions: [], homework: [],
    submissions: [], practiceSets: [], consents: [], reminders: [], templates: [], events: [],
    onboarding: { teacher: {}, principal: {}, toursSeen: [] },
    session: { claims: {} },
  };
}

export type Database = {
  /** Current data, null when nothing is stored yet. Parsed, migrated and validated (storage is untrusted). */
  read(): Result<Collections | null>;
  /** Apply a change and persist it. The result is validated before writing; storage stays untouched on failure. */
  update(change: (current: Collections) => Collections): Result<Collections>;
  /** Replace everything (seed, reset). */
  replace(next: Collections): Result<Collections>;
  /** Fires after any change: this tab's writes and other tabs' writes (storage event). */
  subscribe(listener: () => void): () => void;
};

export function createDatabase(deps: { driver: StorageDriver; clock: Clock }): Database {
  const { driver, clock } = deps;
  let cache: { raw: string | null; value: Result<Collections | null> } | null = null;
  const local = new Set<() => void>();

  const quarantine = (raw: string, reason: string): Result<never> => {
    driver.write(`${DB_KEY}:corrupt:${clock.now().toISOString()}`, raw);
    return err('STORAGE', 'error.storage.corrupt', reason);
  };

  const parse = (raw: string | null): Result<Collections | null> => {
    if (raw === null) return ok(null);
    let envelope: unknown;
    try {
      envelope = JSON.parse(raw);
    } catch {
      return quarantine(raw, 'json');
    }
    if (typeof envelope !== 'object' || envelope === null || !('schemaVersion' in envelope) || !('data' in envelope)) return quarantine(raw, 'envelope');
    const version = (envelope as { schemaVersion: unknown }).schemaVersion;
    if (typeof version !== 'number' || !Number.isInteger(version) || version < 1 || version > CURRENT_SCHEMA_VERSION) return quarantine(raw, `version:${String(version)}`);
    let data: unknown;
    try {
      data = migrate((envelope as { data: unknown }).data, version, CURRENT_SCHEMA_VERSION);
    } catch {
      return quarantine(raw, 'migration');
    }
    const parsed = CollectionsSchema.safeParse(data);
    return parsed.success ? ok(parsed.data) : quarantine(raw, 'schema');
  };

  const read = (): Result<Collections | null> => {
    const raw = driver.read(DB_KEY);
    if (!cache || cache.raw !== raw) cache = { raw, value: parse(raw) };
    return cache.value;
  };

  const write = (next: Collections): Result<Collections> => {
    const parsed = CollectionsSchema.safeParse(next);
    if (!parsed.success) return err('VALIDATION', 'error.validation', parsed.error.issues.slice(0, 5));
    const raw = JSON.stringify({ schemaVersion: CURRENT_SCHEMA_VERSION, data: parsed.data });
    const saved = driver.write(DB_KEY, raw);
    if (!saved.ok) return saved;
    cache = { raw, value: ok(parsed.data) };
    local.forEach((notify) => notify());
    return ok(parsed.data);
  };

  return {
    read,
    update: (change) => {
      const current = read();
      if (!current.ok) return current;
      return write(change(current.value ?? emptyCollections(clock.now().toISOString())));
    },
    replace: write,
    subscribe: (listener) => {
      local.add(listener);
      const off = driver.subscribe((key) => { if (key === DB_KEY || key === null) listener(); });
      return () => { local.delete(listener); off(); };
    },
  };
}
