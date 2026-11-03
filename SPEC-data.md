# SPEC-data

Module id: `data` · Depends on: `domain` · Consumers: all feature modules.

## Objective
The only module that touches storage. It provides role-scoped, validated, versioned access to Mento's data, so that a
Supabase adapter can later replace the local adapter without UI changes, and role boundaries hold even if a UI
bug asks for too much.

## Contracts

```ts
/** Low-level, swappable. Local impl = localStorage (JSON) ; tests = in-memory fake. */
export type StorageDriver = {
  read(key: string): string | null;
  write(key: string, value: string): Result<void>;        // STORAGE error on quota/blocked storage
  remove(key: string): void;
  subscribe(listener: (key: string) => void): () => void; // cross-tab via 'storage' event
};
/** Photos and other blobs. Local impl = IndexedDB (own ~50-line wrapper, no dependency). */
export type BlobStore = {
  put(blob: Blob): Promise<Result<string /* key */>>;
  get(key: string): Promise<Result<Blob>>;
  delete(key: string): Promise<void>;
};

/** Teacher sees only own classes. Every method checks ownership. */
export type TeacherScope = {
  teacherId: TeacherId;
  listClasses(): Promise<Result<ClassSummary[]>>;
  createClass(input: CreateClassInput): Promise<Result<Class>>;
  addStudents(classId: ClassId, firstNames: string[]): Promise<Result<Student[]>>;   // trims, dedupes, max 80
  listStudents(classId: ClassId): Promise<Result<Student[]>>;
  listBank(filter: { subjectId: SubjectId; chapter?: string; conceptId?: ConceptId }): Promise<Result<Question[]>>;
  saveHomework(input: HomeworkDraftInput): Promise<Result<Homework>>;                 // draft, idempotent by id
  publishHomework(id: HomeworkId): Promise<Result<Homework>>;
  lastHomework(classId: ClassId): Promise<Result<Homework | null>>;
  saveTemplate(id: HomeworkId, name: string): Promise<Result<void>>;
  getResults(id: HomeworkId): Promise<Result<HomeworkResults>>;                       // computed via domain rules
  overrideEvaluation(sub: SubmissionId, q: QuestionId, verdict: Verdict): Promise<Result<void>>;
  recordPaperMarks(hw: HomeworkId, student: StudentId, marks: Record<QuestionId, 'correct' | 'incorrect'>): Promise<Result<void>>;
  draftPractice(hw: HomeworkId, conceptId: ConceptId, students: StudentId[]): Promise<Result<PracticeSet>>;
  approvePractice(id: PracticeSetId): Promise<Result<Homework>>;                      // publishes kind:'practice'
  recordResultsOpened(hw: HomeworkId): Promise<void>;                                 // feeds "active teacher"
  exportClassCsv(classId: ClassId): Promise<Result<string>>;                          // domain.toCsv, scope-limited
  deleteStudent(id: StudentId): Promise<Result<void>>;                                // cascades submissions, consent
};

/** What a holder of one link can do: nothing beyond that homework and that class's first names. */
export type StudentLinkScope = {
  resolve(token: LinkToken): Promise<Result<LinkContext>>;   // homework (questions without answer keys), class label, lang
  rosterFirstNames(): Promise<Result<{ id: StudentId; firstName: string }[]>>;
  claim(studentId: StudentId): Promise<Result<void>>;        // remembers the choice on this device for this token
  recordConsent(studentId: StudentId): Promise<Result<Consent>>;
  saveDraft(answers: Partial<Record<QuestionId, Answer>>): Promise<Result<void>>;   // on every change
  submit(): Promise<Result<{ late: boolean }>>;
  ownProgress(): Promise<Result<OwnProgress>>;              // own report bands only
  ownPractice(): Promise<Result<Homework[]>>;               // practice targeted at the claimed student
};

/** Principal: aggregates only. Return types contain no student or teacher identifiers. */
export type PrincipalScope = {
  overview(range: 'this-week' | 'this-term'): Promise<Result<SchoolAggregates>>;
  lockState(): Promise<Result<{ unlocked: boolean; activeTeachers: number; plan: 'free' | 'school' }>>;
};

export type Repositories = {
  teacher(id: TeacherId): TeacherScope;
  studentLink(token: LinkToken): StudentLinkScope;
  principal(schoolId: SchoolId): PrincipalScope;
  onboarding: OnboardingRepo;    // progress per role, checklist steps, coach marks seen
  settings: SettingsRepo;        // lang, text size, sound, demo mode (device-level, no personal data)
  demo: { seed(): Promise<void>; reset(): Promise<void>; runSubmissionWave(hw: HomeworkId): AsyncIterable<SubmissionId> };
};
export function createLocalRepositories(deps: { driver: StorageDriver; blobs: BlobStore; clock: Clock; rng: RandomSource }): Repositories;
```

Answer keys never leave `TeacherScope`. `LinkContext` questions are a separate type without `correctOptionId`,
`answer` or `keyPoints`. Checking a student's answers happens inside the data layer on submit (single device),
and `StudentLinkScope` exposes only the outcome bands.

## Storage layout and versioning (ADR-001)
- One envelope key `mento:db` → `{ schemaVersion: number, data: Collections }`. Device prefs live under `mento:prefs`.
- `CURRENT_SCHEMA_VERSION` constant; `migrations: Record<number, (prev: unknown) => unknown>` from N to N+1, applied in order.
- On read: `JSON.parse` in try/catch → migrate → **zod parse**. On failure: copy the raw value to `mento:db:corrupt:<iso>`,
  return `STORAGE` error, and the UI offers "Reset demo" (never silent deletion).
- Writes go through a single serialised queue; the `storage` event re-reads in other tabs, so a student tab and a
  teacher tab stay in step.
- v1 ships schema version 2, with a v1 → v2 migration (added `Homework.kind`) **so the migration path is tested from day one**.

## Seed (all labelled Demo data; generated relative to clock.now())
- School "Demo Public School"; teachers: 1 signed-in demo teacher + 3 colleagues (for the principal unlock demo).
- Classes: 6B Maths (40 students), 6A Maths (36), 5A Hindi (30). Pastel first names only, no surnames.
- Class 6 Maths bank: Fractions (adding, equivalent, comparing), Decimals (place value, comparing, adding), Basic geometry
  (angles, triangles, perimeter). ≥ 6 questions per concept, mixed types, bilingual, misconception-tagged distractors.
- Class 5 Hindi grammar sample: संज्ञा, सर्वनाम, विशेषण (bilingual instructions, Hindi answers, variant lists).
- 6B "Fractions" homework: 8 questions; 32 of 40 submitted; answers designed so the **rules** yield 6 students stuck on
  Comparing fractions (the test asserts the computed count; nothing is hard-coded in UI).
- Demo submission wave for a teacher's own first homework: generated answers from a seeded RNG with fixed proportions.

## Acceptance
- Scope tests: a TeacherScope for teacher A cannot read class B (`FORBIDDEN`); StudentLinkScope never returns answer
  keys or other students' answers; PrincipalScope output has no ids or names (type and runtime assertions).
- Migration test: a stored v1 fixture loads as v2 and parses; a corrupt value is quarantined, not deleted.
- Seed test: `getResults(6B Fractions)` → exactly 6 students stuck on Comparing fractions, via the domain rules.
- Token test: 10,000 generated tokens are unique, 22 chars, base64url.
