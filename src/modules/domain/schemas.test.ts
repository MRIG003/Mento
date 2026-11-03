import { describe, expect, it } from 'vitest';
import { AnswerSchema, BilingualSchema, ClassSchema, HomeworkSchema, QuestionSchema, StudentSchema, SubmissionSchema } from './schemas';

const mcq = {
  id: 'q_1', conceptId: 'c_compare', type: 'mcq', difficulty: 1, source: 'bank',
  prompt: { en: 'Which is bigger: 3/5 or 2/5?', hi: 'कौन बड़ा है: 3/5 या 2/5?' },
  options: [{ id: 'a', text: { en: '3/5' } }, { id: 'b', text: { en: '2/5' }, misconception: { en: 'Thinks a smaller numerator is bigger' } }],
  correctOptionId: 'a',
};

describe('BilingualSchema', () => {
  it('accepts English only, Hindi only, or both', () => {
    expect(BilingualSchema.safeParse({ en: 'Fractions' }).success).toBe(true);
    expect(BilingualSchema.safeParse({ hi: 'भिन्न' }).success).toBe(true);
  });
  it('rejects text in neither language', () => {
    expect(BilingualSchema.safeParse({}).success).toBe(false);
    expect(BilingualSchema.safeParse({ en: '   ' }).success).toBe(false);
  });
});

describe('QuestionSchema', () => {
  it('accepts a valid bilingual MCQ', () => expect(QuestionSchema.safeParse(mcq).success).toBe(true));
  it('rejects an MCQ whose correct option does not exist', () => {
    expect(QuestionSchema.safeParse({ ...mcq, correctOptionId: 'z' }).success).toBe(false);
  });
  it('rejects an MCQ with one option or more than five', () => {
    expect(QuestionSchema.safeParse({ ...mcq, options: [mcq.options[0]] }).success).toBe(false);
    const six = Array.from({ length: 6 }, (_, i) => ({ id: `o${i}`, text: { en: `${i}` } }));
    expect(QuestionSchema.safeParse({ ...mcq, options: six, correctOptionId: 'o0' }).success).toBe(false);
  });
  it('rejects prompts over 300 characters and unknown types', () => {
    expect(QuestionSchema.safeParse({ ...mcq, prompt: { en: 'x'.repeat(301) } }).success).toBe(false);
    expect(QuestionSchema.safeParse({ ...mcq, type: 'essay' }).success).toBe(false);
  });
  it('accepts fill, short and photo questions', () => {
    const base = { id: 'q_2', conceptId: 'c_1', difficulty: 2, source: 'teacher', prompt: { en: 'p' } };
    expect(QuestionSchema.safeParse({ ...base, type: 'fill', answer: '0.5', acceptedVariants: ['.5', '1/2'], numeric: true }).success).toBe(true);
    expect(QuestionSchema.safeParse({ ...base, type: 'short', keyPoints: [{ text: { en: 'denominator' }, variants: [] }], minKeyPoints: 1 }).success).toBe(true);
    expect(QuestionSchema.safeParse({ ...base, type: 'photo' }).success).toBe(true);
  });
});

describe('AnswerSchema', () => {
  it('caps typed answers at 500 characters', () => {
    expect(AnswerSchema.safeParse({ type: 'fill', text: '5' }).success).toBe(true);
    expect(AnswerSchema.safeParse({ type: 'short', text: 'x'.repeat(501) }).success).toBe(false);
  });
});

describe('ids and names from storage are untrusted', () => {
  it('rejects ids with unsafe characters', () => {
    expect(StudentSchema.safeParse({ id: '../etc', classId: 'cls_1', firstName: 'Anaya', status: 'active', createdAt: '2026-11-03T10:00:00.000Z' }).success).toBe(false);
  });
  it('rejects first names over 30 characters and empty names', () => {
    const s = { id: 'stu_1', classId: 'cls_1', status: 'active', createdAt: '2026-11-03T10:00:00.000Z' };
    expect(StudentSchema.safeParse({ ...s, firstName: 'अनाया' }).success).toBe(true);
    expect(StudentSchema.safeParse({ ...s, firstName: 'A'.repeat(31) }).success).toBe(false);
    expect(StudentSchema.safeParse({ ...s, firstName: ' ' }).success).toBe(false);
  });
  it('rejects classes outside grades 3-8 and bad dates', () => {
    const c = { id: 'cls_1', schoolId: 'sch_1', teacherId: 't_1', grade: 6, section: 'B', subjectId: 'maths', defaultLang: 'hi', joinToken: 'AAAAAAAAAAAAAAAAAAAAAA', createdAt: '2026-11-03T10:00:00.000Z' };
    expect(ClassSchema.safeParse(c).success).toBe(true);
    expect(ClassSchema.safeParse({ ...c, grade: 9 }).success).toBe(false);
    expect(ClassSchema.safeParse({ ...c, createdAt: 'yesterday' }).success).toBe(false);
    expect(ClassSchema.safeParse({ ...c, joinToken: 'short' }).success).toBe(false);
  });
});

describe('HomeworkSchema and SubmissionSchema', () => {
  const hw = {
    id: 'hw_1', classId: 'cls_1', subjectId: 'maths', chapter: { en: 'Fractions' }, questionIds: ['q_1'], dueAt: '2026-11-04T14:30:00.000Z',
    defaultLang: 'en', status: 'published', token: 'BBBBBBBBBBBBBBBBBBBBBB', kind: 'homework', createdAt: '2026-11-03T10:00:00.000Z',
  };
  it('accepts a published homework and rejects one with no questions', () => {
    expect(HomeworkSchema.safeParse(hw).success).toBe(true);
    expect(HomeworkSchema.safeParse({ ...hw, questionIds: [] }).success).toBe(false);
  });
  it('accepts a submission with partial answers and teacher overrides', () => {
    const sub = {
      id: 'sub_1', homeworkId: 'hw_1', studentId: 'stu_1', source: 'link', status: 'submitted', late: false,
      submittedAt: '2026-11-04T12:00:00.000Z', answers: { q_1: { type: 'mcq', optionId: 'a' } },
      evaluations: [{ questionId: 'q_1', verdict: 'incorrect', by: 'teacher', overriddenFrom: 'correct' }],
    };
    expect(SubmissionSchema.safeParse(sub).success).toBe(true);
    expect(SubmissionSchema.safeParse({ ...sub, evaluations: [{ questionId: 'q_1', verdict: 'maybe', by: 'auto' }] }).success).toBe(false);
  });
});
