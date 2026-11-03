/**
 * Entity schemas (SPEC-domain). Types are z.infer of these: one source of truth. Used to parse everything read
 * from storage, URLs and forms (threat model T1). zod/mini keeps the student route small (ADR-010).
 */
import * as z from 'zod/mini';

// ── primitives ──────────────────────────────────────────────────────────────────────────────────────────────
const idString = z.string().check(z.minLength(1), z.maxLength(64), z.regex(/^[A-Za-z0-9_-]+$/));
export const SchoolIdSchema = idString.brand<'SchoolId'>();
export const TeacherIdSchema = idString.brand<'TeacherId'>();
export const ClassIdSchema = idString.brand<'ClassId'>();
export const StudentIdSchema = idString.brand<'StudentId'>();
export const SubjectIdSchema = idString.brand<'SubjectId'>();
export const ConceptIdSchema = idString.brand<'ConceptId'>();
export const QuestionIdSchema = idString.brand<'QuestionId'>();
export const HomeworkIdSchema = idString.brand<'HomeworkId'>();
export const SubmissionIdSchema = idString.brand<'SubmissionId'>();
export const PracticeSetIdSchema = idString.brand<'PracticeSetId'>();
export const ConsentIdSchema = idString.brand<'ConsentId'>();
export const ReminderIdSchema = idString.brand<'ReminderId'>();
/** 128-bit base64url token, 22 chars (ADR-009). */
export const LinkTokenSchema = z.string().check(z.regex(/^[A-Za-z0-9_-]{22}$/)).brand<'LinkToken'>();

export const LangSchema = z.enum(['en', 'hi']);
const isoDate = z.string().check(z.maxLength(40), z.refine((v) => /^\d{4}-\d{2}-\d{2}T/.test(v) && !Number.isNaN(Date.parse(v)), 'invalid date'));

const text = (max: number) => z.string().check(z.maxLength(max));
/** Content in English and/or Hindi; at least one language must have visible text. */
const bilingual = (max: number) =>
  z.object({ en: z.exactOptional(text(max)), hi: z.exactOptional(text(max)) }).check(
    z.refine((b) => Boolean(b.en?.trim() || b.hi?.trim()), 'needs text in at least one language'),
  );
export const BilingualSchema = bilingual(300);

// ── school, people, classes ─────────────────────────────────────────────────────────────────────────────────
export const SchoolSchema = z.object({
  id: SchoolIdSchema,
  name: text(80).check(z.minLength(1)),
  code: z.string().check(z.regex(/^[A-Z0-9]{6}$/)),
  plan: z.enum(['free', 'school']),
  trialEndsAt: z.exactOptional(isoDate),
});

export const TeacherSchema = z.object({
  id: TeacherIdSchema,
  schoolId: SchoolIdSchema,
  name: text(60).check(z.minLength(1)),
  /** Phone is verified (Preview OTP) but never stored: data minimisation. */
  phoneVerified: z.boolean(),
  createdAt: isoDate,
});

export const SubjectSchema = z.object({ id: SubjectIdSchema, name: bilingual(40) });

export const ClassSchema = z.object({
  id: ClassIdSchema,
  schoolId: SchoolIdSchema,
  teacherId: TeacherIdSchema,
  grade: z.int().check(z.gte(3), z.lte(8)),
  section: z.string().check(z.minLength(1), z.maxLength(3)),
  subjectId: SubjectIdSchema,
  defaultLang: LangSchema,
  joinToken: LinkTokenSchema,
  createdAt: isoDate,
});

const firstName = z.string().check(z.maxLength(30), z.refine((v) => v.trim().length > 0, 'empty name'));
export const StudentSchema = z.object({
  id: StudentIdSchema,
  classId: ClassIdSchema,
  firstName,
  /** pending = added by a child through the join link, waiting for the teacher. */
  status: z.enum(['active', 'pending']),
  createdAt: isoDate,
});

export const ConceptSchema = z.object({
  id: ConceptIdSchema,
  subjectId: SubjectIdSchema,
  grade: z.int().check(z.gte(3), z.lte(8)),
  chapter: bilingual(80),
  name: bilingual(80),
});

// ── questions and answers ───────────────────────────────────────────────────────────────────────────────────
const questionBase = {
  id: QuestionIdSchema,
  conceptId: ConceptIdSchema,
  prompt: bilingual(300),
  difficulty: z.union([z.literal(1), z.literal(2), z.literal(3)]),
  source: z.enum(['bank', 'teacher']),
};
const variants = z.array(text(40).check(z.minLength(1))).check(z.maxLength(10));

