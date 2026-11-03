/**
 * Demo seed (Demo data). Loaded with a dynamic import only when a demo starts, so it never ships on first load.
 * Times are relative to the clock so the demo always looks current.
 */
import { generateToken, seededRandom, type Clock } from '@/modules/domain';
import { CollectionsSchema, type Collections } from '../storage/collections';
import { emptyCollections } from '../storage/database';
import { HINDI_5_BANK, HINDI_5_CONCEPTS } from './hindi-5';
import { MATHS_6_BANK, MATHS_6_CONCEPTS } from './bank-maths-6';
import { CLASSES, SCHOOL, SUBJECTS, TEACHERS } from './school';
import { HW_5A_QUESTIONS, HW_6A_QUESTIONS, HW_6B_QUESTIONS, answers6B, evaluate, parseBank, profiles6B, randomAnswers } from './submissions';

export const SEED_VERSION = 1;
const DAY = 24 * 60 * 60 * 1000;

/** 20:00 IST (14:30 UTC) on the day `daysAgo` before now. */
function istEvening(now: Date, daysAgo: number): Date {
  const d = new Date(now.getTime() - daysAgo * DAY);
  d.setUTCHours(14, 30, 0, 0);
  return d;
}

export function buildDemoSeed(clock: Clock): Collections {
  const now = clock.now();
  const iso = (d: Date) => d.toISOString();
  const rng = seededRandom(20261103); // demo tokens are deterministic on purpose; real teachers get crypto tokens
  const bank = parseBank([...MATHS_6_BANK, ...HINDI_5_BANK]);
  // Plain data first, validated by the real schema at the end (no type casts; the seed is checked like any input).
  const base = emptyCollections(iso(now));
  const db = {
    ...base,
    meta: { createdAt: iso(now), demo: true, seedVersion: SEED_VERSION },
    schools: [] as unknown[], teachers: [] as unknown[], subjects: [] as unknown[], concepts: [] as unknown[], questions: [] as unknown[],
    classes: [] as unknown[], students: [] as { id: string; classId: string; firstName: string; status: string; createdAt: string }[], homework: [] as unknown[], submissions: [] as unknown[],
    consents: [] as unknown[], events: [] as unknown[],
  };

  db.schools = [{ id: SCHOOL.id, name: SCHOOL.name, code: SCHOOL.code, plan: SCHOOL.plan }];
  db.teachers = TEACHERS.map((t) => ({ id: t.id, schoolId: SCHOOL.id, name: t.name, phoneVerified: true, createdAt: iso(new Date(now.getTime() - 60 * DAY)) }));
  db.subjects = SUBJECTS.map((s) => ({ ...s }));
  db.concepts = [
    ...MATHS_6_CONCEPTS.map((c) => ({ id: c.id, subjectId: 'maths', grade: 6, chapter: { en: c.chapter[0], hi: c.chapter[1] }, name: { en: c.name[0], hi: c.name[1] } })),
    ...HINDI_5_CONCEPTS.map((c) => ({ id: c.id, subjectId: 'hindi', grade: 5, chapter: { en: c.chapter[0], hi: c.chapter[1] }, name: { en: c.name[0], hi: c.name[1] } })),
  ];
  db.questions = [...bank.values()];

  for (const c of CLASSES) {
    db.classes.push({ id: c.id, schoolId: SCHOOL.id, teacherId: c.teacherId, grade: c.grade, section: c.section, subjectId: c.subjectId, defaultLang: c.defaultLang, joinToken: generateToken(rng), createdAt: iso(new Date(now.getTime() - 30 * DAY)) });
    c.names.forEach((firstName, i) => {
      db.students.push({ id: `stu_${c.id.slice(4)}_${String(i + 1).padStart(2, '0')}`, classId: c.id, firstName, status: 'active', createdAt: iso(new Date(now.getTime() - 30 * DAY)) });
    });
  }
  const roster = (classId: string) => db.students.filter((s) => s.classId === classId);

  const addHomework = (id: string, classId: string, subjectId: string, chapter: { en: string; hi: string }, questionIds: readonly string[], publishedDaysAgo: number, dueDaysAgo: number, lang: 'en' | 'hi') => {
    const publishedAt = new Date(now.getTime() - publishedDaysAgo * DAY);
    const due = istEvening(now, dueDaysAgo);
    db.homework.push({ id, classId, subjectId, chapter, questionIds: [...questionIds], dueAt: iso(due), defaultLang: lang, status: 'published', token: generateToken(rng), kind: 'homework', createdAt: iso(publishedAt), publishedAt: iso(publishedAt) });
    return { publishedAt, due };
  };

  // ── 6B Maths, Fractions: 32 of 40 submitted, 2 late, 2 drafts ──
  const hw6b = addHomework('hw_6b_fractions', 'cls_6b', 'maths', { en: 'Fractions', hi: 'भिन्न' }, HW_6B_QUESTIONS, 2, 1, 'en');
  const kids6b = roster('cls_6b');
  profiles6B().forEach((profile, i) => {
    const student = kids6b[i];
    if (!student) return;
    const late = i >= 30;
    const submittedAt = new Date(late ? hw6b.due.getTime() + (i - 29) * 45 * 60 * 1000 : hw6b.publishedAt.getTime() + (2 + i * 0.6) * 60 * 60 * 1000);
    const answers = answers6B(profile, i, bank);
    db.submissions.push({ id: `sub_6b_${i}`, homeworkId: 'hw_6b_fractions', studentId: student.id, source: 'link', answers, status: 'submitted', submittedAt: iso(submittedAt), late, evaluations: evaluate(bank, answers) });
    db.consents.push({ id: `con_6b_${i}`, studentId: student.id, grantedAt: iso(new Date(submittedAt.getTime() - 60_000)), grantedBy: 'parent-on-link', purpose: 'teaching' });
  });
  [32, 33].forEach((i) => {
    const student = kids6b[i];
    if (!student) return;
    const answers = { q_fa1: { type: 'mcq' as const, optionId: 'a' } };
    db.submissions.push({ id: `sub_6b_${i}`, homeworkId: 'hw_6b_fractions', studentId: student.id, source: 'link', answers, status: 'draft', late: false, evaluations: [] });
  });

  // ── 6A Maths, Decimals (Ravi): 30 of 36, results opened this week ──
  const hw6a = addHomework('hw_6a_decimals', 'cls_6a', 'maths', { en: 'Decimals', hi: 'दशमलव' }, HW_6A_QUESTIONS, 3, 2, 'hi');
  roster('cls_6a').slice(0, 30).forEach((student, i) => {
    const answers = randomAnswers(HW_6A_QUESTIONS, bank, 0.72, rng);
    db.submissions.push({ id: `sub_6a_${i}`, homeworkId: 'hw_6a_decimals', studentId: student.id, source: 'link', answers, status: 'submitted', submittedAt: iso(new Date(hw6a.publishedAt.getTime() + (1 + i * 0.5) * 3_600_000)), late: false, evaluations: evaluate(bank, answers) });
  });
  db.events.push({ kind: 'results-opened', at: iso(new Date(hw6a.due.getTime() + 3 * 3_600_000)), teacherId: 't_ravi', homeworkId: 'hw_6a_decimals' });

  // ── 5A Hindi, Grammar (Farah): 24 of 30, results not opened yet ──
  const hw5a = addHomework('hw_5a_grammar', 'cls_5a', 'hindi', { en: 'Grammar', hi: 'व्याकरण' }, HW_5A_QUESTIONS, 4, 3, 'hi');
  roster('cls_5a').slice(0, 24).forEach((student, i) => {
    const answers = randomAnswers(HW_5A_QUESTIONS, bank, 0.5, rng);
    db.submissions.push({ id: `sub_5a_${i}`, homeworkId: 'hw_5a_grammar', studentId: student.id, source: 'link', answers, status: 'submitted', submittedAt: iso(new Date(hw5a.publishedAt.getTime() + (1 + i * 0.5) * 3_600_000)), late: false, evaluations: evaluate(bank, answers) });
  });

  return CollectionsSchema.parse(db);
}
