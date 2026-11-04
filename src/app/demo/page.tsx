'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { Suspense, useEffect, useState } from 'react';
import { DEMO_SCHOOL_CODE, useRepositories } from '@/modules/data';
import { PaperSkeleton, TopBarFrame, useI18n } from '@/modules/foundation';

/** Where /demo may send you. Anything else goes to the Desk (no open redirect). */
const TARGETS = ['/t', '/t/create', '/t/results', '/t/class', '/p', '/p/gaps', '/p/classes', '/p/plan', '/privacy'];

function DemoEntry() {
  const { t } = useI18n();
  const router = useRouter();
  const repos = useRepositories();
  const params = useSearchParams();
  const asked = params.get('to') ?? '/t';
  const to = TARGETS.includes(asked) ? asked : '/t';
  const reset = params.get('reset') === '1';
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    if (!repos) return;
    let cancelled = false;
    void (async () => {
      if (reset) await repos.demo.reset();
      const teacher = await repos.session.useDemoTeacher();
      const principal = to.startsWith('/p') ? await repos.session.startPrincipal(DEMO_SCHOOL_CODE) : null;
      if (cancelled) return;
      if (!teacher.ok || (principal && !principal.ok)) setFailed(true);
      else router.replace(to);
    })();
    return () => { cancelled = true; };
  }, [repos, reset, to, router]);

  return (
    <>
      <TopBarFrame title={t('common.appName')} />
      <main className="mx-auto max-w-xl px-4 py-8">
        {failed ? <p role="alert" className="font-bold">{t('error.generic.title')}</p> : <><p className="mb-4 font-bold" role="status">{t('demo.loading')}</p><PaperSkeleton lines={3} /></>}
      </main>
    </>
  );
}

export default function Page() {
  return <Suspense fallback={null}><DemoEntry /></Suspense>;
}
