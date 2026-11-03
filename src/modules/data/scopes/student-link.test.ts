import { describe, expect, it } from 'vitest';
import { seededRandom, type HomeworkId, type QuestionId, type StudentId, type TeacherId } from '@/modules/domain';
import { buildDemoSeed } from '../seed';
import { createDatabase } from '../storage/database';
import { createMemoryDrivers } from '../storage/memory-driver';
import { createStudentLinkScope } from './student-link';
import { createTeacherScope } from './teacher';

let now = new Date('2026-11-03T12:00:00.000Z');
const clock = { now: () => now };
function setup() {
  now = new Date('2026-11-03T12:00:00.000Z');
  const [driver] = createMemoryDrivers(1);
  const db = createDatabase({ driver: driver!, clock });
  const seed = buildDemoSeed({ now: () => new Date('2026-11-03T15:00:00.000Z') });
  // A fresh homework, due tomorrow, so the link is open.
  const hw = { ...seed.homework.find((h) => h.id === 'hw_6b_fractions')!, id: 'hw_open' as HomeworkId, token: 'OPENOPENOPENOPENOPEN12' as never, dueAt: '2026-11-04T14:30:00.000Z' };
  db.replace({ ...seed, homework: [...seed.homework, hw] });
  const link = createStudentLinkScope({ db, token: hw.token, clock, rng: seededRandom(3) });
  return { db, link, hw };
}
const ANAYA = 'stu_6b_01' as StudentId;

describe('StudentLinkScope: what a link holder can see', () => {
  it('rejects a malformed or unknown token with one generic message', async () => {
    const { db } = setup();
    for (const token of ['../../etc', '<script>', 'A'.repeat(22)]) {
      expect(await createStudentLinkScope({ db, token, clock, rng: seededRandom(1) }).resolve()).toMatchObject({ ok: false, error: { code: 'NOT_FOUND', messageKey: 'link.invalid' } });
    }
  });

  it('never sends answer keys, variants or misconception labels (threat model I1)', async () => {
    const { link } = setup();
    const r = await link.resolve();
    if (!r.ok) throw new Error();
    const json = JSON.stringify(r.value);
    expect(r.value.homework.questions).toHaveLength(8);
    for (const banned of ['correctOptionId', 'answer"', 'acceptedVariants', 'keyPoints', 'misconception', 'minKeyPoints']) expect(json).not.toContain(banned);
  });

  it('shows the class first names only, and nothing personal is needed to open it', async () => {
    const { link } = setup();
    const r = await link.rosterFirstNames();
    expect(r.ok && r.value).toHaveLength(40);
    expect(r.ok && Object.keys(r.value[0]!)).toEqual(['id', 'firstName']);
  });

  it('requires picking a name before any work, and only names from this class', async () => {
    const { link } = setup();
    expect(await link.ownWork('hw_open' as HomeworkId)).toMatchObject({ ok: false, error: { code: 'FORBIDDEN', messageKey: 'link.pickNameFirst' } });
    expect(await link.claim('stu_6a_01' as StudentId)).toMatchObject({ ok: false, error: { code: 'FORBIDDEN' } });
    expect((await link.claim(ANAYA)).ok).toBe(true);
    expect(await link.claimed()).toEqual({ ok: true, value: ANAYA });
  });
});

