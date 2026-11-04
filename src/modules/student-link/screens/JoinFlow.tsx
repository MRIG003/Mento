'use client';

import { useCallback, useState, useSyncExternalStore } from 'react';
import { useLive, useRepositories, type Repositories } from '@/modules/data';
import { Button, Card, EmptyState, Field, NameTag, PaperSkeleton, TopBarFrame, inputClass, useI18n } from '@/modules/foundation';

const subscribeHash = (n: () => void) => { window.addEventListener('hashchange', n); return () => window.removeEventListener('hashchange', n); };

/** Roster self-join: children tap their name, or add it for the teacher to approve. First names only. */
export function JoinFlow() {
  const { t } = useI18n();
  const repos = useRepositories();
  const hash = useSyncExternalStore(subscribeHash, () => window.location.hash, () => '');
  const token = new URLSearchParams(hash.replace(/^#/, '')).get('k') ?? '';
  const live = useLive(useCallback((r: Repositories) => r.join(token).resolve(), [token]));
  const [typing, setTyping] = useState(false);
  const [name, setName] = useState('');
  const [sent, setSent] = useState<string | null>(null);
  const header = <TopBarFrame title={t('join.title')} />;

  if (!repos || live.state === 'loading') return <>{header}<main className="mx-auto max-w-xl px-4 py-6"><PaperSkeleton /></main></>;
  if (live.state === 'error') return <>{header}<main className="mx-auto max-w-xl px-4 py-10"><EmptyState title={t('link.invalid')} /></main></>;

  const add = async () => {
    const r = await repos.join(token).addMyName(name);
    if (r.ok) setSent(name.trim());
  };

  return (
    <>
      {header}
      <main className="mx-auto flex max-w-xl flex-col gap-4 px-4 py-6">
        <h2 className="text-2xl font-extrabold">{`${live.data.classLabel} · ${t('join.pick')}`}</h2>
        {sent ? <Card><p className="text-lg font-bold" role="status">{t('join.waiting', { name: sent })}</p></Card> : (
          <>
            <ul className="flex flex-wrap gap-3">
              {live.data.names.map((n) => <li key={n.id}><button type="button" onClick={() => setSent(n.firstName)} className="rounded-lg"><NameTag id={n.id} name={n.firstName} /></button></li>)}
            </ul>
            {typing ? (
              <Card>
                <Field label={t('join.typeName')}>{(c) => <input {...c} className={inputClass} autoComplete="given-name" maxLength={30} value={name} onChange={(e) => setName(e.target.value)} onKeyDown={(e) => { if (e.key === 'Enter') void add(); }} />}</Field>
                <Button className="mt-3" onClick={add} disabled={!name.trim()}>{t('join.add')}</Button>
              </Card>
            ) : <Button variant="secondary" onClick={() => setTyping(true)}>{t('join.missing')}</Button>}
          </>
        )}
      </main>
    </>
  );
}
