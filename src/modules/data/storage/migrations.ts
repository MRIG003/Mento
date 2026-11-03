/**
 * Schema migrations, N → N+1, applied in order on read (ADR-001). Inputs are untrusted (unknown); each step only
 * reshapes what it understands and leaves validation to the zod parse that follows.
 */
type Migration = (data: unknown) => unknown;

const isRecord = (v: unknown): v is Record<string, unknown> => typeof v === 'object' && v !== null && !Array.isArray(v);

export const MIGRATIONS: Record<number, Migration> = {
  /** v1 → v2: Homework gained `kind` ('homework' | 'practice'); every v1 homework was a normal homework. */
  1: (data) => {
    if (!isRecord(data) || !Array.isArray(data.homework)) return data;
    return { ...data, homework: data.homework.map((h) => (isRecord(h) && !('kind' in h) ? { ...h, kind: 'homework' } : h)) };
  },
};

export function migrate(data: unknown, fromVersion: number, toVersion: number): unknown {
  let current = data;
  for (let v = fromVersion; v < toVersion; v += 1) {
    const step = MIGRATIONS[v];
    if (!step) throw new Error(`No migration from schema v${v}`);
    current = step(current);
  }
  return current;
}
