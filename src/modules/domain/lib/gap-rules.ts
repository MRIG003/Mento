/**
 * Gap rules (SPEC-domain, ADR-004). One wrong answer never proves a gap. Integer arithmetic only, so the exact
 * boundaries (50%, 60%, 80%) cannot be broken by floating point.
 */
export type Counts = { attempted: number; correct: number };

export type StudentConceptKind = 'not-enough-evidence' | 'stuck' | 'on-track';
export type ClassConceptKind = 'not-enough-evidence' | 'class-gap' | 'ok';
export type ReportBand = 'not-enough-evidence' | 'not-yet' | 'getting-there' | 'understood';

export const MIN_STUDENT_ATTEMPTS = 2;
export const MIN_CLASS_ATTEMPTS = 3;

/** Student: flag only with ≥ 2 attempts and fewer than half right (2c < a). */
export function studentConceptStatus({ attempted, correct }: Counts): { kind: StudentConceptKind } & Counts {
  if (attempted < MIN_STUDENT_ATTEMPTS) return { kind: 'not-enough-evidence', attempted, correct };
  return { kind: 2 * correct < attempted ? 'stuck' : 'on-track', attempted, correct };
}

/** Class: flag when fewer than 60% right across ≥ 3 attempts (10c < 6a). */
export function classConceptStatus({ attempted, correct }: Counts): { kind: ClassConceptKind } & Counts {
  if (attempted < MIN_CLASS_ATTEMPTS) return { kind: 'not-enough-evidence', attempted, correct };
  return { kind: 10 * correct < 6 * attempted ? 'class-gap' : 'ok', attempted, correct };
}

/** Parent report: not yet (= stuck) / getting there (50% to < 80%) / understood (≥ 80%), each needing ≥ 2 attempts. */
export function reportBand({ attempted, correct }: Counts): ReportBand {
  if (attempted < MIN_STUDENT_ATTEMPTS) return 'not-enough-evidence';
  if (2 * correct < attempted) return 'not-yet';
  if (5 * correct < 4 * attempted) return 'getting-there';
  return 'understood';
}
