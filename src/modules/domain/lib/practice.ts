import type { ConceptId, Question, QuestionId } from '../entities';
import { err, ok, type RandomSource, type Result } from '../types';

export const PRACTICE_MIN = 3;
export const PRACTICE_MAX = 5;

/**
 * Practice "at their level" (SPEC assumption 6): same concept, difficulty 1-2, not seen in the source homework,
 * easiest first, shuffled within a level. 3-5 questions or UNAVAILABLE. The teacher approves before it goes out.
 */
export function selectPractice(bank: readonly Question[], conceptId: ConceptId, seen: ReadonlySet<string>, rng: RandomSource): Result<QuestionId[]> {
  const byLevel = [1, 2].map((level) => shuffle(bank.filter((q) => q.conceptId === conceptId && q.difficulty === level && !seen.has(q.id)), rng));
  const picked = byLevel.flat().slice(0, PRACTICE_MAX).map((q) => q.id);
  if (picked.length < PRACTICE_MIN) return err('UNAVAILABLE', 'practice.notEnoughQuestions');
  return ok(picked);
}

/** Fisher–Yates with injected randomness (deterministic in tests and demo). */
function shuffle<T>(items: T[], rng: RandomSource): T[] {
  const out = [...items];
  const bytes = rng.bytes(out.length * 2);
  for (let i = out.length - 1; i > 0; i -= 1) {
    const r = ((bytes[2 * i] ?? 0) << 8) | (bytes[2 * i + 1] ?? 0);
    const j = r % (i + 1);
    const tmp = out[i] as T;
    out[i] = out[j] as T;
    out[j] = tmp;
  }
  return out;
}
