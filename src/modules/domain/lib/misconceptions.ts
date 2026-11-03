import type { Question, QuestionId, Submission } from '../entities';
import { finalVerdicts } from './evidence';

export const MIN_SAME_DISTRACTOR = 2;

export type MisconceptionEvidence = { questionId: QuestionId; optionId: string; count: number; of: number };

/** A labelled wrong option picked by ≥ 2 children (and still wrong after teacher review), with "count of answered". */
export function detectMisconceptions(questions: readonly Question[], submissions: readonly Submission[]): MisconceptionEvidence[] {
  const found: MisconceptionEvidence[] = [];
  for (const q of questions) {
    if (q.type !== 'mcq') continue;
    const labelled = new Set(q.options.filter((o) => o.misconception).map((o) => o.id));
    if (labelled.size === 0) continue;
    const picks = new Map<string, number>();
    let answered = 0;
    for (const sub of submissions) {
      if (sub.status !== 'submitted') continue;
      const verdict = finalVerdicts(sub).get(q.id);
      if (verdict !== 'correct' && verdict !== 'incorrect') continue;
      answered += 1;
      const answer = sub.answers[q.id];
      if (verdict === 'incorrect' && answer?.type === 'mcq' && labelled.has(answer.optionId)) {
        picks.set(answer.optionId, (picks.get(answer.optionId) ?? 0) + 1);
      }
    }
    for (const [optionId, count] of picks) {
      if (count >= MIN_SAME_DISTRACTOR) found.push({ questionId: q.id, optionId, count, of: answered });
    }
  }
  return found.sort((a, b) => b.count * a.of - a.count * b.of || b.count - a.count);
}

/** The question with the lowest correct rate (ties: earlier question). */
export function mostMissedQuestion(questions: readonly Question[], submissions: readonly Submission[]): { questionId: QuestionId; wrong: number; attempted: number } | null {
  let best: { questionId: QuestionId; wrong: number; attempted: number } | null = null;
  for (const q of questions) {
    let attempted = 0;
    let wrong = 0;
    for (const sub of submissions) {
      if (sub.status !== 'submitted') continue;
      const verdict = finalVerdicts(sub).get(q.id);
      if (verdict === 'correct' || verdict === 'incorrect') {
        attempted += 1;
        if (verdict === 'incorrect') wrong += 1;
      }
    }
    if (attempted === 0) continue;
    // wrong/attempted > best.wrong/best.attempted, by cross-multiplication
    if (!best || wrong * best.attempted > best.wrong * attempted) best = { questionId: q.id, wrong, attempted };
  }
  return best;
}
