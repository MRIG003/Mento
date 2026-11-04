import {
  cryptoRandom, err, generateToken, LinkTokenSchema, newId, ok, type Clock, type LinkToken, type RandomSource, type Result, type School, type SchoolId, type Teacher, type TeacherId,
} from '@/modules/domain';
import { createDemoControls, type DemoControls } from './demo';
import { createPrincipalScope, type PrincipalScope } from './scopes/principal';
import { createStudentLinkScope, type StudentLinkScope } from './scopes/student-link';
import { createTeacherScope, type TeacherScope } from './scopes/teacher';
import type { BlobStore } from './storage/blob-store';
import type { Collections, OnboardingState, PrincipalStep, TeacherStep } from './storage/collections';
import type { Database } from './storage/database';
import { createDatabase, emptyCollections } from './storage/database';
import type { StorageDriver } from './storage/driver';

export type StepStatus = 'todo' | 'done' | 'skipped';
export type Session = Collections['session'];

export type OnboardingRepo = {
  get(): Promise<Result<OnboardingState>>;
  setTeacherStep(step: TeacherStep, status: StepStatus): Promise<Result<void>>;
  setPrincipalStep(step: PrincipalStep, status: StepStatus): Promise<Result<void>>;
  markTourSeen(id: string): Promise<Result<void>>;
};

export type SessionRepo = {
  get(): Promise<Result<Session>>;
  /** New teacher sign-up (after Preview OTP): a teacher in a new school. The phone number is not stored. */
  startTeacher(input: { name: string; schoolName: string }): Promise<Result<Teacher>>;
  /** "Try with a demo class": act as the demo teacher of the demo school. */
  useDemoTeacher(): Promise<Result<TeacherId>>;
  /** Principal joins with a school code (shown on screen in the demo). */
  startPrincipal(code: string): Promise<Result<SchoolId>>;
  signOut(): Promise<Result<void>>;
};

export type JoinScope = {
  resolve(): Promise<Result<{ classLabel: string; names: { id: string; firstName: string }[]; defaultLang: 'en' | 'hi' }>>;
  addMyName(firstName: string): Promise<Result<void>>;
};

export type Repositories = {
  database: Database;
  blobs: BlobStore | null;
  teacher(id: TeacherId): TeacherScope;
  studentLink(token: LinkToken | string): StudentLinkScope;
  principal(schoolId: SchoolId): PrincipalScope;
  onboarding: OnboardingRepo;
  session: SessionRepo;
  demo: DemoControls;
  /** Roster self-join by class join token: first names only, new names wait for the teacher (SPEC-student-link). */
  join(token: string): JoinScope;
  /** "Delete all my data on this phone": records, photos and the device session. Preferences (language, text size) stay. */
  wipeAll(): Promise<Result<void>>;
};

export const DEMO_TEACHER_ID = 't_demo' as TeacherId;
export const DEMO_SCHOOL_CODE = 'DEMO26';

