import { classConceptStatus, type ClassConceptKind, type Counts } from './gap-rules';
import { ratePercent } from './format';

export type TeacherActivity = { publishedInLast7Days: boolean; openedResultsAfterCheck: boolean };

/** "Active" = completed a homework workflow this week, not just logged in (SPEC assumption 4). */
export const isActiveTeacher = (t: TeacherActivity): boolean => t.publishedInLast7Days && t.openedResultsAfterCheck;

export const UNLOCK_ACTIVE_TEACHERS = 3;
export const isDashboardUnlocked = (plan: 'free' | 'school', activeTeachers: number): boolean =>
  plan === 'school' || activeTeachers >= UNLOCK_ACTIVE_TEACHERS;

export type AggregateInput = {
  teachers: readonly TeacherActivity[];
  homeworkSet: number;
  expectedSubmissions: number;
  actualSubmissions: number;
  cells: readonly { classLabel: string; subjectId: string; counts: Counts; weakestConceptId?: string }[];
  practiceSent: number;
  practiceCompleted: number;
  parentReportsOpened: number;
};

export type GapCell = { classLabel: string; subjectId: string; ratePercent: number | null; status: ClassConceptKind; weakestConceptId?: string };

/** Principal view: counts, rates and class × subject cells only. No student or teacher identifiers (threat model I2). */
export type SchoolAggregates = {
  activeTeachers: number;
  homeworkSet: number;
  submissionRate: number | null;
  gapCells: GapCell[];
  practiceSent: number;
  practiceCompleted: number;
  parentReportsOpened: number;
  headline: { classLabel: string; subjectId: string } | null;
};

export function schoolAggregates(input: AggregateInput): SchoolAggregates {
  const gapCells: GapCell[] = input.cells.map((cell) => {
    const status = classConceptStatus(cell.counts).kind;
    if (status === 'not-enough-evidence') return { classLabel: cell.classLabel, subjectId: cell.subjectId, ratePercent: null, status };
    const out: GapCell = { classLabel: cell.classLabel, subjectId: cell.subjectId, ratePercent: ratePercent(cell.counts), status };
    if (cell.weakestConceptId) out.weakestConceptId = cell.weakestConceptId;
    return out;
  });

  let worst: AggregateInput['cells'][number] | null = null;
  for (const cell of input.cells) {
    if (classConceptStatus(cell.counts).kind !== 'class-gap') continue;
    if (!worst || cell.counts.correct * worst.counts.attempted < worst.counts.correct * cell.counts.attempted) worst = cell;
  }

  return {
    activeTeachers: input.teachers.filter(isActiveTeacher).length,
    homeworkSet: input.homeworkSet,
    submissionRate: ratePercent({ attempted: input.expectedSubmissions, correct: input.actualSubmissions }),
    gapCells,
    practiceSent: input.practiceSent,
    practiceCompleted: input.practiceCompleted,
    parentReportsOpened: input.parentReportsOpened,
    headline: worst ? { classLabel: worst.classLabel, subjectId: worst.subjectId } : null,
  };
}
