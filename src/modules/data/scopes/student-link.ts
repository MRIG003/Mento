import {
  checkAnswer, err, isLate, LinkTokenSchema, newId, ok, reportBand, studentEvidence,
  type Answer, type Bilingual, type Clock, type ConceptId, type Consent, type Homework, type HomeworkId, type LangCode, type Question,
  type QuestionId, type RandomSource, type ReportBand, type Result, type StudentId, type Submission,
} from '@/modules/domain';
import type { Collections } from '../storage/collections';
import type { Database } from '../storage/database';
import { classLabel } from './results';

/** A question as a link holder sees it: no answer key, variants or misconception labels (threat model I1). */
export type PublicQuestion =
  | { id: QuestionId; type: 'mcq'; prompt: Bilingual; options: { id: string; text: Bilingual }[] }
  | { id: QuestionId; type: 'fill'; prompt: Bilingual; numeric: boolean }
  | { id: QuestionId; type: 'short'; prompt: Bilingual }
  | { id: QuestionId; type: 'photo'; prompt: Bilingual };

export type PublicHomework = { id: HomeworkId; kind: 'homework' | 'practice'; chapter: Bilingual; dueAt: string; questions: PublicQuestion[] };
export type LinkContext = { classLabel: string; subjectName: Bilingual; defaultLang: LangCode; homework: PublicHomework };
export type OwnWork = { status: 'none' | 'draft' | 'submitted'; answers: Partial<Record<QuestionId, Answer>>; late: boolean; closed: boolean; submittedAt?: string };
export type OwnProgress = { conceptId: ConceptId; name: Bilingual; band: ReportBand }[];

export function toPublicQuestion(q: Question): PublicQuestion {
  switch (q.type) {
    case 'mcq': return { id: q.id, type: 'mcq', prompt: q.prompt, options: q.options.map((o) => ({ id: o.id, text: o.text })) };
    case 'fill': return { id: q.id, type: 'fill', prompt: q.prompt, numeric: q.numeric };
    case 'short': return { id: q.id, type: 'short', prompt: q.prompt };
    case 'photo': return { id: q.id, type: 'photo', prompt: q.prompt };
  }
}

export type StudentLinkScope = {
  resolve(): Promise<Result<LinkContext>>;
  rosterFirstNames(): Promise<Result<{ id: StudentId; firstName: string }[]>>;
  claimed(): Promise<Result<StudentId | null>>;
  claim(studentId: StudentId): Promise<Result<void>>;
  release(): Promise<Result<void>>;
  hasConsent(): Promise<Result<boolean>>;
  recordConsent(): Promise<Result<Consent>>;
  ownWork(homeworkId: HomeworkId): Promise<Result<OwnWork>>;
  saveDraft(homeworkId: HomeworkId, answers: Partial<Record<QuestionId, Answer>>): Promise<Result<void>>;
  submit(homeworkId: HomeworkId): Promise<Result<{ late: boolean }>>;
  ownPractice(): Promise<Result<(PublicHomework & { done: boolean })[]>>;
  ownProgress(): Promise<Result<OwnProgress>>;
};

type Deps = { db: Database; token: string; clock: Clock; rng: RandomSource };

