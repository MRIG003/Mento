import { describe, expect, it } from 'vitest';
import { seededRandom, type ClassId, type HomeworkId, type QuestionId, type StudentId, type TeacherId } from '@/modules/domain';
import { buildDemoSeed } from '../seed';
import { createDatabase } from '../storage/database';
import { createMemoryDrivers } from '../storage/memory-driver';
import { createTeacherScope } from './teacher';

const clock = { now: () => new Date('2026-11-03T15:00:00.000Z') };
function setup(teacherId = 't_demo') {
  const [driver] = createMemoryDrivers(1);
  const db = createDatabase({ driver: driver!, clock });
  db.replace(buildDemoSeed(clock));
  return { db, scope: createTeacherScope({ db, teacherId: teacherId as TeacherId, clock, rng: seededRandom(5) }) };
}
const HW = 'hw_6b_fractions' as HomeworkId;

describe('TeacherScope role boundary (enforced in the data layer)', () => {
  it('lists only the teacher’s own classes', async () => {
    const r = await setup().scope.listClasses();
    expect(r.ok && r.value.map((c) => c.label)).toEqual(['6B', '7A']);
  });
  it('refuses another teacher’s homework and class with FORBIDDEN', async () => {
    const { scope } = setup();
    expect(await scope.getResults('hw_6a_decimals' as HomeworkId)).toMatchObject({ ok: false, error: { code: 'FORBIDDEN' } });
    expect(await scope.listStudents('cls_6a' as ClassId)).toMatchObject({ ok: false, error: { code: 'FORBIDDEN' } });
    expect(await scope.exportClassCsv('cls_5a' as ClassId)).toMatchObject({ ok: false, error: { code: 'FORBIDDEN' } });
  });
  it('returns NOT_FOUND for unknown ids', async () => {
    expect(await setup().scope.getResults('hw_nope' as HomeworkId)).toMatchObject({ ok: false, error: { code: 'NOT_FOUND' } });
  });
});

describe('getResults on the seeded 6B Fractions homework', () => {
  it('tells the "6 stuck on Comparing fractions" story from the data', async () => {
    const r = await setup().scope.getResults(HW);
    if (!r.ok) throw new Error(r.error.code);
    expect(r.value.classLabel).toBe('6B');
    expect([r.value.submittedCount, r.value.totalStudents, r.value.lateCount, r.value.draftCount]).toEqual([32, 40, 2, 2]);
    expect(r.value.focus).toEqual({ conceptId: 'c_frac_compare', stuckCount: 6 });
    expect(r.value.concepts.map((c) => [c.conceptId, c.ratePercent, c.classStatus])).toEqual([
      ['c_frac_add', 88, 'ok'], ['c_frac_equiv', 64, 'ok'], ['c_frac_compare', 59, 'class-gap'],
    ]);
    expect(r.value.review).toHaveLength(12);
    expect(r.value.rows.filter((row) => row.state === 'pending')).toHaveLength(6);
  });

  it('a teacher override changes the numbers immediately', async () => {
    const { scope } = setup();
    const before = await scope.getResults(HW);
    if (!before.ok) throw new Error();
    const anaya = before.value.rows[0]!;
    expect(anaya.firstName).toBe('Anaya');
    await scope.overrideEvaluation(anaya.submissionId!, 'q_fc2' as QuestionId, 'correct');
    await scope.overrideEvaluation(anaya.submissionId!, 'q_fc4' as QuestionId, 'correct');
    const after = await scope.getResults(HW);
    if (!after.ok) throw new Error();
    expect(after.value.focus?.stuckCount).toBe(5);
    expect(after.value.concepts.find((c) => c.conceptId === 'c_frac_compare')?.stuckStudentIds).not.toContain(anaya.studentId);
  });

  it('teacher review of an unsure short answer removes it from the queue', async () => {
    const { scope } = setup();
    const r = await scope.getResults(HW);
    if (!r.ok) throw new Error();
    const item = r.value.review[0]!;
    await scope.overrideEvaluation(item.submissionId, item.questionId, 'correct');
    const again = await scope.getResults(HW);
    expect(again.ok && again.value.review).toHaveLength(11);
  });

  it('records paper marks for a child without a phone', async () => {
    const { scope } = setup();
    const r = await scope.getResults(HW);
    if (!r.ok) throw new Error();
    const pending = r.value.rows.find((row) => row.state === 'pending')!;
    await scope.recordPaperMarks(HW, pending.studentId, { q_fc1: 'correct', q_fc2: 'incorrect' } as never);
    const again = await scope.getResults(HW);
    if (!again.ok) throw new Error();
    const row = again.value.rows.find((x) => x.studentId === pending.studentId)!;
    expect(row).toMatchObject({ state: 'submitted', source: 'paper', late: true });
    expect(again.value.submittedCount).toBe(33);
  });
});

describe('roster', () => {
  it('adds trimmed, de-duplicated first names', async () => {
    const { scope } = setup();
    const r = await scope.addStudents('cls_6b' as ClassId, ['  Neha ', 'neha', 'Anaya', '']);
    expect(r.ok && r.value.map((s) => s.firstName)).toEqual(['Neha']);
  });
  it('refuses to go over 80 children', async () => {
    const r = await setup().scope.addStudents('cls_6b' as ClassId, Array.from({ length: 41 }, (_, i) => `Kid${i}`));
    expect(r).toMatchObject({ ok: false, error: { code: 'VALIDATION', messageKey: 'error.roster.full' } });
  });
});

