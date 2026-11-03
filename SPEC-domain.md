# SPEC-domain

Module id: `domain` · Depends on: none · Consumers: `data`, `services`, every feature module.

## Objective
All of Mento's meaning, as pure TypeScript with no I/O: entity types and schemas, answer checking, gap rules,
practice selection, aggregates, tokens and CSV escaping. If a number appears on screen, a function here computed it.

## Scope
In: types and zod schemas for every entity; `normaliseAnswer`; `checkAnswer` per type; `tagLateness`;
`studentConceptStatus`, `classConceptStatus`, `reportBand`; `detectMisconceptions`; `selectPractice`; `recheckDelta`;
`buildEveningWrap`; `schoolAggregates`; `generateToken`; `escapeCsvCell` / `toCsv`; `formatIndianNumber`.
Out: storage, React, Date.now() (a `Clock` is injected), Math.random (a `RandomSource` is injected).

## Contracts

```ts
// ids
type Brand<T, B extends string> = T & { readonly __brand: B };
export type SchoolId = Brand<string, 'SchoolId'>;      // also TeacherId, ClassId, StudentId, SubjectId,
export type ConceptId = Brand<string, 'ConceptId'>;    // QuestionId, HomeworkId, SubmissionId, PracticeSetId,
export type LinkToken = Brand<string, 'LinkToken'>;    // ConsentId, ReminderId (same pattern)

export type Lang = 'en' | 'hi';
/** At least one language present (enforced by schema refine). */
export type Bilingual = { en?: string; hi?: string };

export type QuestionType = 'mcq' | 'fill' | 'short' | 'photo';
type QuestionBase = { id: QuestionId; conceptId: ConceptId; prompt: Bilingual; difficulty: 1 | 2 | 3; source: 'bank' | 'teacher' };
export type Question =
  | (QuestionBase & { type: 'mcq'; options: { id: string; text: Bilingual; misconception?: Bilingual }[]; correctOptionId: string })
  | (QuestionBase & { type: 'fill'; answer: string; acceptedVariants: string[]; numeric: boolean })
  | (QuestionBase & { type: 'short'; keyPoints: { text: Bilingual; variants: string[] }[]; minKeyPoints: number })
  | (QuestionBase & { type: 'photo'; rubric?: Bilingual });

export type Answer =
  | { type: 'mcq'; optionId: string }
  | { type: 'fill' | 'short'; text: string }
  | { type: 'photo'; photoRef: string; qualityScore: number };   // blob key in the photo store

export type Verdict = 'correct' | 'incorrect' | 'unsure' | 'unanswered';
export type Evaluation = {
  questionId: QuestionId; verdict: Verdict;
  by: 'auto' | 'teacher' | 'reader-preview';     // reader-preview = simulated AI, never final on its own
  reasonKey?: I18nKey; overriddenFrom?: Verdict;
};

export type Homework = {
  id: HomeworkId; classId: ClassId; subjectId: SubjectId; chapter: Bilingual; questionIds: QuestionId[];
  dueAt: string /* ISO */; defaultLang: Lang; status: 'draft' | 'published'; token: LinkToken;
  kind: 'homework' | 'practice'; parentHomeworkId?: HomeworkId; targetStudentIds?: StudentId[];
  createdAt: string; publishedAt?: string;
};
export type Submission = {
  id: SubmissionId; homeworkId: HomeworkId; studentId: StudentId; source: 'link' | 'paper' | 'photo';
  answers: Partial<Record<QuestionId, Answer>>; status: 'draft' | 'submitted';
  submittedAt?: string; late: boolean; evaluations: Evaluation[];
};
// School, Teacher, Class (grade, section, subjectId, defaultLang, joinToken), Student (firstName, classId,
// consentId?), Subject, Concept (name: Bilingual, chapter), GapFlag, PracticeSet, Consent (studentId, grantedAt,
// grantedBy: 'parent-on-link' | 'teacher-recorded', purpose, withdrawnAt?), Reminder, OnboardingProgress: full
// zod schemas in src/modules/domain/schemas.ts. Types are z.infer of the schemas (single source of truth).

export type Result<T, E = AppError> = { ok: true; value: T } | { ok: false; error: E };
export type AppError = { code: 'NOT_FOUND' | 'VALIDATION' | 'FORBIDDEN' | 'CONFLICT' | 'STORAGE' | 'UNAVAILABLE'; messageKey: I18nKey; details?: unknown };
export type Clock = { now(): Date };
export type RandomSource = { bytes(n: number): Uint8Array };   // crypto.getRandomValues in prod
```

## Rules (exact; TDD with boundary tests)