/** The only way UI code reaches data (ADR-001). Swap `driver`/`blobs` for a sync adapter later without touching UI. */
export function createLocalRepositories(deps: { driver: StorageDriver; blobs: BlobStore | null; clock: Clock; rng?: RandomSource }): Repositories {
  const rng = deps.rng ?? cryptoRandom;
  const clock = deps.clock;
  const database = createDatabase({ driver: deps.driver, clock });
  const save = (change: (d: Collections) => Collections): Result<void> => {
    const r = database.update(change);
    return r.ok ? ok(undefined) : r;
  };
  const read = (): Result<Collections | null> => database.read();

  const onboarding: OnboardingRepo = {
    async get() {
      const r = read();
      if (!r.ok) return r;
      return ok(r.value?.onboarding ?? { teacher: {}, principal: {}, toursSeen: [] });
    },
    async setTeacherStep(step, status) { return save((d) => ({ ...d, onboarding: { ...d.onboarding, teacher: { ...d.onboarding.teacher, [step]: status } } })); },
    async setPrincipalStep(step, status) { return save((d) => ({ ...d, onboarding: { ...d.onboarding, principal: { ...d.onboarding.principal, [step]: status } } })); },
    async markTourSeen(id) {
      return save((d) => (d.onboarding.toursSeen.includes(id) ? d : { ...d, onboarding: { ...d.onboarding, toursSeen: [...d.onboarding.toursSeen, id].slice(-100) } }));
    },
  };

  const session: SessionRepo = {
    async get() {
      const r = read();
      if (!r.ok) return r;
      return ok(r.value?.session ?? { claims: {} });
    },
    async startTeacher({ name, schoolName }) {
      const now = clock.now().toISOString();
      const school: School = { id: newId('sch', rng) as School['id'], name: schoolName.trim().slice(0, 80) || name, code: generateToken(rng).replace(/[^A-Za-z0-9]/g, '').slice(0, 6).toUpperCase().padEnd(6, 'X'), plan: 'free' };
      const teacher: Teacher = { id: newId('t', rng) as Teacher['id'], schoolId: school.id, name: name.trim().slice(0, 60), phoneVerified: true, createdAt: now };
      const r = save((d) => ({ ...d, schools: [...d.schools, school], teachers: [...d.teachers, teacher], session: { ...d.session, role: 'teacher', teacherId: teacher.id } }));
      return r.ok ? ok(teacher) : r;
    },
    async useDemoTeacher() {
      const r = read();
      if (!r.ok) return r;
      if (!r.value?.teachers.some((t) => t.id === DEMO_TEACHER_ID)) {
        const seeded = await createDemoControls({ db: database, clock, rng }).seed();
        if (!seeded.ok) return seeded;
      }
      const s = save((d) => ({ ...d, session: { ...d.session, role: 'teacher', teacherId: DEMO_TEACHER_ID } }));
      return s.ok ? ok(DEMO_TEACHER_ID) : s;
    },
    async startPrincipal(code) {
      let r = read();
      if (!r.ok) return r;
      const wanted = code.trim().toUpperCase();
      if (wanted === DEMO_SCHOOL_CODE && !r.value?.schools.some((s) => s.code === DEMO_SCHOOL_CODE)) {
        const seeded = await createDemoControls({ db: database, clock, rng }).seed();
        if (!seeded.ok) return seeded;
        r = read();
        if (!r.ok) return r;
      }
      const school = r.value?.schools.find((s) => s.code === wanted);
      if (!school) return err('NOT_FOUND', 'school.codeUnknown');
      const s = save((d) => ({ ...d, session: { ...d.session, role: 'principal', principalSchoolId: school.id } }));
      return s.ok ? ok(school.id) : s;
    },
    async signOut() {
      return save((d) => ({ ...d, session: { claims: d.session.claims } }));
    },
  };

  return {
    database,
    blobs: deps.blobs,
    teacher: (teacherId) => createTeacherScope({ db: database, teacherId, clock, rng, ...(deps.blobs ? { blobs: deps.blobs } : {}) }),
    studentLink: (token) => createStudentLinkScope({ db: database, token, clock, rng }),
    principal: (schoolId) => createPrincipalScope({ db: database, schoolId, clock }),
    join: (token) => ({
      async resolve() {
        const r = read();
        if (!r.ok) return r;
        const c = LinkTokenSchema.safeParse(token).success ? r.value?.classes.find((x) => x.joinToken === token) : undefined;
        if (!r.value || !c) return err('NOT_FOUND', 'link.invalid');
        return ok({ classLabel: `${c.grade}${c.section}`, defaultLang: c.defaultLang, names: r.value.students.filter((s) => s.classId === c.id && s.status === 'active').map((s) => ({ id: s.id, firstName: s.firstName })) });
      },
      async addMyName(firstName) {
        const r = read();
        if (!r.ok) return r;
        const c = LinkTokenSchema.safeParse(token).success ? r.value?.classes.find((x) => x.joinToken === token) : undefined;
        if (!r.value || !c) return err('NOT_FOUND', 'link.invalid');
        const name = firstName.normalize('NFC').replace(/\s+/g, ' ').trim().slice(0, 30);
        if (!name) return err('VALIDATION', 'error.validation');
        const roster = r.value.students.filter((s) => s.classId === c.id);
        if (roster.some((s) => s.firstName.toLocaleLowerCase() === name.toLocaleLowerCase())) return ok(undefined);
        if (roster.length >= 80) return err('VALIDATION', 'error.roster.full');
        const student = { id: newId('stu', rng) as never, classId: c.id, firstName: name, status: 'pending' as const, createdAt: clock.now().toISOString() };
        return save((d) => ({ ...d, students: [...d.students, student] }));
      },
    }),
    onboarding,
    session,
    demo: createDemoControls({ db: database, clock, rng }),
    async wipeAll() {
      const r = database.replace(emptyCollections(clock.now().toISOString()));
      if (deps.blobs) await deps.blobs.clear();
      return r.ok ? ok(undefined) : r;
    },
  };
}
