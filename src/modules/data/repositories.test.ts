import { describe, expect, it } from 'vitest';
import { seededRandom, type ClassId, type QuestionId } from '@/modules/domain';
import { createLocalRepositories, DEMO_SCHOOL_CODE, DEMO_TEACHER_ID } from './repositories';
import { createMemoryDrivers } from './storage/memory-driver';

const clock = { now: () => new Date('2026-11-03T15:00:00.000Z') };
const make = () => createLocalRepositories({ driver: createMemoryDrivers(1)[0]!, blobs: null, clock, rng: seededRandom(11) });

describe('session', () => {
  it('signs up a new teacher without storing a phone number', async () => {
    const repos = make();
    const t = await repos.session.startTeacher({ name: 'Asha', schoolName: 'Sunrise School' });
    if (!t.ok) throw new Error(t.error.code);
    const s = await repos.session.get();
    expect(s.ok && s.value).toMatchObject({ role: 'teacher', teacherId: t.value.id });
    expect(JSON.stringify(repos.database.read())).not.toMatch(/phone":\s*"\d/);
  });

  it('a new teacher gets the question bank too, so a Class 7 Science class has questions to pick from', async () => {
    const repos = make();
    const t = await repos.session.startTeacher({ name: 'Asha', schoolName: 'Sunrise School' });
    if (!t.ok) throw new Error(t.error.code);
    const scope = repos.teacher(t.value.id);
    const c = await scope.createClass({ grade: 7, section: 'A', subjectId: 'science' as never, defaultLang: 'en' });
    if (!c.ok) throw new Error(c.error.code);
    const concepts = await scope.listConcepts('science' as never);
    const bank = await scope.listBank({ subjectId: 'science' as never, grade: 7 });
    expect(concepts.ok && concepts.value.filter((x) => x.grade === 7).length).toBeGreaterThanOrEqual(2);
    expect(bank.ok && bank.value.length).toBeGreaterThanOrEqual(12);
    const maths = await scope.listBank({ subjectId: 'maths' as never });
    expect(maths.ok && maths.value.length).toBeGreaterThan(0);
  });

  it('"Try with a demo class" seeds the demo school on first use', async () => {
    const repos = make();
    expect(await repos.demo.isSeeded()).toBe(false);
    expect(await repos.session.useDemoTeacher()).toEqual({ ok: true, value: DEMO_TEACHER_ID });
    expect(await repos.demo.isSeeded()).toBe(true);
    const classes = await repos.teacher(DEMO_TEACHER_ID).listClasses();
    expect(classes.ok && classes.value.map((c) => c.label)).toEqual(['6B']);
  });

  it('lets a principal in with the demo school code, and refuses unknown codes', async () => {
    const repos = make();
    expect((await repos.session.startPrincipal(DEMO_SCHOOL_CODE.toLowerCase())).ok).toBe(true);
    expect(await repos.session.startPrincipal('NOPE00')).toMatchObject({ ok: false, error: { messageKey: 'school.codeUnknown' } });
  });
});

describe('Reset demo', () => {
  it('reloads the demo but keeps the demo teacher signed in and forgets children’s name picks', async () => {
    const repos = make();
    await repos.session.useDemoTeacher();
    const classes = await repos.teacher(DEMO_TEACHER_ID).listClasses();
    if (!classes.ok) throw new Error();
    await repos.teacher(DEMO_TEACHER_ID).addStudents(classes.value[0]!.class.id, ['Extra']); // a change the reset must undo
    expect((await repos.demo.reset()).ok).toBe(true);
    const session = await repos.session.get();
    expect(session.ok && session.value).toMatchObject({ role: 'teacher', teacherId: DEMO_TEACHER_ID, claims: {} });
    const after = await repos.teacher(DEMO_TEACHER_ID).listStudents(classes.value[0]!.class.id);
    expect(after.ok && after.value.some((s) => s.firstName === 'Extra')).toBe(false);
  });
  it('signs out a real (non-demo) teacher whose account is not in the demo data', async () => {
    const repos = make();
    await repos.session.startTeacher({ name: 'Asha', schoolName: 'Sunrise' });
    await repos.demo.reset();
    const session = await repos.session.get();
    expect(session.ok && session.value.role).toBeUndefined();
  });
});