describe('StudentLinkScope: answering', () => {
  it('records consent once', async () => {
    const { link, db } = setup();
    await link.claim(ANAYA);
    const before = db.read();
    const count = (before.ok && before.value?.consents.filter((c) => c.studentId === ANAYA).length) || 0;
    await link.recordConsent();
    await link.recordConsent();
    const after = db.read();
    expect(after.ok && after.value?.consents.filter((c) => c.studentId === ANAYA).length).toBe(Math.max(count, 1));
    expect(await link.hasConsent()).toEqual({ ok: true, value: true });
  });

  it('saves every change as a draft that survives a reload, then submits and auto-checks', async () => {
    const { link, db } = setup();
    await link.claim(ANAYA);
    await link.saveDraft('hw_open' as HomeworkId, { q_fc1: { type: 'mcq', optionId: 'a' }, q_fa2: { type: 'fill', text: '५/७' } } as never);
    const reloaded = createStudentLinkScope({ db, token: 'OPENOPENOPENOPENOPEN12', clock, rng: seededRandom(9) });
    const work = await reloaded.ownWork('hw_open' as HomeworkId);
    expect(work.ok && work.value).toMatchObject({ status: 'draft', answers: { q_fc1: { optionId: 'a' } } });
    expect(await reloaded.submit('hw_open' as HomeworkId)).toEqual({ ok: true, value: { late: false } });
    const teacher = await createTeacherScope({ db, teacherId: 't_demo' as TeacherId, clock, rng: seededRandom(1) }).getResults('hw_open' as HomeworkId);
    const row = teacher.ok && teacher.value.rows.find((r) => r.studentId === ANAYA);
    expect(row && row.verdicts).toMatchObject({ q_fc1: 'correct', q_fa2: 'correct' });
  });

  it('ignores answers for questions that are not in the homework', async () => {
    const { link } = setup();
    await link.claim(ANAYA);
    await link.saveDraft('hw_open' as HomeworkId, { q_gp1: { type: 'fill', text: '16' } } as never);
    const work = await link.ownWork('hw_open' as HomeworkId);
    expect(work.ok && work.value.answers).toEqual({});
  });

  it('is on time exactly at the due instant and late one moment after', async () => {
    const { link } = setup();
    await link.claim(ANAYA);
    now = new Date('2026-11-04T14:30:00.000Z');
    expect(await link.submit('hw_open' as HomeworkId)).toEqual({ ok: true, value: { late: false } });
    const second = setup();
    await second.link.claim(ANAYA);
    now = new Date('2026-11-04T14:30:00.001Z');
    expect(await second.link.submit('hw_open' as HomeworkId)).toEqual({ ok: true, value: { late: true } });
  });

  it('lets answers change until the deadline, then closes', async () => {
    const { link } = setup();
    await link.claim(ANAYA);
    await link.submit('hw_open' as HomeworkId);
    expect((await link.saveDraft('hw_open' as HomeworkId, { q_fc1: { type: 'mcq', optionId: 'b' } } as never)).ok).toBe(true);
    now = new Date('2026-11-05T09:00:00.000Z');
    expect(await link.saveDraft('hw_open' as HomeworkId, { q_fc1: { type: 'mcq', optionId: 'a' } } as never)).toMatchObject({ ok: false, error: { code: 'CONFLICT', messageKey: 'link.closed' } });
  });
});

describe('StudentLinkScope: practice and progress', () => {
  it('shows practice only to the children it was made for, on the same link', async () => {
    const { db } = setup();
    const teacher = createTeacherScope({ db, teacherId: 't_demo' as TeacherId, clock, rng: seededRandom(2) });
    const results = await teacher.getResults('hw_6b_fractions' as HomeworkId);
    if (!results.ok) throw new Error();
    const stuck = results.value.concepts.find((c) => c.conceptId === 'c_frac_compare')!.stuckStudentIds;
    const draft = await teacher.draftPractice('hw_6b_fractions' as HomeworkId, 'c_frac_compare' as never, stuck);
    if (!draft.ok) throw new Error();
    await teacher.approvePractice(draft.value.id);
    const token = results.value.homework.token;
    const forAnaya = createStudentLinkScope({ db, token, clock, rng: seededRandom(1) });
    await forAnaya.claim(ANAYA);
    expect((await forAnaya.ownPractice()).ok && (await forAnaya.ownPractice() as { value: unknown[] }).value).toHaveLength(1);
    const forAarav = createStudentLinkScope({ db, token, clock, rng: seededRandom(1) });
    await forAarav.claim('stu_6b_07' as StudentId);
    expect(await forAarav.ownPractice()).toEqual({ ok: true, value: [] });
  });

  it('reports own progress as plain bands only', async () => {
    const { db } = setup();
    const link = createStudentLinkScope({ db, token: buildDemoSeed({ now: () => new Date('2026-11-03T15:00:00.000Z') }).homework[0]!.token, clock, rng: seededRandom(1) });
    await link.claim(ANAYA);
    const p = await link.ownProgress();
    if (!p.ok) throw new Error();
    expect(p.value.find((c) => c.conceptId === 'c_frac_compare')?.band).toBe('not-yet');
    expect(Object.keys(p.value[0]!).sort()).toEqual(['band', 'conceptId', 'name']);
  });
});

describe('QuestionId typing helper', () => {
  it('keeps ids as plain strings at runtime', () => expect(typeof ('q_fc1' as QuestionId)).toBe('string'));
});
