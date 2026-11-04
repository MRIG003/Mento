'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { DEMO_SCHOOL_CODE, useRepositories } from '@/modules/data';
import { Badge, Button, Card, Field, PaperSkeleton, StickyNote, TopBarFrame, inputClass, useI18n } from '@/modules/foundation';

/** Principal first run: school code (demo code shown) → what Mento shows and never shows → overview. */
export function PrincipalStart() {
  const { t } = useI18n();
  const router = useRouter();
  const repos = useRepositories();
  const [code, setCode] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [joined, setJoined] = useState(false);
  const [busy, setBusy] = useState(false);

  const join = async () => {
    if (!repos) return;
    setBusy(true);
    const r = await repos.session.startPrincipal(code);
    setBusy(false);
    if (!r.ok) { setError(t(r.error.messageKey)); return; }
    setError(null);
    setJoined(true);
  };

  return (
    <>
      <TopBarFrame title={t('p.start.title')} />
      <main className="mx-auto flex max-w-xl flex-col gap-5 px-4 py-6">
        {!repos ? <PaperSkeleton /> : !joined ? (
          <Card title={t('p.start.code')} titleId="code">
            <Field label={t('p.start.code')} hint={t('p.start.codeHint', { code: DEMO_SCHOOL_CODE })} error={error}>
              {(c) => <input {...c} className={`${inputClass} uppercase`} autoCapitalize="characters" autoComplete="off" maxLength={6} value={code} onChange={(e) => { setCode(e.target.value); setError(null); }} onKeyDown={(e) => { if (e.key === 'Enter') void join(); }} />}
            </Field>
            <Button className="mt-4" onClick={join} busy={busy} disabled={code.trim().length < 6}>{t('p.start.join')}</Button>
            <p className="mt-3 flex items-center gap-2 text-sm"><Badge kind="demo" />{DEMO_SCHOOL_CODE}</p>
          </Card>
        ) : (
          <>
            <StickyNote tape as="section"><h2 className="text-xl font-extrabold">{t('p.start.explainTitle')}</h2>
              <p className="mt-3">{t('p.start.shows')}</p><p className="mt-2 font-bold">{t('p.start.never')}</p></StickyNote>
            <Button onClick={() => router.push('/p')}>{t('p.start.go')}</Button>
          </>
        )}
      </main>
    </>
  );
}