describe('wipeAll (delete all my data on this phone)', () => {
  it('removes classes, children and answers but leaves a usable empty database', async () => {
    const repos = make();
    await repos.session.useDemoTeacher();
    expect((await repos.wipeAll()).ok).toBe(true);
    const d = repos.database.read();
    expect(d.ok && d.value && [d.value.students.length, d.value.submissions.length, d.value.classes.length]).toEqual([0, 0, 0]);
    expect(await repos.demo.isSeeded()).toBe(false);
  });
});

describe('demo submission wave', () => {
  it('fills a new teacher’s first homework with labelled demo answers so an insight appears', async () => {
    const repos = make();
    await repos.session.useDemoTeacher();
    const teacher = repos.teacher(DEMO_TEACHER_ID);
    const cls = await teacher.createClass({ grade: 6, section: 'c', subjectId: 'maths' as never, defaultLang: 'hi' });
    if (!cls.ok) throw new Error();
    await teacher.addStudents(cls.value.id as ClassId, ['Asha', 'Bilal', 'Chitra', 'Deepak', 'Esha', 'Faiz', 'Gita', 'Hari']);
    const hw = await teacher.saveHomework({ classId: cls.value.id, chapter: { en: 'Fractions' }, questionIds: ['q_fc1', 'q_fc2', 'q_fe1', 'q_fe6'] as QuestionId[], dueAt: '2026-11-04T14:30:00.000Z', defaultLang: 'hi' });
    if (!hw.ok) throw new Error();
    await teacher.publishHomework(hw.value.id);
    const wave = await repos.demo.submissionWave(hw.value.id);
    expect(wave.ok && wave.value.submitted).toBe(7);
    const results = await teacher.getResults(hw.value.id);
    expect(results.ok && results.value.submittedCount).toBe(7);
    expect(results.ok && results.value.focus).not.toBeNull();
    expect(cls.value.section).toBe('C');
  });

  it('needs a roster first', async () => {
    const repos = make();
    await repos.session.useDemoTeacher();
    const teacher = repos.teacher(DEMO_TEACHER_ID);
    const cls = await teacher.createClass({ grade: 6, section: 'D', subjectId: 'maths' as never, defaultLang: 'en' });
    if (!cls.ok) throw new Error();
    const hw = await teacher.saveHomework({ classId: cls.value.id, chapter: { en: 'F' }, questionIds: ['q_fc1'] as QuestionId[], dueAt: '2026-11-04T14:30:00.000Z', defaultLang: 'en' });
    if (!hw.ok) throw new Error();
    expect(await repos.demo.submissionWave(hw.value.id)).toMatchObject({ ok: false, error: { messageKey: 'demo.noRoster' } });
  });
});

describe('roster self-join', () => {
  it('shows first names for a valid join token only, and waits for the teacher for new names', async () => {
    const repos = make();
    await repos.session.useDemoTeacher();
    const classes = await repos.teacher(DEMO_TEACHER_ID).listClasses();
    if (!classes.ok) throw new Error();
    const token = classes.value[0]!.class.joinToken;
    const join = repos.join(token);
    const seen = await join.resolve();
    expect(seen.ok && seen.value.names).toHaveLength(40);
    expect(seen.ok && Object.keys(seen.value.names[0]!)).toEqual(['id', 'firstName']);
    expect(await repos.join('AAAAAAAAAAAAAAAAAAAAAA').resolve()).toMatchObject({ ok: false, error: { code: 'NOT_FOUND' } });
    expect(await repos.join('<script>').resolve()).toMatchObject({ ok: false });

    await join.addMyName('  Neha  ');
    await join.addMyName('neha');
    const after = await repos.teacher(DEMO_TEACHER_ID).listStudents(classes.value[0]!.class.id);
    const neha = after.ok ? after.value.filter((s) => s.firstName === 'Neha') : [];
    expect(neha).toHaveLength(1);
    expect(neha[0]?.status).toBe('pending');
    const stillHidden = await join.resolve();
    expect(stillHidden.ok && stillHidden.value.names.some((n) => n.firstName === 'Neha')).toBe(false);
  });
});
