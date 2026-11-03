import {
  classConceptStatus, detectMisconceptions, finalVerdicts, mostMissedQuestion, ratePercent, studentConceptStatus, studentEvidence,
  type Answer, type Bilingual, type ClassConceptKind, type ConceptId, type Counts, type Homework, type MisconceptionEvidence,
  type Question, type QuestionId, type StudentConceptKind, type StudentId, type SubmissionId, type Verdict,
} from '@/modules/domain';
import type { Collections } from '../storage/collections';

export type StudentRow = {
  studentId: StudentId;
  firstName: string;
  state: 'submitted' | 'draft' | 'pending';
  late: boolean;
  source: 'link' | 'paper' | 'photo' | null;
  submissionId: SubmissionId | null;
  verdicts: Partial<Record<QuestionId, Verdict>>;
};

export type ConceptResult = {
  conceptId: ConceptId;
  name: Bilingual;
  counts: Counts;
  ratePercent: number | null;
  classStatus: ClassConceptKind;
  /** Per student who submitted: their status on this concept (gap rules). */
  students: { studentId: StudentId; status: StudentConceptKind; counts: Counts }[];
  stuckStudentIds: StudentId[];
};

export type ReviewItem = { submissionId: SubmissionId; studentId: StudentId; firstName: string; questionId: QuestionId; verdict: Verdict; reasonKey?: string; answer?: Answer; by: 'auto' | 'teacher' | 'reader-preview' };

export type HomeworkResults = {
  homework: Homework;
  classLabel: string;
  subjectName: Bilingual;
  questions: Question[];
  totalStudents: number;
  submittedCount: number;
  lateCount: number;
  draftCount: number;
  rows: StudentRow[];
  concepts: ConceptResult[];
  /** Concept with the most stuck children (ties: lower class rate). Null when nobody is stuck. */
  focus: { conceptId: ConceptId; stuckCount: number } | null;
  misconceptions: MisconceptionEvidence[];
  mostMissed: { questionId: QuestionId; wrong: number; attempted: number } | null;
  /** Answers the auto-check was unsure about and the teacher has not decided yet. */
  review: ReviewItem[];
};

export function classLabel(c: { grade: number; section: string }): string {
  return `${c.grade}${c.section}`;
}

/** Everything the Results screens show, computed from stored answers by the domain rules (SPEC-insights). */
export function computeResults(db: Collections, homework: Homework): HomeworkResults {
  const cls = db.classes.find((c) => c.id === homework.classId);
  const roster = db.students.filter((s) => s.classId === homework.classId && s.status === 'active');
  const targets = homework.targetStudentIds ? new Set<string>(homework.targetStudentIds) : null;
  const expected = targets ? roster.filter((s) => targets.has(s.id)) : roster;
  const questionMap = new Map<string, Question>(db.questions.map((q) => [q.id, q]));
  const questions = homework.questionIds.map((id) => questionMap.get(id)).filter((q): q is Question => Boolean(q));
  const subs = db.submissions.filter((s) => s.homeworkId === homework.id);
  const submitted = subs.filter((s) => s.status === 'submitted');
  const bySubject = db.subjects.find((s) => s.id === homework.subjectId);

  const rows: StudentRow[] = expected.map((student) => {
    const sub = subs.find((s) => s.studentId === student.id);
    const verdicts: Partial<Record<QuestionId, Verdict>> = {};
    if (sub) for (const [q, v] of finalVerdicts(sub)) verdicts[q] = v;
    return {
      studentId: student.id, firstName: student.firstName,
      state: sub ? (sub.status === 'submitted' ? 'submitted' : 'draft') : 'pending',
      late: sub?.late ?? false, source: sub?.source ?? null, submissionId: sub?.id ?? null, verdicts,
    };
  });

  const perStudent = studentEvidence(submitted, questionMap);
  const conceptIds = [...new Set(questions.map((q) => q.conceptId))];
  const concepts: ConceptResult[] = conceptIds.map((conceptId) => {
    const students = submitted.map((s) => {
      const counts = perStudent.get(s.studentId)?.get(conceptId) ?? { attempted: 0, correct: 0 };
      return { studentId: s.studentId, status: studentConceptStatus(counts).kind, counts };
    });
    const counts = students.reduce((sum, s) => ({ attempted: sum.attempted + s.counts.attempted, correct: sum.correct + s.counts.correct }), { attempted: 0, correct: 0 });
    const concept = db.concepts.find((c) => c.id === conceptId);
    return {
      conceptId, name: concept?.name ?? { en: conceptId }, counts, ratePercent: ratePercent(counts),
      classStatus: classConceptStatus(counts).kind, students,
      stuckStudentIds: students.filter((s) => s.status === 'stuck').map((s) => s.studentId),
    };
  });

  // Most stuck children first; ties go to the lower class rate (cross-multiplied, no floats).
  const [top] = concepts
    .filter((c) => c.stuckStudentIds.length > 0)
    .sort((a, b) => b.stuckStudentIds.length - a.stuckStudentIds.length || a.counts.correct * b.counts.attempted - b.counts.correct * a.counts.attempted);
  const focus: HomeworkResults['focus'] = top ? { conceptId: top.conceptId, stuckCount: top.stuckStudentIds.length } : null;

  const names = new Map<string, string>(roster.map((s) => [s.id, s.firstName]));
  const review: ReviewItem[] = [];
  for (const sub of submitted) {
    const final = finalVerdicts(sub);
    for (const [questionId, verdict] of final) {
      if (verdict !== 'unsure') continue;
      const lastAuto = [...sub.evaluations].reverse().find((e) => e.questionId === questionId);
      const item: ReviewItem = { submissionId: sub.id, studentId: sub.studentId, firstName: names.get(sub.studentId) ?? '', questionId, verdict, by: lastAuto?.by ?? 'auto' };
      if (lastAuto?.reasonKey) item.reasonKey = lastAuto.reasonKey;
      const answer = sub.answers[questionId];
      if (answer) item.answer = answer;
      review.push(item);
    }
  }

  return {
    homework, classLabel: cls ? classLabel(cls) : '', subjectName: bySubject?.name ?? { en: homework.subjectId }, questions,
    totalStudents: expected.length, submittedCount: submitted.length, lateCount: submitted.filter((s) => s.late).length,
    draftCount: subs.filter((s) => s.status === 'draft').length, rows, concepts, focus,
    misconceptions: detectMisconceptions(questions, submitted), mostMissed: mostMissedQuestion(questions, submitted), review,
  };
}
