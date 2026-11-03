import {
  err, finalVerdicts, generateToken, isLate, newId, ok, selectPractice, toCsv,
  type Bilingual, type Class, type ClassId, type Clock, type ConceptId, type CsvValue, type Homework, type HomeworkId, type LangCode,
  type PracticeSet, type PracticeSetId, type Question, type QuestionId, type RandomSource, type Result, type Student, type StudentId,
  type SubjectId, type SubmissionId, type TeacherId,
} from '@/modules/domain';
import type { BlobStore } from '../storage/blob-store';
import type { Collections, Template } from '../storage/collections';
import type { Database } from '../storage/database';
import { classLabel, computeResults, type HomeworkResults } from './results';

export type ClassSummary = { class: Class; label: string; subjectName: Bilingual; studentCount: number; pendingCount: number };
export type CreateClassInput = { grade: number; section: string; subjectId: SubjectId; defaultLang: LangCode };
export type HomeworkDraftInput = { id?: HomeworkId; classId: ClassId; chapter: Bilingual; questionIds: QuestionId[]; dueAt: string; defaultLang: LangCode };
export type BankFilter = { subjectId: SubjectId; grade?: number; conceptIds?: ConceptId[] };

export const MAX_ROSTER = 80;
const PRACTICE_DAYS = 2;

export type TeacherScope = {
  teacherId: TeacherId;
  listClasses(): Promise<Result<ClassSummary[]>>;
  createClass(input: CreateClassInput): Promise<Result<Class>>;
  addStudents(classId: ClassId, firstNames: string[]): Promise<Result<Student[]>>;
  approvePending(studentId: StudentId): Promise<Result<void>>;
  listStudents(classId: ClassId): Promise<Result<Student[]>>;
  listBank(filter: BankFilter): Promise<Result<Question[]>>;
  addQuestion(question: Question): Promise<Result<Question>>;
  saveHomework(input: HomeworkDraftInput): Promise<Result<Homework>>;
  publishHomework(id: HomeworkId): Promise<Result<Homework>>;
  listHomework(classId?: ClassId): Promise<Result<Homework[]>>;
  lastHomework(classId: ClassId): Promise<Result<Homework | null>>;
  saveTemplate(id: HomeworkId, name: string): Promise<Result<Template>>;
  listTemplates(): Promise<Result<Template[]>>;
  getResults(id: HomeworkId): Promise<Result<HomeworkResults>>;
  overrideEvaluation(submissionId: SubmissionId, questionId: QuestionId, verdict: 'correct' | 'incorrect'): Promise<Result<void>>;
  recordPaperMarks(homeworkId: HomeworkId, studentId: StudentId, marks: Partial<Record<QuestionId, 'correct' | 'incorrect'>>): Promise<Result<void>>;
  draftPractice(homeworkId: HomeworkId, conceptId: ConceptId, studentIds: StudentId[]): Promise<Result<PracticeSet>>;
  updatePractice(id: PracticeSetId, questionIds: QuestionId[]): Promise<Result<PracticeSet>>;
  approvePractice(id: PracticeSetId): Promise<Result<Homework>>;
  recordEvent(kind: 'results-opened' | 'join-link-shared' | 'homework-shared' | 'practice-shared', ref: { homeworkId?: HomeworkId; classId?: ClassId }): Promise<void>;
  exportClassCsv(classId: ClassId): Promise<Result<string>>;
  deleteStudent(id: StudentId): Promise<Result<void>>;
};

type Deps = { db: Database; teacherId: TeacherId; clock: Clock; rng: RandomSource; blobs?: BlobStore };

const forbidden = () => err('FORBIDDEN', 'error.forbidden');
const missing = () => err('NOT_FOUND', 'error.missing');

