import { describe, expect, it } from 'vitest';
import { CURRENT_SCHEMA_VERSION, DB_KEY } from './collections';
import { createDatabase, emptyCollections } from './database';
import { createMemoryDrivers } from './memory-driver';

const clock = { now: () => new Date('2026-11-03T10:00:00.000Z') };

const v1Fixture = {
  schemaVersion: 1,
  data: {
    ...emptyCollections(),
    homework: [{
      id: 'hw_old', classId: 'cls_1', subjectId: 'maths', chapter: { en: 'Fractions' }, questionIds: ['q_1'],
      dueAt: '2026-10-01T14:30:00.000Z', defaultLang: 'en', status: 'published', token: 'AAAAAAAAAAAAAAAAAAAAAA', createdAt: '2026-09-30T10:00:00.000Z',
    }],
  },
};

describe('createDatabase: reading untrusted storage', () => {
  it('reports an empty device as null (caller seeds the demo)', () => {
    const [driver] = createMemoryDrivers(1);
    expect(createDatabase({ driver: driver!, clock }).read()).toEqual({ ok: true, value: null });
  });

  it('migrates a v1 store to the current version and keeps the data', () => {
    const [driver] = createMemoryDrivers(1);
    driver!.write(DB_KEY, JSON.stringify(v1Fixture));
    const result = createDatabase({ driver: driver!, clock }).read();
    expect(result.ok).toBe(true);
    if (!result.ok || !result.value) throw new Error('expected data');
    expect(result.value.homework[0]?.kind).toBe('homework');
    expect(CURRENT_SCHEMA_VERSION).toBe(2);
  });

  it.each([
    ['broken JSON', '{"schemaVersion":2,'],
    ['a version from the future', JSON.stringify({ schemaVersion: 99, data: {} })],
    ['the wrong shape', JSON.stringify({ schemaVersion: 2, data: { students: 'everyone' } })],
    ['not an envelope at all', '42'],
  ])('quarantines %s without deleting it', (_name, raw) => {
    const [driver] = createMemoryDrivers(1);
    driver!.write(DB_KEY, raw);
    const result = createDatabase({ driver: driver!, clock }).read();
    expect(result).toMatchObject({ ok: false, error: { code: 'STORAGE', messageKey: 'error.storage.corrupt' } });
    expect(driver!.read(DB_KEY)).toBe(raw);
    expect(driver!.read(`${DB_KEY}:corrupt:2026-11-03T10:00:00.000Z`)).toBe(raw);
  });

  it('keeps markup-looking text as plain data (escaping happens when React renders it)', () => {
    const [driver] = createMemoryDrivers(1);
    const db = createDatabase({ driver: driver!, clock });
    db.update((d) => ({ ...d, subjects: [{ id: 'maths', name: { en: '<img src=x onerror=alert(1)>' } }] } as never));
    const read = db.read();
    expect(read.ok && read.value?.subjects[0]?.name.en).toBe('<img src=x onerror=alert(1)>');
  });
});

describe('createDatabase: writing', () => {
  it('writes the current version and reads back what it wrote', () => {
    const [driver] = createMemoryDrivers(1);
    const db = createDatabase({ driver: driver!, clock });
    const written = db.update((d) => ({ ...d, meta: { ...d.meta, demo: true } }));
    expect(written.ok).toBe(true);
    expect(JSON.parse(driver!.read(DB_KEY) ?? '{}').schemaVersion).toBe(2);
    expect(db.read()).toMatchObject({ ok: true, value: { meta: { demo: true } } });
  });

  it('refuses to write data that fails validation, leaving storage untouched', () => {
    const [driver] = createMemoryDrivers(1);
    const db = createDatabase({ driver: driver!, clock });
    const result = db.update((d) => ({ ...d, students: [{ id: 'bad id!' }] } as never));
    expect(result).toMatchObject({ ok: false, error: { code: 'VALIDATION' } });
    expect(driver!.read(DB_KEY)).toBeNull();
  });

  it('turns a full or blocked storage into a STORAGE error instead of crashing', () => {
    const [driver] = createMemoryDrivers(1, { quotaBytes: 50 });
    const result = createDatabase({ driver: driver!, clock }).update((d) => d);
    expect(result).toMatchObject({ ok: false, error: { code: 'STORAGE', messageKey: 'error.storage.full' } });
  });

  it('tells its own listeners about its own writes', () => {
    const [driver] = createMemoryDrivers(1);
    const db = createDatabase({ driver: driver!, clock });
    let notified = 0;
    const off = db.subscribe(() => { notified += 1; });
    db.update((d) => d);
    off();
    db.update((d) => d);
    expect(notified).toBe(1);
  });

  it('tells another tab when this tab writes (teacher tab sees a student tab submit)', () => {
    const [studentTab, teacherTab] = createMemoryDrivers(2);
    const teacherDb = createDatabase({ driver: teacherTab!, clock });
    let notified = 0;
    teacherDb.subscribe(() => { notified += 1; });
    createDatabase({ driver: studentTab!, clock }).update((d) => ({ ...d, meta: { ...d.meta, demo: true } }));
    expect(notified).toBe(1);
    expect(teacherDb.read()).toMatchObject({ ok: true, value: { meta: { demo: true } } });
  });
});
