import { describe, expect, it } from 'vitest';
import { seededRandom, type HomeworkId, type SchoolId, type TeacherId } from '@/modules/domain';
import { buildDemoSeed } from '../seed';
import { createDatabase } from '../storage/database';
import { createMemoryDrivers } from '../storage/memory-driver';
import { createPrincipalScope } from './principal';
import { createTeacherScope } from './teacher';

const clock = { now: () => new Date('2026-11-03T15:00:00.000Z') };
function setup() {
  const [driver] = createMemoryDrivers(1);
  const db = createDatabase({ driver: driver!, clock });
  db.replace(buildDemoSeed(clock));
  return { db, principal: createPrincipalScope({ db, schoolId: 'sch_demo' as SchoolId, clock }) };
}

describe('PrincipalScope', () => {
  it('returns aggregates only: no child or teacher identifiers or names anywhere (threat model I2)', async () => {
    const r = await setup().principal.overview('this-term');
    if (!r.ok) throw new Error();
    const json = JSON.stringify(r.value);
    for (const banned of ['stu_', 't_demo', 't_ravi', 'Anaya', 'Meera', 'Ravi', 'studentId', 'teacherId']) expect(json).not.toContain(banned);
    const allowed = new Set(['activeTeachers', 'homeworkSet', 'submissionRate', 'gapCells', 'classLabel', 'subjectId', 'ratePercent', 'status', 'weakestConceptId', 'practiceSent', 'practiceCompleted', 'parentReportsOpened', 'headline', 'conceptNames', 'subjectNames', 'schoolName', 'en', 'hi']);
    const keys = new Set<string>();
    const walk = (v: unknown, inNameMap = false) => {
      if (Array.isArray(v)) v.forEach((x) => walk(x));
      else if (v && typeof v === 'object') for (const [k, inner] of Object.entries(v)) { if (!inNameMap) keys.add(k); walk(inner, k === 'conceptNames' || k === 'subjectNames'); }
    };
    walk(r.value);
    expect([...keys].filter((k) => !allowed.has(k))).toEqual([]);
  });

  it('computes school numbers from the seed', async () => {
    const r = await setup().principal.overview('this-term');
    if (!r.ok) throw new Error();
    expect(r.value.homeworkSet).toBe(4);
    expect(r.value.submissionRate).toBe(84); // (32 + 30 + 30 + 24) of (40 + 36 + 32 + 30)
    expect(r.value.gapCells.map((c) => [c.classLabel, c.subjectId, c.status])).toEqual([['6B', 'maths', 'ok'], ['6A', 'maths', 'ok'], ['7A', 'science', 'ok'], ['5A', 'hindi', 'class-gap']]);
    expect(r.value.headline).toEqual({ classLabel: '5A', subjectId: 'hindi' });
    expect(r.value.conceptNames.c_frac_compare?.en).toBe('Comparing fractions');
  });

  it('is locked with 1 active teacher; opening results makes the demo teacher active; a school plan unlocks it', async () => {
    const { db, principal } = setup();
    expect(await principal.lockState()).toEqual({ ok: true, value: { unlocked: false, activeTeachers: 1, plan: 'free' } });
    await createTeacherScope({ db, teacherId: 't_demo' as TeacherId, clock, rng: seededRandom(1) }).recordEvent('results-opened', { homeworkId: 'hw_6b_fractions' as HomeworkId });
    expect(await principal.lockState()).toMatchObject({ ok: true, value: { activeTeachers: 2, unlocked: false } });
    db.update((d) => ({ ...d, schools: d.schools.map((s) => ({ ...s, plan: 'school' as const })) }));
    expect(await principal.lockState()).toMatchObject({ ok: true, value: { unlocked: true } });
  });

  it('knows nothing about other schools', async () => {
    const { db } = setup();
    expect(await createPrincipalScope({ db, schoolId: 'sch_other' as SchoolId, clock }).overview('this-week')).toMatchObject({ ok: false, error: { code: 'NOT_FOUND' } });
  });
});