export function createTeacherScope({ db, teacherId, clock, rng, blobs }: Deps): TeacherScope {
  const nowIso = () => clock.now().toISOString();
  const load = (): Result<Collections> => {
    const r = db.read();
    if (!r.ok) return r;
    return r.value ? ok(r.value) : missing();
  };
  /** Ownership check: the class must belong to this teacher (role boundary in the data layer, SPEC-data). */
  const ownClass = (d: Collections, classId: string): Result<Class> => {
    const c = d.classes.find((x) => x.id === classId);
    if (!c) return missing();
    return c.teacherId === teacherId ? ok(c) : forbidden();
  };
  const ownHomework = (d: Collections, homeworkId: string): Result<Homework> => {
    const hw = d.homework.find((h) => h.id === homeworkId);
    if (!hw) return missing();
    const c = ownClass(d, hw.classId);
    return c.ok ? ok(hw) : c;
  };
  const save = (change: (d: Collections) => Collections): Result<Collections> => db.update(change);

  return {
    teacherId,

    async listClasses() {
      const d = load();
      if (!d.ok) return d;
      return ok(d.value.classes.filter((c) => c.teacherId === teacherId).map((c) => {
        const kids = d.value.students.filter((s) => s.classId === c.id);
        return {
          class: c, label: classLabel(c), subjectName: d.value.subjects.find((s) => s.id === c.subjectId)?.name ?? { en: c.subjectId },
          studentCount: kids.filter((s) => s.status === 'active').length, pendingCount: kids.filter((s) => s.status === 'pending').length,
        };
      }));
    },

    async createClass(input) {
      const d = load();
      const teacher = d.ok ? d.value.teachers.find((t) => t.id === teacherId) : undefined;
      if (!teacher) return missing();
      const created: Class = {
        id: newId('cls', rng) as Class['id'], schoolId: teacher.schoolId, teacherId, grade: input.grade, section: input.section.trim().toUpperCase(),
        subjectId: input.subjectId, defaultLang: input.defaultLang, joinToken: generateToken(rng) as Class['joinToken'], createdAt: nowIso(),
      };
      const saved = save((x) => ({ ...x, classes: [...x.classes, created] }));
      return saved.ok ? ok(created) : saved;
    },

    async addStudents(classId, firstNames) {
      const d = load();
      if (!d.ok) return d;
      const c = ownClass(d.value, classId);
      if (!c.ok) return c;
      const existing = d.value.students.filter((s) => s.classId === classId);
      const seen = new Set(existing.map((s) => s.firstName.toLocaleLowerCase()));
      const clean = firstNames.map((n) => n.normalize('NFC').replace(/\s+/g, ' ').trim().slice(0, 30)).filter((n) => {
        const key = n.toLocaleLowerCase();
        if (!n || seen.has(key)) return false;
        seen.add(key);
        return true;
      });
      if (existing.length + clean.length > MAX_ROSTER) return err('VALIDATION', 'error.roster.full', { max: MAX_ROSTER });
      const added: Student[] = clean.map((firstName) => ({ id: newId('stu', rng) as Student['id'], classId: c.value.id, firstName, status: 'active', createdAt: nowIso() }));
      const saved = save((x) => ({ ...x, students: [...x.students, ...added] }));
      return saved.ok ? ok(added) : saved;
    },

    async approvePending(studentId) {
      const d = load();
      if (!d.ok) return d;
      const s = d.value.students.find((x) => x.id === studentId);
      if (!s) return missing();
      const c = ownClass(d.value, s.classId);
      if (!c.ok) return c;
      const saved = save((x) => ({ ...x, students: x.students.map((y) => (y.id === studentId ? { ...y, status: 'active' as const } : y)) }));
      return saved.ok ? ok(undefined) : saved;
    },

    async listStudents(classId) {
      const d = load();
      if (!d.ok) return d;
      const c = ownClass(d.value, classId);
      if (!c.ok) return c;
      return ok(d.value.students.filter((s) => s.classId === classId));
    },

    async listBank(filter) {
      const d = load();
      if (!d.ok) return d;
      const concepts = new Map(d.value.concepts.map((c) => [c.id, c]));
      return ok(d.value.questions.filter((q) => {
        const concept = concepts.get(q.conceptId);
        if (!concept || concept.subjectId !== filter.subjectId) return false;
        if (filter.grade !== undefined && concept.grade !== filter.grade) return false;
        return !filter.conceptIds || filter.conceptIds.includes(q.conceptId);
      }));
    },

    async addQuestion(question) {
      const saved = save((x) => ({ ...x, questions: [...x.questions.filter((q) => q.id !== question.id), { ...question, source: 'teacher' }] }));
      return saved.ok ? ok(question) : saved;
    },

    async saveHomework(input) {
      const d = load();
      if (!d.ok) return d;
      const c = ownClass(d.value, input.classId);
      if (!c.ok) return c;
      const previous = input.id ? d.value.homework.find((h) => h.id === input.id) : undefined;
      if (previous && previous.classId !== input.classId) return forbidden();
      if (previous?.status === 'published') return err('CONFLICT', 'error.validation', 'already published');
      const hw: Homework = {
        id: (previous?.id ?? newId('hw', rng)) as Homework['id'], classId: c.value.id, subjectId: c.value.subjectId, chapter: input.chapter,
        questionIds: input.questionIds, dueAt: input.dueAt, defaultLang: input.defaultLang, status: 'draft',
        token: previous?.token ?? (generateToken(rng) as Homework['token']), kind: 'homework', createdAt: previous?.createdAt ?? nowIso(),
      };
      const saved = save((x) => ({ ...x, homework: [...x.homework.filter((h) => h.id !== hw.id), hw] }));
      return saved.ok ? ok(hw) : saved;
    },

    async publishHomework(id) {
      const d = load();
      if (!d.ok) return d;
      const hw = ownHomework(d.value, id);
      if (!hw.ok) return hw;
      const published: Homework = { ...hw.value, status: 'published', publishedAt: hw.value.publishedAt ?? nowIso() };
      const saved = save((x) => ({ ...x, homework: x.homework.map((h) => (h.id === id ? published : h)) }));
      return saved.ok ? ok(published) : saved;
    },

    async listHomework(classId) {
      const d = load();
      if (!d.ok) return d;
      const mine = new Set(d.value.classes.filter((c) => c.teacherId === teacherId && (!classId || c.id === classId)).map((c) => c.id));
      return ok(d.value.homework.filter((h) => mine.has(h.classId)).sort((a, b) => b.createdAt.localeCompare(a.createdAt)));
    },

    async lastHomework(classId) {
      const list = await this.listHomework(classId);
      if (!list.ok) return list;
      return ok(list.value.find((h) => h.kind === 'homework' && h.status === 'published') ?? null);
    },

    async saveTemplate(id, name) {
      const d = load();
      if (!d.ok) return d;
      const hw = ownHomework(d.value, id);
      if (!hw.ok) return hw;
      const template: Template = { id: newId('tpl', rng), teacherId, name: name.trim().slice(0, 60) || 'Template', subjectId: hw.value.subjectId, chapter: hw.value.chapter, questionIds: hw.value.questionIds, createdAt: nowIso() };
      const saved = save((x) => ({ ...x, templates: [...x.templates, template] }));
      return saved.ok ? ok(template) : saved;
    },

    async listTemplates() {
      const d = load();
      if (!d.ok) return d;
      return ok(d.value.templates.filter((t) => t.teacherId === teacherId));
    },

    async getResults(id) {
      const d = load();
      if (!d.ok) return d;
      const hw = ownHomework(d.value, id);
      if (!hw.ok) return hw;
      return ok(computeResults(d.value, hw.value));
    },

    async overrideEvaluation(submissionId, questionId, verdict) {
      const d = load();
      if (!d.ok) return d;
      const sub = d.value.submissions.find((s) => s.id === submissionId);
      if (!sub) return missing();
      const hw = ownHomework(d.value, sub.homeworkId);
      if (!hw.ok) return hw;
      if (!hw.value.questionIds.includes(questionId)) return err('VALIDATION', 'error.validation');
      const was = finalVerdicts(sub).get(questionId) ?? 'unanswered';
      const saved = save((x) => ({
        ...x,
        submissions: x.submissions.map((s) => (s.id === submissionId ? { ...s, evaluations: [...s.evaluations, { questionId, verdict, by: 'teacher' as const, overriddenFrom: was }] } : s)),
      }));
      return saved.ok ? ok(undefined) : saved;
    },

    async recordPaperMarks(homeworkId, studentId, marks) {
      const d = load();
      if (!d.ok) return d;
      const hw = ownHomework(d.value, homeworkId);
      if (!hw.ok) return hw;
      const student = d.value.students.find((s) => s.id === studentId && s.classId === hw.value.classId);
      if (!student) return missing();
      const evaluations = Object.entries(marks).filter(([q]) => hw.value.questionIds.includes(q as QuestionId))
        .map(([questionId, verdict]) => ({ questionId: questionId as QuestionId, verdict: verdict as 'correct' | 'incorrect', by: 'teacher' as const }));
      const existing = d.value.submissions.find((s) => s.homeworkId === homeworkId && s.studentId === studentId);
      const submittedAt = nowIso();
      const sub = {
        id: (existing?.id ?? newId('sub', rng)) as SubmissionId, homeworkId: hw.value.id, studentId: student.id, source: 'paper' as const,
        answers: existing?.answers ?? {}, status: 'submitted' as const, submittedAt: existing?.submittedAt ?? submittedAt,
        late: existing?.late ?? isLate(submittedAt, hw.value.dueAt), evaluations: [...(existing?.evaluations ?? []), ...evaluations],
      };
      const saved = save((x) => ({ ...x, submissions: [...x.submissions.filter((s) => s.id !== sub.id), sub] }));
      return saved.ok ? ok(undefined) : saved;
    },

    async draftPractice(homeworkId, conceptId, studentIds) {
      const d = load();
      if (!d.ok) return d;
      const hw = ownHomework(d.value, homeworkId);
      if (!hw.ok) return hw;
      const roster = new Set(d.value.students.filter((s) => s.classId === hw.value.classId).map((s) => s.id));
      const targets = studentIds.filter((id) => roster.has(id));
      if (targets.length === 0) return err('VALIDATION', 'error.validation');
      const picked = selectPractice(d.value.questions, conceptId, new Set(hw.value.questionIds), rng);
      if (!picked.ok) return picked;
      const set: PracticeSet = { id: newId('ps', rng) as PracticeSetId, sourceHomeworkId: hw.value.id, conceptId, studentIds: targets, questionIds: picked.value, status: 'draft', createdAt: nowIso() };
      const saved = save((x) => ({ ...x, practiceSets: [...x.practiceSets, set] }));
      return saved.ok ? ok(set) : saved;
    },

    async updatePractice(id, questionIds) {
      const d = load();
      if (!d.ok) return d;
      const set = d.value.practiceSets.find((p) => p.id === id);
      if (!set) return missing();
      const hw = ownHomework(d.value, set.sourceHomeworkId);
      if (!hw.ok) return hw;
      if (set.status !== 'draft') return err('CONFLICT', 'error.validation');
      const next = { ...set, questionIds };
      const saved = save((x) => ({ ...x, practiceSets: x.practiceSets.map((p) => (p.id === id ? next : p)) }));
      return saved.ok ? ok(next) : saved;
    },

    async approvePractice(id) {
      const d = load();
      if (!d.ok) return d;
      const set = d.value.practiceSets.find((p) => p.id === id);
      if (!set) return missing();
      const source = ownHomework(d.value, set.sourceHomeworkId);
      if (!source.ok) return source;
      const existing = set.publishedHomeworkId ? d.value.homework.find((h) => h.id === set.publishedHomeworkId) : undefined;
      if (existing) return ok(existing);
      const now = clock.now();
      const concept = d.value.concepts.find((c) => c.id === set.conceptId);
      const practice: Homework = {
        id: newId('hw', rng) as Homework['id'], classId: source.value.classId, subjectId: source.value.subjectId, chapter: concept?.name ?? source.value.chapter,
        questionIds: set.questionIds, dueAt: new Date(now.getTime() + PRACTICE_DAYS * 86_400_000).toISOString(), defaultLang: source.value.defaultLang,
        status: 'published', token: source.value.token, kind: 'practice', parentHomeworkId: source.value.id, targetStudentIds: set.studentIds,
        createdAt: now.toISOString(), publishedAt: now.toISOString(),
      };
      const saved = save((x) => ({
        ...x,
        homework: [...x.homework, practice],
        practiceSets: x.practiceSets.map((p) => (p.id === id ? { ...p, status: 'approved' as const, publishedHomeworkId: practice.id } : p)),
      }));
      return saved.ok ? ok(practice) : saved;
    },

    async recordEvent(kind, ref) {
      save((x) => ({ ...x, events: [...x.events, { kind, at: nowIso(), teacherId, ...(ref.homeworkId ? { homeworkId: ref.homeworkId } : {}), ...(ref.classId ? { classId: ref.classId } : {}) }] }));
    },

    async exportClassCsv(classId) {
      const d = load();
      if (!d.ok) return d;
      const c = ownClass(d.value, classId);
      if (!c.ok) return c;
      const names = new Map<string, string>(d.value.students.filter((s) => s.classId === classId).map((s) => [s.id, s.firstName]));
      const homework = d.value.homework.filter((h) => h.classId === classId);
      const rows: CsvValue[][] = [['first_name', 'homework', 'question', 'verdict', 'submitted_at', 'late', 'source']];
      for (const hw of homework) {
        for (const sub of d.value.submissions.filter((s) => s.homeworkId === hw.id && s.status === 'submitted')) {
          for (const [questionId, verdict] of finalVerdicts(sub)) {
            rows.push([names.get(sub.studentId) ?? '', hw.chapter.en ?? hw.chapter.hi ?? '', questionId, verdict, sub.submittedAt ?? '', sub.late, sub.source]);
          }
        }
      }
      return ok(toCsv(rows));
    },

    async deleteStudent(id) {
      const d = load();
      if (!d.ok) return d;
      const student = d.value.students.find((s) => s.id === id);
      if (!student) return missing();
      const c = ownClass(d.value, student.classId);
      if (!c.ok) return c;
      const photoRefs = d.value.submissions.filter((s) => s.studentId === id).flatMap((s) => Object.values(s.answers)).flatMap((a) => (a?.type === 'photo' ? [a.photoRef] : []));
      const saved = save((x) => ({
        ...x,
        students: x.students.filter((s) => s.id !== id),
        submissions: x.submissions.filter((s) => s.studentId !== id),
        consents: x.consents.filter((s) => s.studentId !== id),
        practiceSets: x.practiceSets.map((p) => ({ ...p, studentIds: p.studentIds.filter((s) => s !== id) })).filter((p) => p.studentIds.length > 0),
        session: { ...x.session, claims: Object.fromEntries(Object.entries(x.session.claims).filter(([, s]) => s !== id)) },
      }));
      if (!saved.ok) return saved;
      if (blobs) await Promise.all(photoRefs.map((ref) => blobs.delete(ref)));
      return ok(undefined);
    },
  };
}
