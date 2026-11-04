'use client';

import Link from 'next/link';
import { useCallback, useEffect, useState } from 'react';
import { useLive, useRepositories, type Repositories } from '@/modules/data';
import { Badge, Button, Sheet, useI18n, type TKey } from '@/modules/foundation';

const STEPS: { key: TKey; href: string | null }[] = [
  { key: 'guide.s1', href: '/t/results' },
  { key: 'guide.s2', href: '/t/results' },
  { key: 'guide.s3', href: null },
  { key: 'guide.s4', href: null },
  { key: 'guide.s5', href: '/start/principal' },
  { key: 'guide.s6', href: null },
];

/** Presenter's guide for the live demo. Only shown while demo data is loaded; opens with the "?" key (SPEC-onboarding). */
export default function DemoGuide() {
  const { t } = useI18n();
  const repos = useRepositories();
  const seeded = useLive(useCallback((r: Repositories) => r.demo.isSeeded().then((v) => ({ ok: true as const, value: v })), []));
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement | null;
      if (e.key === '?' && !(target && /^(INPUT|TEXTAREA|SELECT)$/.test(target.tagName))) setOpen((v) => !v);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  if (seeded.state !== 'ready' || !seeded.data) return null;
  return (
    <>
      <button type="button" onClick={() => setOpen(true)} className="fixed bottom-20 right-3 z-30 flex min-h-tap items-center gap-2 rounded-full bg-ink px-4 font-extrabold text-card shadow-note">
        <span aria-hidden="true">{'?'}</span>{t('guide.open')}
      </button>
      <Sheet open={open} onClose={() => setOpen(false)} title={t('guide.title')}>
        <p className="mb-3 flex items-center gap-2 text-sm font-bold"><Badge kind="demo" />{t('guide.intro')}</p>
        <ol className="flex flex-col gap-3">
          {STEPS.map((s, i) => (
            <li key={s.key} className="flex items-center gap-3">
              <span aria-hidden="true" className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-note font-extrabold">{i + 1}</span>
              <span className="flex-1 font-bold">{t(s.key)}</span>
              {s.href ? <Link href={s.href} onClick={() => setOpen(false)} className="min-h-tap rounded-full border-2 border-primary px-3 font-extrabold leading-[2.5rem] text-primary">{t('guide.go')}</Link> : null}
            </li>
          ))}
        </ol>
        <Button variant="secondary" className="mt-4" onClick={() => { void repos?.demo.reset(); setOpen(false); }}>{t('guide.reset')}</Button>
      </Sheet>
    </>
  );
}