export function createStudentLinkScope({ db, token, clock, rng }: Deps): StudentLinkScope {
  const invalid = () => err('NOT_FOUND', 'link.invalid');
  const validToken = LinkTokenSchema.safeParse(token).success;

  const load = (): Result<Collections> => {
    if (!validToken) return invalid();
    const r = db.read();
    if (!r.ok) return r;
    return r.value ? ok(r.value) : invalid();
  };
  const main = (d: Collections): Homework | undefined =>
    d.homework.find((h) => h.token === token && h.status === 'published' && h.kind === 'homework') ?? d.homework.find((h) => h.token === token && h.status === 'published');
  const claimOf = (d: Collections): StudentId | null => d.session.claims[token] ?? null;

  /** Homework reachable through this link for the claimed child: the main one, and practice targeted at them. */
  const reachable = (d: Collections, homeworkId: string, student: StudentId): Homework | undefined =>
    d.homework.find((h) => h.id === homeworkId && h.token === token && h.status === 'published' && (!h.targetStudentIds || h.targetStudentIds.includes(student)));

  const publicHomework = (d: Collections, h: Homework): PublicHomework => {
    const qs = new Map(d.questions.map((q) => [q.id, q]));
    return { id: h.id, kind: h.kind, chapter: h.chapter, dueAt: h.dueAt, questions: h.questionIds.map((id) => qs.get(id)).filter((q): q is Question => Boolean(q)).map(toPublicQuestion) };
  };

  const withStudent = (): Result<{ d: Collections; student: StudentId; hw: Homework }> => {
    const d = load();
    if (!d.ok) return d;
    const hw = main(d.value);
    if (!hw) return invalid();
    const student = claimOf(d.value);
    if (!student || !d.value.students.some((s) => s.id === student && s.classId === hw.classId)) return err('FORBIDDEN', 'link.pickNameFirst');
    return ok({ d: d.value, student, hw });
  };

  const evaluate = (d: Collections, homework: Homework, answers: Partial<Record<QuestionId, Answer>>) => {
    const qs = new Map(d.questions.map((q) => [q.id, q]));
    return homework.questionIds.flatMap((id) => {
      const q = qs.get(id);
      const a = answers[id];
      if (!q || !a) return [];
      const outcome = checkAnswer(q, a);
      return [{ questionId: id, verdict: outcome.verdict, by: 'auto' as const, ...(outcome.reasonKey ? { reasonKey: outcome.reasonKey } : {}) }];
    });
  };

  return {
    async resolve() {
      const d = load();
      if (!d.ok) return d;
      const hw = main(d.value);
      const cls = hw ? d.value.classes.find((c) => c.id === hw.classId) : undefined;
      if (!hw || !cls) return invalid();
      return ok({ classLabel: classLabel(cls), subjectName: d.value.subjects.find((s) => s.id === hw.subjectId)?.name ?? { en: hw.subjectId }, defaultLang: hw.defaultLang, homework: publicHomework(d.value, hw) });
    },

    async rosterFirstNames() {
      const d = load();
      if (!d.ok) return d;
      const hw = main(d.value);
      if (!hw) return invalid();
      return ok(d.value.students.filter((s) => s.classId === hw.classId && s.status === 'active').map((s) => ({ id: s.id, firstName: s.firstName })));
    },

    async claimed() {
      const d = load();
      return d.ok ? ok(claimOf(d.value)) : d;
    },

    async claim(studentId) {
      const d = load();
      if (!d.ok) return d;
      const hw = main(d.value);
      if (!hw) return invalid();
      if (!d.value.students.some((s) => s.id === studentId && s.classId === hw.classId && s.status === 'active')) return err('FORBIDDEN', 'link.pickNameFirst');
      const saved = db.update((x) => ({ ...x, session: { ...x.session, claims: { ...x.session.claims, [token]: studentId } } }));
      return saved.ok ? ok(undefined) : saved;
    },

    async release() {
      const saved = db.update((x) => ({ ...x, session: { ...x.session, claims: Object.fromEntries(Object.entries(x.session.claims).filter(([t]) => t !== token)) } }));
      return saved.ok ? ok(undefined) : saved;
    },

    async hasConsent() {
      const s = withStudent();
      if (!s.ok) return s;
      return ok(s.value.d.consents.some((c) => c.studentId === s.value.student && !c.withdrawnAt));
    },

    async recordConsent() {
      const s = withStudent();
      if (!s.ok) return s;
      const existing = s.value.d.consents.find((c) => c.studentId === s.value.student && !c.withdrawnAt);
      if (existing) return ok(existing);
      const consent: Consent = { id: newId('con', rng) as Consent['id'], studentId: s.value.student, grantedAt: clock.now().toISOString(), grantedBy: 'parent-on-link', purpose: 'teaching' };
      const saved = db.update((x) => ({ ...x, consents: [...x.consents, consent] }));
      return saved.ok ? ok(consent) : saved;
    },

    async ownWork(homeworkId) {
      const s = withStudent();
      if (!s.ok) return s;
      const hw = reachable(s.value.d, homeworkId, s.value.student);
      if (!hw) return invalid();
      const sub = s.value.d.submissions.find((x) => x.homeworkId === hw.id && x.studentId === s.value.student);
      const closed = Date.parse(clock.now().toISOString()) > Date.parse(hw.dueAt) && sub?.status === 'submitted';
      return ok({ status: sub?.status ?? 'none', answers: sub?.answers ?? {}, late: sub?.late ?? false, closed, ...(sub?.submittedAt ? { submittedAt: sub.submittedAt } : {}) });
    },

    async saveDraft(homeworkId, answers) {
      const s = withStudent();
      if (!s.ok) return s;
      const hw = reachable(s.value.d, homeworkId, s.value.student);
      if (!hw) return invalid();
      const existing = s.value.d.submissions.find((x) => x.homeworkId === hw.id && x.studentId === s.value.student);
      // Editable until the deadline; a late child can still finish an unsubmitted draft.
      if (existing?.status === 'submitted' && clock.now().getTime() > Date.parse(hw.dueAt)) return err('CONFLICT', 'link.closed');
      const allowed = Object.fromEntries(Object.entries(answers).filter(([q]) => hw.questionIds.includes(q as QuestionId)));
      let next: Submission;
      if (existing?.status === 'submitted') {
        // Re-check changed answers; keep the teacher's decisions on answers that did not change.
        const unchanged = new Set(Object.keys(allowed).filter((q) => JSON.stringify(existing.answers[q as QuestionId]) === JSON.stringify(allowed[q])));
        next = { ...existing, answers: allowed, evaluations: [...evaluate(s.value.d, hw, allowed), ...existing.evaluations.filter((e) => e.by === 'teacher' && unchanged.has(e.questionId))] };
      } else {
        next = { id: (existing?.id ?? newId('sub', rng)) as Submission['id'], homeworkId: hw.id, studentId: s.value.student, source: 'link', answers: allowed, status: 'draft', late: false, evaluations: [] };
      }
      const saved = db.update((x) => ({ ...x, submissions: [...x.submissions.filter((y) => y.id !== next.id), next] }));
      return saved.ok ? ok(undefined) : saved;
    },

    async submit(homeworkId) {
      const s = withStudent();
      if (!s.ok) return s;
      const hw = reachable(s.value.d, homeworkId, s.value.student);
      if (!hw) return invalid();
      const existing = s.value.d.submissions.find((x) => x.homeworkId === hw.id && x.studentId === s.value.student);
      if (existing?.status === 'submitted') return ok({ late: existing.late });
      const submittedAt = clock.now().toISOString();
      const late = isLate(submittedAt, hw.dueAt);
      const answers = existing?.answers ?? {};
      const sub: Submission = {
        id: (existing?.id ?? newId('sub', rng)) as Submission['id'], homeworkId: hw.id, studentId: s.value.student, source: 'link',
        answers, status: 'submitted', submittedAt, late, evaluations: evaluate(s.value.d, hw, answers),
      };
      const saved = db.update((x) => ({ ...x, submissions: [...x.submissions.filter((y) => y.id !== sub.id), sub] }));
      return saved.ok ? ok({ late }) : saved;
    },

    async ownPractice() {
      const s = withStudent();
      if (!s.ok) return s;
      const { d, student } = s.value;
      return ok(d.homework.filter((h) => h.token === token && h.kind === 'practice' && h.status === 'published' && h.targetStudentIds?.includes(student))
        .map((h) => ({ ...publicHomework(d, h), done: d.submissions.some((x) => x.homeworkId === h.id && x.studentId === student && x.status === 'submitted') })));
    },

    async ownProgress() {
      const s = withStudent();
      if (!s.ok) return s;
      const { d, student, hw } = s.value;
      const classHomework = new Set(d.homework.filter((h) => h.classId === hw.classId).map((h) => h.id));
      const mine = d.submissions.filter((x) => x.studentId === student && classHomework.has(x.homeworkId));
      const evidence = studentEvidence(mine, new Map(d.questions.map((q) => [q.id, q]))).get(student) ?? new Map();
      return ok([...evidence].map(([conceptId, counts]) => ({ conceptId, name: d.concepts.find((c) => c.id === conceptId)?.name ?? { en: conceptId }, band: reportBand(counts) })));
    },
  };
}
