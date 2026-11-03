/** Test-only builders for domain tests (parsed through the real schemas so fixtures stay valid). */
import type { Question, Submission } from '../entities';
import { QuestionSchema, SubmissionSchema } from '../schemas';

export function mcq(id: string, conceptId: string, opts: { misconceptionOn?: string } = {}): Question {
  return QuestionSchema.parse({
    id, conceptId, type: 'mcq', difficulty: 1, source: 'bank', prompt: { en: `Question ${id}` },
    options: [
      { id: 'a', text: { en: 'right' } },
      { id: 'b', text: { en: 'wrong b' }, ...(opts.misconceptionOn === 'b' ? { misconception: { en: 'Thinks a bigger numerator always wins' } } : {}) },
      { id: 'c', text: { en: 'wrong c' } },
    ],
    correctOptionId: 'a',
  });
}

type Pick = { q: string; option?: string; verdict?: 'correct' | 'incorrect' | 'unsure'; override?: 'correct' | 'incorrect' };

/** A submitted submission where each pick is auto-checked (a = correct) and optionally overridden by the teacher. */
export function submission(studentId: string, picks: Pick[], opts: { homeworkId?: string; status?: 'draft' | 'submitted' } = {}): Submission {
  const answers: Record<string, unknown> = {};
  const evaluations: unknown[] = [];
  for (const p of picks) {
    if (p.option) answers[p.q] = { type: 'mcq', optionId: p.option };
    const auto = p.verdict ?? (p.option === 'a' ? 'correct' : 'incorrect');
    evaluations.push({ questionId: p.q, verdict: auto, by: 'auto' });
    if (p.override) evaluations.push({ questionId: p.q, verdict: p.override, by: 'teacher', overriddenFrom: auto });
  }
  return SubmissionSchema.parse({
    id: `sub_${studentId}_${opts.homeworkId ?? 'hw_1'}`, homeworkId: opts.homeworkId ?? 'hw_1', studentId, source: 'link',
    status: opts.status ?? 'submitted', late: false, answers, evaluations,
    ...(opts.status === 'draft' ? {} : { submittedAt: '2026-11-04T12:00:00.000Z' }),
  });
}

/** n right answers then m wrong answers on one concept, using questions q1..q(n+m). */
export function scored(studentId: string, right: number, wrong: number): Submission {
  const picks: Pick[] = [];
  for (let i = 0; i < right + wrong; i += 1) picks.push({ q: `q${i + 1}`, option: i < right ? 'a' : 'b' });
  return submission(studentId, picks);
}