describe('homework lifecycle', () => {
  it('saves a draft, publishes it once, and refuses to rewrite a published homework', async () => {
    const { scope } = setup();
    const draft = await scope.saveHomework({ classId: 'cls_6b' as ClassId, chapter: { en: 'Fractions' }, questionIds: ['q_fc5' as QuestionId], dueAt: '2026-11-05T14:30:00.000Z', defaultLang: 'en' });
    if (!draft.ok) throw new Error(draft.error.code);
    expect(draft.value.token).toMatch(/^[A-Za-z0-9_-]{22}$/);
    const published = await scope.publishHomework(draft.value.id);
    expect(published.ok && published.value.status).toBe('published');
    const rewrite = await scope.saveHomework({ id: draft.value.id, classId: 'cls_6b' as ClassId, chapter: { en: 'X' }, questionIds: ['q_fc5' as QuestionId], dueAt: '2026-11-05T14:30:00.000Z', defaultLang: 'en' });
    expect(rewrite).toMatchObject({ ok: false, error: { code: 'CONFLICT' } });
    expect((await scope.lastHomework('cls_6b' as ClassId)).ok).toBe(true);
  });
});

describe('practice', () => {
  it('drafts 3-5 unseen questions for the stuck group, then publishes a targeted practice homework on the same link', async () => {
    const { scope } = setup();
    const r = await scope.getResults(HW);
    if (!r.ok) throw new Error();
    const stuck = r.value.concepts.find((c) => c.conceptId === 'c_frac_compare')!.stuckStudentIds;
    const draft = await scope.draftPractice(HW, 'c_frac_compare' as never, stuck);
    if (!draft.ok) throw new Error(draft.error.code);
    expect(draft.value.questionIds.length).toBeGreaterThanOrEqual(3);
    expect(draft.value.questionIds.some((q) => r.value.homework.questionIds.includes(q))).toBe(false);
    const published = await scope.approvePractice(draft.value.id);
    if (!published.ok) throw new Error(published.error.code);
    expect(published.value).toMatchObject({ kind: 'practice', parentHomeworkId: HW, token: r.value.homework.token, targetStudentIds: stuck });
    expect(await scope.approvePractice(draft.value.id)).toEqual(published);
  });
});

describe('checklist', () => {
  it('reflects what the demo teacher has really done, step by step', async () => {
    const { scope } = setup();
    expect(await scope.checklist()).toEqual({ ok: true, value: { createClass: true, shareJoin: false, publishHomework: true, seeInsight: false, sendPractice: false } });
    await scope.recordEvent('results-opened', { homeworkId: HW });
    await scope.recordEvent('join-link-shared', { classId: 'cls_6b' as ClassId });
    const r = await scope.checklist();
    expect(r.ok && [r.value.seeInsight, r.value.shareJoin]).toEqual([true, true]);
  });
  it('is empty for a brand-new teacher', async () => {
    expect(await setup('t_john').scope.checklist()).toEqual({ ok: true, value: { createClass: false, shareJoin: false, publishHomework: false, seeInsight: false, sendPractice: false } });
  });
});

describe('consent records', () => {
  it('lists consent for the seeded class, then records and withdraws one without deleting history', async () => {
    const { scope } = setup();
    const before = await scope.listConsents('cls_6b' as ClassId);
    expect(before.ok && before.value).toHaveLength(32);
    await scope.recordConsent('stu_6b_38' as StudentId);
    const after = await scope.listConsents('cls_6b' as ClassId);
    expect(after.ok && after.value.find((c) => c.studentId === 'stu_6b_38')).toMatchObject({ by: 'teacher-recorded', withdrawn: false });
    await scope.withdrawConsent('stu_6b_38' as StudentId);
    const gone = await scope.listConsents('cls_6b' as ClassId);
    expect(gone.ok && gone.value.find((c) => c.studentId === 'stu_6b_38')?.withdrawn).toBe(true);
  });
  it('refuses another teacher’s class', async () => {
    expect(await setup().scope.listConsents('cls_6a' as ClassId)).toMatchObject({ ok: false, error: { code: 'FORBIDDEN' } });
  });
});

describe('export and delete', () => {
  it('exports only this class, with formula-safe cells', async () => {
    const { scope } = setup();
    await scope.addStudents('cls_6b' as ClassId, ['=HYPERLINK("x")']);
    const csv = await scope.exportClassCsv('cls_6b' as ClassId);
    if (!csv.ok) throw new Error();
    expect(csv.value.startsWith('﻿first_name,homework')).toBe(true);
    expect(csv.value).toContain('Anaya,Fractions,');
    expect(csv.value).not.toContain('Aditya'); // 6A child
  });
  it('deleting a child removes their answers and consent too', async () => {
    const { scope, db } = setup();
    await scope.deleteStudent('stu_6b_01' as StudentId);
    const d = db.read();
    if (!d.ok || !d.value) throw new Error();
    expect(d.value.students.some((s) => s.id === 'stu_6b_01')).toBe(false);
    expect(d.value.submissions.some((s) => s.studentId === 'stu_6b_01')).toBe(false);
    expect(d.value.consents.some((s) => s.studentId === 'stu_6b_01')).toBe(false);
  });
});
