import type { Question, QuestionId } from '@/modules/domain';

/**
 * Suggested questions for a chapter (SPEC-homework): easiest first, round-robin across concepts so each concept tends
 * to get the ≥ 2 attempts the gap rules need. Difficulty 3 is never suggested (teachers can still add it).
 */
export function suggestQuestions(bank: readonly Question[], conceptIds: readonly string[], count = 5): QuestionId[] {
  const queues = conceptIds.map((c) => bank.filter((q) => q.conceptId === c && q.difficulty <= 2).sort((a, b) => a.difficulty - b.difficulty));
  const picked: QuestionId[] = [];
  let progressed = true;
  while (picked.length < count && progressed) {
    progressed = false;
    for (const queue of queues) {
      const next = queue.shift();
      if (next && picked.length < count) { picked.push(next.id); progressed = true; }
    }
  }
  return picked;
}

/** Tomorrow on this device, at the last homework's time of day or 20:00. */
export function defaultDue(now: Date, lastDueAt?: string): Date {
  const due = new Date(now);
  due.setDate(due.getDate() + 1);
  const last = lastDueAt ? new Date(lastDueAt) : null;
  due.setHours(last ? last.getHours() : 20, last ? last.getMinutes() : 0, 0, 0);
  return due;
}
