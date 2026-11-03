import type { Counts } from './gap-rules';

export type WrapInput = {
  now: string;
  dueAt: string;
  submitted: number;
  total: number;
  concepts: readonly { conceptId: string; stuckCount: number; counts: Counts }[];
  practiceSentFor: readonly string[];
};

export type EveningWrap =
  | { kind: 'waiting'; submitted: number; total: number }
  | { kind: 'focus'; conceptId: string; stuckCount: number; practiceSent: boolean }
  | { kind: 'all-clear' };

/** The 10-second Evening Wrap (creative brief §4): computed, never hand-written. */
export function buildEveningWrap(input: WrapInput): EveningWrap {
  const open = Date.parse(input.now) < Date.parse(input.dueAt);
  if (open && 4 * input.submitted < 3 * input.total) return { kind: 'waiting', submitted: input.submitted, total: input.total };

  let best: WrapInput['concepts'][number] | null = null;
  for (const c of input.concepts) {
    if (c.stuckCount === 0) continue;
    const lowerRate = best !== null && c.counts.correct * best.counts.attempted < best.counts.correct * c.counts.attempted;
    if (!best || c.stuckCount > best.stuckCount || (c.stuckCount === best.stuckCount && lowerRate)) best = c;
  }
  if (!best) return { kind: 'all-clear' };
  return { kind: 'focus', conceptId: best.conceptId, stuckCount: best.stuckCount, practiceSent: input.practiceSentFor.includes(best.conceptId) };
}
