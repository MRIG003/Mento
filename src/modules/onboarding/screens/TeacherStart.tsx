'use client';

import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { useLive, useRepositories, type Repositories } from '@/modules/data';
import { ok } from '@/modules/domain';
import { Button, EmptyState, PaperSkeleton, TopBarFrame, useI18n } from '@/modules/foundation';
import { useServices } from '@/modules/services';
import { TEACHER_FLOW, nextTeacherStep, stepNumber, type TeacherFlowStep } from '../lib/progress';
import { StepClass, StepConsent, StepOtp, StepProfile, StepRoster } from './steps';

export const MISSION_PATH = '/t/create?mission=1';

async function loadState(r: Repositories) {
  const [o, s] = await Promise.all([r.onboarding.get(), r.session.get()]);
  if (!o.ok) return o;
  if (!s.ok) return s;
  const classes = s.value.teacherId ? await r.teacher(s.value.teacherId).listClasses() : null;
  return ok({ progress: o.value.teacher, teacherId: s.value.teacherId ?? null, firstClass: classes?.ok ? classes.value[0] ?? null : null });
}

function Progress({ step }: { step: TeacherFlowStep }) {
  const { t } = useI18n();
  const { n, total } = stepNumber(step);
  return (
    <div className="flex flex-col gap-2">
      <p className="text-sm font-bold text-ink-muted" aria-live="polite">{t('onb.step', { n, total })}</p>
      <ol className="flex gap-1.5" aria-hidden="true">
        {TEACHER_FLOW.map((s, i) => <li key={s} className={`h-1.5 flex-1 rounded-full ${i < n ? 'bg-primary' : 'bg-line'}`} />)}
      </ol>
    </div>
  );
}

/** Teacher first run (SPEC-onboarding): skippable, resumable, never a wall. Steps 6-7 continue in Create and Results. */
export function TeacherStart() {
  const { t } = useI18n();
  const router = useRouter();
  const repos = useRepositories();
  const services = useServices();
  const live = useLive(loadState);

  const state = live.state === 'ready' ? live.data : null;
  const step = state ? nextTeacherStep(state.progress) : null;

  useEffect(() => {
    if (!state) return;
    if (step === 'mission') router.replace(MISSION_PATH);
    else if (step === 'firstPractice' || step === null) router.replace('/t');
  }, [state, step, router]);

  if (live.state === 'error') {
    return <main className="mx-auto max-w-xl px-4 py-10"><EmptyState title={t('error.generic.title')} body={t(live.error.messageKey)} /></main>;
  }

  const mark = (s: TeacherFlowStep, status: 'done' | 'skipped' = 'done') => repos?.onboarding.setTeacherStep(s, status);
  const skipAll = async () => {
    if (!repos) return;
    const r = await repos.session.useDemoTeacher();
    if (r.ok) router.push('/t');
  };

  let body = <PaperSkeleton />;
  if (repos && services && state && step) {
    const teacher = state.teacherId ? repos.teacher(state.teacherId) : null;
    if (step === 'otp') body = <StepOtp services={services} onDone={() => mark('otp')} />;
    else if (step === 'profile' || !teacher) body = <StepProfile repos={repos} onDone={() => mark('profile')} />;
    else if (step === 'class' || !state.firstClass) body = <StepClass teacher={teacher} onDone={() => mark('class')} />;
    else if (step === 'roster') body = <StepRoster teacher={teacher} services={services} summary={state.firstClass} onDone={() => mark('roster')} onSkip={() => mark('roster', 'skipped')} />;
    else if (step === 'consent') body = <StepConsent onDone={() => mark('consent')} />;
  }

  return (
    <>
      <TopBarFrame title={t('onb.title')} />
      <main className="mx-auto flex max-w-xl flex-col gap-5 px-4 pb-10 pt-5">
        {step ? <Progress step={step} /> : null}
        {body}
        <Button variant="quiet" onClick={skipAll}>{t('onb.skipAll')}</Button>
      </main>
    </>
  );
}
