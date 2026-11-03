import { checkAnswer, err, ok, type Clock, type HomeworkId, type Question, type RandomSource, type Result, type Submission } from '@/modules/domain';
import type { Collections } from './storage/collections';
import type { Database } from './storage/database';

/** Demo-only first names for a teacher who wants to try the flow without typing a roster (Demo data). */
export const DEMO_NAMES = ['Aarav', 'Anaya', 'Kabir', 'Diya', 'Ishaan', 'Gauri', 'Harsh', 'Ira', 'Jay', 'Kavya', 'Laksh', 'Meera', 'Neel', 'Ojas', 'Priya', 'Riya', 'Sahil', 'Tanvi', 'Uday', 'Vani', 'Yash', 'Zara', 'Aman', 'Bhumi', 'Chirag', 'Daksh', 'Ekta', 'Farhan', 'Gunjan', 'Heena'];

export type DemoControls = {
  isSeeded(): Promise<boolean>;
  /** Load the demo school (lazy import, so the seed never ships on first load). */
  seed(): Promise<Result<void>>;
  /** Start again from the demo seed. Device preferences (language, text size) are separate and kept. */
  reset(): Promise<Result<void>>;
  /** A labelled demo wave of submissions for a teacher's own homework, so a first insight appears at once. */
  submissionWave(homeworkId: HomeworkId): Promise<Result<{ submitted: number; names: string[] }>>;
};

export function createDemoControls({ db, clock, rng }: { db: Database; clock: Clock; rng: RandomSource }): DemoControls {
  const seed = async (): Promise<Result<void>> => {
    const { buildDemoSeed } = await import('./seed');
    const r = db.replace(buildDemoSeed(clock));
    return r.ok ? ok(undefined) : r;
  };

  return {
    async isSeeded() {
      const r = db.read();
      return r.ok && Boolean(r.value?.meta.seedVersion);
    },
    seed,
    reset: seed,

    async submissionWave(homeworkId) {
      const { answerFor } = await import('./seed/submissions');
      const r = db.read();
      if (!r.ok) return r;
      const d: Collections | null = r.value;
      const hw = d?.homework.find((h) => h.id === homeworkId);
      if (!d || !hw) return err('NOT_FOUND', 'error.missing');
      const done = new Set(d.submissions.filter((s) => s.homeworkId === homeworkId && s.status === 'submitted').map((s) => s.studentId));
      const roster = d.students.filter((s) => s.classId === hw.classId && s.status === 'active' && !done.has(s.id));
      if (roster.length === 0) return err('VALIDATION', 'demo.noRoster');
      const questions = new Map<string, Question>(d.questions.map((q) => [q.id, q]));
      const now = clock.now().getTime();
      const wave = roster.slice(0, Math.max(1, Math.ceil(roster.length * 0.8)));
      const bytes = rng.bytes(wave.length * hw.questionIds.length);
      const subs: Submission[] = wave.map((student, i) => {
        const struggling = i % 4 === 1; // about a quarter of the class finds this hard (demo pattern, labelled)
        const answers: Submission['answers'] = {};
        hw.questionIds.forEach((qid, j) => {
          const q = questions.get(qid);
          if (!q) return;
          const roll = (bytes[i * hw.questionIds.length + j] ?? 0) / 256;
          answers[qid] = answerFor(q, roll < (struggling ? 0.2 : 0.8), { variantIndex: i + j });
        });
        const evaluations = hw.questionIds.flatMap((qid) => {
          const q = questions.get(qid);
          const a = answers[qid];
          if (!q || !a) return [];
          const out = checkAnswer(q, a);
          return [{ questionId: qid, verdict: out.verdict, by: 'auto' as const, ...(out.reasonKey ? { reasonKey: out.reasonKey } : {}) }];
        });
        const submittedAt = new Date(now - (wave.length - i) * 7_000).toISOString();
        return { id: `sub_wave_${hw.id}_${i}` as Submission['id'], homeworkId: hw.id, studentId: student.id, source: 'link', answers, status: 'submitted', submittedAt, late: false, evaluations };
      });
      const saved = db.update((x) => ({ ...x, submissions: [...x.submissions.filter((s) => !subs.some((n) => n.id === s.id)), ...subs] }));
      return saved.ok ? ok({ submitted: subs.length, names: wave.map((s) => s.firstName) }) : saved;
    },
  };
}