const McqQuestion = z
  .object({
    ...questionBase,
    type: z.literal('mcq'),
    options: z
      .array(z.object({ id: z.string().check(z.minLength(1), z.maxLength(8)), text: bilingual(80), misconception: z.exactOptional(bilingual(120)) }))
      .check(z.minLength(2), z.maxLength(5)),
    correctOptionId: z.string(),
  })
  .check(z.refine((q) => q.options.some((o) => o.id === q.correctOptionId), 'correct option must exist'));

const FillQuestion = z.object({ ...questionBase, type: z.literal('fill'), answer: text(40).check(z.minLength(1)), acceptedVariants: variants, numeric: z.boolean() });

const ShortQuestion = z.object({
  ...questionBase,
  type: z.literal('short'),
  keyPoints: z.array(z.object({ text: bilingual(80), variants })).check(z.minLength(1), z.maxLength(4)),
  minKeyPoints: z.int().check(z.gte(1), z.lte(4)),
});

const PhotoQuestion = z.object({ ...questionBase, type: z.literal('photo'), rubric: z.exactOptional(bilingual(200)) });

export const QuestionSchema = z.discriminatedUnion('type', [McqQuestion, FillQuestion, ShortQuestion, PhotoQuestion]);

export const AnswerSchema = z.discriminatedUnion('type', [
  z.object({ type: z.literal('mcq'), optionId: z.string().check(z.maxLength(8)) }),
  z.object({ type: z.literal('fill'), text: text(500) }),
  z.object({ type: z.literal('short'), text: text(500) }),
  z.object({ type: z.literal('photo'), photoRef: z.string().check(z.maxLength(80)), qualityScore: z.number().check(z.gte(0), z.lte(1)) }),
]);

export const VerdictSchema = z.enum(['correct', 'incorrect', 'unsure', 'unanswered']);
export const EvaluationSchema = z.object({
  questionId: QuestionIdSchema,
  verdict: VerdictSchema,
  by: z.enum(['auto', 'teacher', 'reader-preview']),
  reasonKey: z.exactOptional(z.string().check(z.maxLength(80))),
  overriddenFrom: z.exactOptional(VerdictSchema),
});

// ── homework, submissions, practice ─────────────────────────────────────────────────────────────────────────
export const HomeworkSchema = z.object({
  id: HomeworkIdSchema,
  classId: ClassIdSchema,
  subjectId: SubjectIdSchema,
  chapter: bilingual(80),
  questionIds: z.array(QuestionIdSchema).check(z.minLength(1), z.maxLength(30)),
  dueAt: isoDate,
  defaultLang: LangSchema,
  status: z.enum(['draft', 'published']),
  token: LinkTokenSchema,
  kind: z.enum(['homework', 'practice']),
  parentHomeworkId: z.exactOptional(HomeworkIdSchema),
  targetStudentIds: z.exactOptional(z.array(StudentIdSchema)),
  createdAt: isoDate,
  publishedAt: z.exactOptional(isoDate),
});

export const SubmissionSchema = z.object({
  id: SubmissionIdSchema,
  homeworkId: HomeworkIdSchema,
  studentId: StudentIdSchema,
  source: z.enum(['link', 'paper', 'photo']),
  answers: z.partialRecord(QuestionIdSchema, AnswerSchema),
  status: z.enum(['draft', 'submitted']),
  submittedAt: z.exactOptional(isoDate),
  late: z.boolean(),
  evaluations: z.array(EvaluationSchema),
});

export const PracticeSetSchema = z.object({
  id: PracticeSetIdSchema,
  sourceHomeworkId: HomeworkIdSchema,
  conceptId: ConceptIdSchema,
  studentIds: z.array(StudentIdSchema).check(z.minLength(1)),
  questionIds: z.array(QuestionIdSchema).check(z.minLength(3), z.maxLength(5)),
  status: z.enum(['draft', 'approved']),
  publishedHomeworkId: z.exactOptional(HomeworkIdSchema),
  createdAt: isoDate,
});

// ── consent, reminders ──────────────────────────────────────────────────────────────────────────────────────
export const ConsentSchema = z.object({
  id: ConsentIdSchema,
  studentId: StudentIdSchema,
  grantedAt: isoDate,
  grantedBy: z.enum(['parent-on-link', 'teacher-recorded']),
  purpose: z.literal('teaching'),
  withdrawnAt: z.exactOptional(isoDate),
});

export const ReminderSchema = z.object({
  id: ReminderIdSchema,
  homeworkId: HomeworkIdSchema,
  createdAt: isoDate,
  pendingCount: z.int().check(z.gte(0)),
  lang: LangSchema,
});
