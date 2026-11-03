import type { ConceptId, Question, QuestionId, StudentId, Submission, Verdict } from '../entities';
import type { Counts } from './gap-rules';

/**
 * The verdict that counts for each question: the teacher's latest decision, else the auto-check.
 * A simulated reader suggestion is never final on its own (it reads as `unsure`).
 */
export function finalVerdicts(submission: Submission): Map<QuestionId, Verdict> {
  const auto = new Map<QuestionId, Verdict>();
  const teacher = new Map<QuestionId, Verdict>();
  for (const e of submission.evaluations) {
    if (e.by === 'teacher') teacher.set(e.questionId, e.verdict);
    else if (e.by === 'auto') auto.set(e.questionId, e.verdict);
    else if (!auto.has(e.questionId)) auto.set(e.questionId, 'unsure');
  }
  return new Map([...auto, ...teacher]);
}

const isAttempt = (v: Verdict): v is 'correct' | 'incorrect' => v === 'correct' || v === 'incorrect';

/** Per student, per concept: attempts (right or wrong after overrides) and right answers. Drafts don't count. */
export function studentEvidence(submissions: readonly Submission[], questions: ReadonlyMap<string, Question>): Map<StudentId, Map<ConceptId, Counts>> {
  const out = new Map<StudentId, Map<ConceptId, Counts>>();
  for (const sub of submissions) {
    if (sub.status !== 'submitted') continue;
    for (const [questionId, verdict] of finalVerdicts(sub)) {
      const question = questions.get(questionId);
      if (!question || !isAttempt(verdict)) continue;
      const perConcept = out.get(sub.studentId) ?? new Map<ConceptId, Counts>();
      const counts = perConcept.get(question.conceptId) ?? { attempted: 0, correct: 0 };
      perConcept.set(question.conceptId, { attempted: counts.attempted + 1, correct: counts.correct + (verdict === 'correct' ? 1 : 0) });
      out.set(sub.studentId, perConcept);
    }
  }
  return out;
}

/** Per concept, across the whole class. */
export function classEvidence(submissions: readonly Submission[], questions: ReadonlyMap<string, Question>): Map<ConceptId, Counts> {
  const out = new Map<ConceptId, Counts>();
  for (const perConcept of studentEvidence(submissions, questions).values()) {
    for (const [conceptId, c] of perConcept) {
      const sum = out.get(conceptId) ?? { attempted: 0, correct: 0 };
      out.set(conceptId, { attempted: sum.attempted + c.attempted, correct: sum.correct + c.correct });
    }
  }
  return out;
}
