import { err, isActiveTeacher, isDashboardUnlocked, ok, ratePercent, schoolAggregates, type Bilingual, type Clock, type Result, type SchoolAggregates, type SchoolId } from '@/modules/domain';
import { classConceptStatus, classEvidence, type Question } from '@/modules/domain';
import type { Collections } from '../storage/collections';
import type { Database } from '../storage/database';
import { classLabel } from './results';

export type Range = 'this-week' | 'this-term';
/** Aggregates plus the names needed to label them (concepts, subjects); never children or teachers (threat model I2). */
export type PrincipalOverview = SchoolAggregates & { conceptNames: Record<string, Bilingual>; subjectNames: Record<string, Bilingual>; schoolName: string };
export type LockState = { unlocked: boolean; activeTeachers: number; plan: 'free' | 'school' };

export type PrincipalScope = {
  overview(range: Range): Promise<Result<PrincipalOverview>>;
  lockState(): Promise<Result<LockState>>;
};

const WEEK = 7 * 86_400_000;

export function createPrincipalScope({ db, schoolId, clock }: { db: Database; schoolId: SchoolId; clock: Clock }): PrincipalScope {
  const load = (): Result<Collections> => {
    const r = db.read();
    if (!r.ok) return r;
    if (!r.value || !r.value.schools.some((s) => s.id === schoolId)) return err('NOT_FOUND', 'error.missing');
    return ok(r.value);
  };

  const activeTeacherCount = (d: Collections): number => {
    const since = clock.now().getTime() - WEEK;
    const classesOf = (tid: string) => new Set(d.classes.filter((c) => c.teacherId === tid).map((c) => c.id));
    return d.teachers.filter((t) => t.schoolId === schoolId).map((t) => {
      const mine = classesOf(t.id);
      return {
        publishedInLast7Days: d.homework.some((h) => mine.has(h.classId) && h.status === 'published' && Date.parse(h.publishedAt ?? h.createdAt) >= since),
        openedResultsAfterCheck: d.events.some((e) => e.kind === 'results-opened' && e.teacherId === t.id && Date.parse(e.at) >= since &&
          d.submissions.some((s) => s.homeworkId === e.homeworkId && s.status === 'submitted')),
      };
    }).filter(isActiveTeacher).length;
  };

  return {
    async overview(range) {
      const d = load();
      if (!d.ok) return d;
      const x = d.value;
      const school = x.schools.find((s) => s.id === schoolId)!;
      const since = range === 'this-week' ? clock.now().getTime() - WEEK : 0;
      const classes = x.classes.filter((c) => c.schoolId === schoolId);
      const classIds = new Set(classes.map((c) => c.id));
      const homework = x.homework.filter((h) => classIds.has(h.classId) && h.status === 'published' && Date.parse(h.publishedAt ?? h.createdAt) >= since);
      const hwIds = new Set(homework.map((h) => h.id));
      const subs = x.submissions.filter((s) => hwIds.has(s.homeworkId) && s.status === 'submitted');
      const questions = new Map<string, Question>(x.questions.map((q) => [q.id, q]));
      const rosterSize = (classId: string) => x.students.filter((s) => s.classId === classId && s.status === 'active').length;

      const cells = classes.map((c) => {
        const own = new Set(homework.filter((h) => h.classId === c.id && h.kind === 'homework').map((h) => h.id));
        const perConcept = classEvidence(subs.filter((s) => own.has(s.homeworkId)), questions);
        let counts = { attempted: 0, correct: 0 };
        let weakest: { id: string; rate: number } | null = null;
        for (const [conceptId, cc] of perConcept) {
          counts = { attempted: counts.attempted + cc.attempted, correct: counts.correct + cc.correct };
          const rate = ratePercent(cc);
          if (classConceptStatus(cc).kind !== 'not-enough-evidence' && rate !== null && (!weakest || rate < weakest.rate)) weakest = { id: conceptId, rate };
        }
        return { classLabel: classLabel(c), subjectId: c.subjectId, counts, ...(weakest ? { weakestConceptId: weakest.id } : {}) };
      });

      const practice = homework.filter((h) => h.kind === 'practice');
      const aggregates = schoolAggregates({
        teachers: [],
        homeworkSet: homework.filter((h) => h.kind === 'homework').length,
        expectedSubmissions: homework.filter((h) => h.kind === 'homework').reduce((n, h) => n + rosterSize(h.classId), 0),
        actualSubmissions: subs.filter((s) => homework.find((h) => h.id === s.homeworkId)?.kind === 'homework').length,
        cells,
        practiceSent: practice.reduce((n, h) => n + (h.targetStudentIds?.length ?? 0), 0),
        practiceCompleted: subs.filter((s) => practice.some((h) => h.id === s.homeworkId)).length,
        parentReportsOpened: x.events.filter((e) => e.kind === 'report-opened' && Date.parse(e.at) >= since && (!e.classId || classIds.has(e.classId))).length,
      });

      const conceptNames: Record<string, Bilingual> = {};
      for (const cell of aggregates.gapCells) {
        const name = cell.weakestConceptId ? x.concepts.find((c) => c.id === cell.weakestConceptId)?.name : undefined;
        if (cell.weakestConceptId && name) conceptNames[cell.weakestConceptId] = name;
      }
      return ok({
        ...aggregates,
        activeTeachers: activeTeacherCount(x),
        conceptNames,
        subjectNames: Object.fromEntries(x.subjects.map((s) => [s.id, s.name])),
        schoolName: school.name,
      });
    },

    async lockState() {
      const d = load();
      if (!d.ok) return d;
      const plan = d.value.schools.find((s) => s.id === schoolId)!.plan;
      const activeTeachers = activeTeacherCount(d.value);
      return ok({ unlocked: isDashboardUnlocked(plan, activeTeachers), activeTeachers, plan });
    },
  };
}
