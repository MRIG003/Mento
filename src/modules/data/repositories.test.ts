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
