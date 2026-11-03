import type { StudentConceptKind } from './gap-rules';

export type RecheckRow<Id extends string = string> = { studentId: Id; before: StudentConceptKind; after: StudentConceptKind; unstuck: boolean };

/** Compare each student's status on a concept before and after practice. "Unstuck" = stuck → on track (North Star unit). */
export function recheckDelta<Id extends string>(before: ReadonlyMap<Id, StudentConceptKind>, after: ReadonlyMap<Id, StudentConceptKind>): RecheckRow<Id>[] {
  return [...before].map(([studentId, was]) => {
    const now = after.get(studentId) ?? 'not-enough-evidence';
    return { studentId, before: was, after: now, unstuck: was === 'stuck' && now === 'on-track' };
  });
}

export function unstuckCount(rows: readonly RecheckRow[]): number {
  return rows.filter((r) => r.unstuck).length;
}
