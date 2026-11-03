/**
 * The stored database shape (ADR-001): one versioned envelope under `mento:db`.
 * Bump CURRENT_SCHEMA_VERSION only together with a migration in migrations.ts (and ask first: SPEC §7).
 */
import * as z from 'zod/mini';
import {
  ClassIdSchema, ClassSchema, ConceptSchema, ConsentSchema, HomeworkIdSchema, HomeworkSchema, PracticeSetSchema, QuestionIdSchema,
  QuestionSchema, ReminderSchema, SchoolIdSchema, SchoolSchema, StudentIdSchema, StudentSchema, SubjectIdSchema, SubjectSchema,
  SubmissionSchema, TeacherIdSchema, TeacherSchema, BilingualSchema,
} from '@/modules/domain';

export const DB_KEY = 'mento:db';
export const CURRENT_SCHEMA_VERSION = 2;

const isoDate = z.string().check(z.maxLength(40), z.refine((v) => !Number.isNaN(Date.parse(v))));

export const TemplateSchema = z.object({
  id: z.string().check(z.regex(/^[A-Za-z0-9_-]{1,64}$/)),
  teacherId: TeacherIdSchema,
  name: z.string().check(z.minLength(1), z.maxLength(60)),
  subjectId: SubjectIdSchema,
  chapter: BilingualSchema,
  questionIds: z.array(QuestionIdSchema).check(z.minLength(1), z.maxLength(30)),
  createdAt: isoDate,
});

/** Things that happened, used for "active teacher", reports opened and the Starter Checklist. No content. */
export const ActivityEventSchema = z.object({
  kind: z.enum(['results-opened', 'report-opened', 'join-link-shared', 'homework-shared', 'practice-shared', 'reminder-opened']),
  at: isoDate,
  teacherId: z.exactOptional(TeacherIdSchema),
  classId: z.exactOptional(ClassIdSchema),
  homeworkId: z.exactOptional(HomeworkIdSchema),
  studentId: z.exactOptional(StudentIdSchema),
});

const stepStatus = z.enum(['todo', 'done', 'skipped']);
export const TEACHER_STEPS = ['otp', 'profile', 'class', 'roster', 'consent', 'mission', 'firstInsight', 'firstPractice'] as const;
export const PRINCIPAL_STEPS = ['code', 'explainer', 'dashboard', 'lock', 'invite'] as const;
export const OnboardingSchema = z.object({
  teacher: z.partialRecord(z.enum(TEACHER_STEPS), stepStatus),
  principal: z.partialRecord(z.enum(PRINCIPAL_STEPS), stepStatus),
  toursSeen: z.array(z.string().check(z.maxLength(40))).check(z.maxLength(100)),
});

/** Who uses this device in which role, and which child a link holder picked (per token). Device-local. */
export const SessionSchema = z.object({
  role: z.exactOptional(z.enum(['teacher', 'principal'])),
  teacherId: z.exactOptional(TeacherIdSchema),
  principalSchoolId: z.exactOptional(SchoolIdSchema),
  claims: z.record(z.string().check(z.regex(/^[A-Za-z0-9_-]{22}$/)), StudentIdSchema),
});

export const CollectionsSchema = z.object({
  meta: z.object({ createdAt: isoDate, demo: z.boolean(), seedVersion: z.exactOptional(z.int()) }),
  schools: z.array(SchoolSchema),
  teachers: z.array(TeacherSchema),
  subjects: z.array(SubjectSchema),
  classes: z.array(ClassSchema),
  students: z.array(StudentSchema),
  concepts: z.array(ConceptSchema),
  questions: z.array(QuestionSchema),
  homework: z.array(HomeworkSchema),
  submissions: z.array(SubmissionSchema),
  practiceSets: z.array(PracticeSetSchema),
  consents: z.array(ConsentSchema),
  reminders: z.array(ReminderSchema),
  templates: z.array(TemplateSchema),
  events: z.array(ActivityEventSchema),
  onboarding: OnboardingSchema,
  session: SessionSchema,
});

export type Collections = z.infer<typeof CollectionsSchema>;
export type Template = z.infer<typeof TemplateSchema>;
export type ActivityEvent = z.infer<typeof ActivityEventSchema>;
export type OnboardingState = z.infer<typeof OnboardingSchema>;
export type TeacherStep = (typeof TEACHER_STEPS)[number];
export type PrincipalStep = (typeof PRINCIPAL_STEPS)[number];