**Normalisation** `normaliseAnswer(s, { loose })`: NFC → remove U+200B-U+200D, U+2060, U+FEFF → Devanagari digits
०-९ → 0-9 → collapse whitespace → trim → lowercase (Latin) → strip trailing `. । ! ?`. `loose` also folds ँ→ं and
removes nukta (U+093C). Precomposed nukta letters (U+0958-U+095F, e.g. ज़ U+095B) are composition exclusions, so
NFC decomposes them to base + U+093C (verified in Node 22: U+095B → U+091C U+093C). Typed-precomposed and
typed-decomposed forms therefore compare equal after NFC, and `loose` then drops the nukta. Tested.

**checkAnswer(question, answer) → Verdict**
- mcq: `correct` if optionId = correctOptionId, else `incorrect`; missing → `unanswered`.
- fill: normalise both; `correct` if equal to the answer or any variant; if `numeric`, also correct when both parse to the
  same finite number (e.g. `.5` = `0.5`); else `incorrect`. Empty → `unanswered`.
- short: count key points whose text or any variant appears (normalised, loose) as a whole-word substring. ≥ minKeyPoints →
  `correct`; 0 points → `unsure` (never forced to incorrect); in between → `unsure`. The teacher decides.
- photo: always `unsure` until the teacher, or a Preview reader suggestion confirmed by the teacher, decides.

**tagLateness(submittedAt, dueAt)**: late iff submittedAt > dueAt (strictly; exactly on the due time is on time).

**Counting attempts.** An attempt is an evaluation with verdict `correct` or `incorrect` (after overrides).
`unsure` and `unanswered` do not count until resolved.

**studentConceptStatus({attempted, correct})**: attempted < 2 → `not-enough-evidence`; 2·correct < attempted →
`stuck`; else `on-track`. (1 attempt never flags; 49% flags; 50% does not.)

**classConceptStatus({attempted, correct})** over all students' attempts on that concept: attempted < 3 →
`not-enough-evidence`; 10·correct < 6·attempted (rate < 60%) → `class-gap`; else `ok`. (59% flags; 60% does not.)

**reportBand** (parent report): not-enough-evidence | not-yet (=stuck) | getting-there (50% ≤ rate < 80%) | understood (≥ 80%).

**detectMisconceptions(homework results)**: for each mcq question, a distractor chosen by ≥ 2 students that has a
`misconception` label → `{ questionId, optionId, count, of }`. The most-missed question = lowest correct rate (ties: earlier question).

**selectPractice(bank, conceptId, students, seenQuestionIds, rng)**: questions on the concept, difficulty ≤ 2, not seen;
pick 3-5 (as many as available up to 5, minimum 3 or return `Result` error `UNAVAILABLE`); deterministic given `rng`.

**recheckDelta(before, after)** per student-concept: `{ studentId, before: status, after: status }`;
"unstuck" = before `stuck` and after `on-track`. North Star counter = number of unstuck pairs per class per ISO week.

**buildEveningWrap(classResults)**: picks the concept with the most `stuck` students (ties: lowest class rate) →
`{ conceptId, stuckCount, practiceReady: boolean }`, or `{ kind: 'all-clear' }`, or `{ kind: 'waiting', submitted, total }`.

**schoolAggregates(input)** → `SchoolAggregates` containing **only** counts, rates and class×subject cells:
activeTeachers, homeworkSet, submissionRate, gapCells `{ classLabel, subjectId, rate, weakestConceptId }[]`,
practiceSent, practiceCompleted, parentReportsOpened, headline (the class × subject with the lowest rate among cells with ≥ 3 attempts).
The type contains no `StudentId`, name or teacher identifier (a type-level test asserts this).

**isDashboardUnlocked**: plan = 'school' **or** activeTeachers ≥ 3.

**generateToken(rng)**: 16 random bytes (128 bits) → base64url without padding (22 chars).

**escapeCsvCell(v)**: if the first char is one of `= + - @ \t \r`, prefix `'`; then RFC 4180 quoting (wrap in quotes if
it contains `, " \n \r`; double the quotes).

**formatIndianNumber(n, lang)**: `Intl.NumberFormat('en-IN' | 'hi-IN')` (1,20,000). Digits stay Western in both
languages for clarity (Hindi UI text, Western numerals; to confirm in native review).

## Acceptance
- Every rule above has boundary tests listed in SPEC §6; `domain` line coverage ≥ 95%.
- No import from React, Next, storage or `Date.now`/`Math.random` (enforced by lint rule).

## Open questions
- Should `short` answers with all key points missing be `incorrect` instead of `unsure`? *(Default: `unsure`. The AI never forces a score.)*
