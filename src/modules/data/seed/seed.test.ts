import { describe, expect, it } from 'vitest';
import { classConceptStatus, classEvidence, detectMisconceptions, ratePercent, studentConceptStatus, studentEvidence, type Question } from '@/modules/domain';
import { CollectionsSchema } from '../storage/collections';
import { buildDemoSeed } from './index';

const clock = { now: () => new Date('2026-11-03T15:00:00.000Z') };
const db = buildDemoSeed(clock);
const questions = new Map<string, Question>(db.questions.map((q) => [q.id, q]));

describe('demo seed', () => {
  it('is valid against the stored schema', () => {
    const parsed = CollectionsSchema.safeParse(db);
    expect(parsed.success, JSON.stringify(parsed.error?.issues.slice(0, 3))).toBe(true);
  });

  it('has one school, three classes and 40 + 36 + 30 children, first names only', () => {
    expect(db.schools).toHaveLength(1);
    expect(db.classes.map((c) => c.id)).toEqual(['cls_6b', 'cls_6a', 'cls_5a']);
    expect(db.students.filter((s) => s.classId === 'cls_6b')).toHaveLength(40);
    expect(db.students.every((s) => !s.firstName.includes(' '))).toBe(true);
  });

  it('has a bilingual bank with at least 6 questions per concept', () => {
    for (const concept of db.concepts) {
      expect(db.questions.filter((q) => q.conceptId === concept.id).length, concept.id).toBeGreaterThanOrEqual(6);
    }
    expect(db.questions.every((q) => q.prompt.en && q.prompt.hi)).toBe(true);
  });

  describe('6B Fractions: the headline is computed by the real rules, not written down', () => {
    const subs = db.submissions.filter((s) => s.homeworkId === 'hw_6b_fractions');
    const submitted = subs.filter((s) => s.status === 'submitted');
    const perStudent = studentEvidence(submitted, questions);
    const stuckOn = (conceptId: string) =>
      [...perStudent].filter(([, m]) => studentConceptStatus(m.get(conceptId as never) ?? { attempted: 0, correct: 0 }).kind === 'stuck').map(([id]) => id);
    const name = (id: string) => db.students.find((s) => s.id === id)?.firstName;

    it('32 of 40 submitted, 2 of them late, 2 more started a draft', () => {
      expect(submitted).toHaveLength(32);
      expect(submitted.filter((s) => s.late)).toHaveLength(2);
      expect(subs.filter((s) => s.status === 'draft')).toHaveLength(2);
    });

    it('exactly 6 children are stuck on Comparing fractions: Anaya, Dev, Sana, Rohan, Tara, Vihaan', () => {
      expect(stuckOn('c_frac_compare').map(name)).toEqual(['Anaya', 'Dev', 'Sana', 'Rohan', 'Tara', 'Vihaan']);
    });

    it('Comparing fractions is a class gap and the other two concepts are not', () => {
      const cls = classEvidence(submitted, questions);
      const status = (id: string) => classConceptStatus(cls.get(id as never) ?? { attempted: 0, correct: 0 }).kind;
      expect(status('c_frac_compare')).toBe('class-gap');
      expect(status('c_frac_equiv')).toBe('ok');
      expect(status('c_frac_add')).toBe('ok');
      const rates = ['c_frac_add', 'c_frac_equiv', 'c_frac_compare'].map((id) => ratePercent(cls.get(id as never)!));
      expect(rates[0]!).toBeGreaterThan(rates[1]!);
      expect(rates[1]!).toBeGreaterThan(rates[2]!);
    });

    it('fewer children are stuck on the other concepts, so the Evening Wrap points at comparing', () => {
      expect(stuckOn('c_frac_equiv').length).toBeLessThan(6);
      expect(stuckOn('c_frac_add').length).toBeLessThan(6);
    });

    it('the "bigger denominator" misconception shows up with evidence', () => {
      const hwQuestions = db.homework.find((h) => h.id === 'hw_6b_fractions')!.questionIds.map((id) => questions.get(id)!);
      const found = detectMisconceptions(hwQuestions, submitted);
      expect(found[0]).toMatchObject({ questionId: 'q_fc2', optionId: 'b' });
      expect(found[0]!.count).toBeGreaterThanOrEqual(2);
    });

    it('some short answers need the teacher (review queue is not empty)', () => {
      const unsure = submitted.flatMap((s) => s.evaluations.filter((e) => e.verdict === 'unsure'));
      expect(unsure.length).toBeGreaterThan(0);
    });
  });

  it('builds the same data for the same clock (stable demo)', () => {
    expect(buildDemoSeed(clock)).toEqual(db);
  });
});
