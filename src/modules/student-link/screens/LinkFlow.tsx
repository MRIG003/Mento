'use client';

import { useCallback, useState, useSyncExternalStore } from 'react';
import { useLive, useRepositories, type LinkContext, type OwnWork, type PublicHomework, type PublicQuestion, type Repositories, type StudentLinkScope } from '@/modules/data';
import { ok, type Answer, type QuestionId, type StudentId } from '@/modules/domain';
import { Button, Card, EmptyState, FractionText, NameTag, PaperSkeleton, StickyNote, TopBarFrame, inputClass, useI18n, type Lang } from '@/modules/foundation';

const subscribeHash = (n: () => void) => { window.addEventListener('hashchange', n); return () => window.removeEventListener('hashchange', n); };

type Tab = 'today' | 'practice' | 'progress';

/** The whole child/parent flow behind one link: no account, no install (SPEC-student-link). */
export function LinkFlow() {
  const { t, source, setLang } = useI18n();
  const repos = useRepositories();
  const hash = useSyncExternalStore(subscribeHash, () => window.location.hash, () => '');
  const token = new URLSearchParams(hash.replace(/^#/, '')).get('k') ?? '';
  const scope = repos ? repos.studentLink(token) : null;
  const [tab, setTab] = useState<Tab>('today');
  const [langPicked, setLangPicked] = useState(false);

  const status = useLive(useCallback(async (r: Repositories) => {
    const s = r.studentLink(token);
    const ctx = await s.resolve();
    if (!ctx.ok) return ctx;
    const [roster, claimed] = await Promise.all([s.rosterFirstNames(), s.claimed()]);
    if (!roster.ok) return roster;
    if (!claimed.ok) return claimed;
    const consent = claimed.value ? await s.hasConsent() : ok(false);
    return ok({ ctx: ctx.value, roster: roster.value, claimed: claimed.value, consent: consent.ok ? consent.value : false });
  }, [token]));

  const header = <TopBarFrame title={t('common.appName')} />;
  if (!repos || status.state === 'loading') return <>{header}<main className="mx-auto max-w-xl px-4 py-6"><PaperSkeleton /></main></>;
  if (status.state === 'error' || !scope) {
    return <>{header}<main className="mx-auto max-w-xl px-4 py-10"><EmptyState title={t('link.invalid')} /></main></>;
  }
  const { ctx, roster, claimed, consent } = status.data;

  if (source === 'unknown' && !langPicked) {
    const choose = (l: Lang) => { setLang(l); setLangPicked(true); };
    return (
      <>{header}<main className="mx-auto flex max-w-xl flex-col gap-4 px-4 py-8">
        <h2 className="text-2xl font-extrabold">{t('link.chooseLang')}</h2>
        <button type="button" lang="hi" onClick={() => choose('hi')} className="min-h-pill rounded-full bg-primary text-xl font-extrabold text-card font-deva">{'हिन्दी'}</button>
        <button type="button" lang="en" onClick={() => choose('en')} className="min-h-pill rounded-full border-2 border-primary bg-card text-xl font-extrabold">{'English'}</button>
      </main></>
    );
  }

  if (!claimed) return <>{header}<PickName roster={roster} scope={scope} /></>;
  const me = roster.find((r) => r.id === claimed)?.firstName ?? '';
  if (!consent) {
    return (
      <>{header}<main className="mx-auto flex max-w-xl flex-col gap-4 px-4 py-6">
        <StickyNote tape as="section"><p className="text-lg font-bold">{t('link.consent')}</p></StickyNote>
        <Button onClick={() => scope.recordConsent()}>{t('link.consent.ok')}</Button>
        <a className="min-h-tap text-center font-bold text-primary underline underline-offset-4" href="/privacy">{t('link.consent.more')}</a>
      </main></>
    );
  }

  const tabs: { key: Tab; label: string }[] = [{ key: 'today', label: t('tab.student.today') }, { key: 'practice', label: t('tab.student.practice') }, { key: 'progress', label: t('tab.student.progress') }];
  return (
    <>
      <TopBarFrame title={t('link.hello', { name: me })} />
      <main className="mx-auto flex max-w-xl flex-col gap-4 px-4 pb-28 pt-4">
        {tab === 'today' ? <Player key={ctx.homework.id} scope={scope} homework={ctx.homework} ctx={ctx} /> : null}
        {tab === 'practice' ? <PracticeTab scope={scope} /> : null}
        {tab === 'progress' ? <ProgressTab scope={scope} /> : null}
        <Button variant="quiet" onClick={() => scope.release()}>{t('link.switchChild')}</Button>
      </main>
      <nav aria-label={t('common.mainNav')} className="fixed inset-x-0 bottom-0 z-20 border-t border-line bg-card/95 pb-[env(safe-area-inset-bottom)]">
        <ul className="mx-auto flex max-w-xl">
          {tabs.map((x) => (
            <li key={x.key} className="flex-1"><button type="button" aria-current={tab === x.key ? 'page' : undefined} onClick={() => setTab(x.key)}
              className={`min-h-14 w-full text-sm font-extrabold ${tab === x.key ? 'text-primary' : 'text-ink-muted'}`}>{x.label}</button></li>
          ))}
        </ul>
      </nav>
    </>
  );
}

function PickName({ roster, scope }: { roster: { id: StudentId; firstName: string }[]; scope: StudentLinkScope }) {
  const { t } = useI18n();
  const [chosen, setChosen] = useState<{ id: StudentId; firstName: string } | null>(null);
  return (
    <main className="mx-auto flex max-w-xl flex-col gap-4 px-4 py-6">
      <h2 className="text-2xl font-extrabold">{t('link.pickName')}</h2>
      {chosen ? (
        <Card>
          <p className="mb-3 text-xl font-extrabold">{t('link.confirmName', { name: chosen.firstName })}</p>
          <div className="flex flex-col gap-2">
            <Button onClick={() => scope.claim(chosen.id)}>{t('link.yes')}</Button>
            <Button variant="secondary" onClick={() => setChosen(null)}>{t('link.notMe')}</Button>
          </div>
        </Card>
      ) : (
        <ul className="flex flex-wrap gap-3">
          {roster.map((r) => (
            <li key={r.id}><button type="button" onClick={() => setChosen(r)} className="rounded-lg"><NameTag id={r.id} name={r.firstName} /></button></li>
          ))}
        </ul>
      )}
    </main>
  );
}

function Player({ scope, homework, ctx }: { scope: StudentLinkScope; homework: PublicHomework; ctx: LinkContext }) {
  const work = useLive(useCallback(() => scope.ownWork(homework.id), [scope, homework.id]));
  const [initial] = useState(() => ({ current: null as OwnWork | null }));
  if (work.state === 'loading') return <PaperSkeleton />;
  if (work.state === 'error') return <EmptyState title={'…'} />;
  initial.current ??= work.data; // restored once from this phone; later changes come from the child's own taps
  return <PlayerBody scope={scope} homework={homework} ctx={ctx} initial={initial.current} />;
}

function PlayerBody({ scope, homework, ctx, initial }: { scope: StudentLinkScope; homework: PublicHomework; ctx: LinkContext; initial: OwnWork }) {
  const { t, lang } = useI18n();
  const [answers, setAnswers] = useState<Partial<Record<QuestionId, Answer>>>(initial.answers);
  const [index, setIndex] = useState(-1); // -1 intro, 0..n-1 questions, n review
  const [result, setResult] = useState<{ late: boolean } | null>(initial.status === 'submitted' ? { late: initial.late } : null);
  const [saved, setSaved] = useState(false);
  const qs = homework.questions;
  const when = new Intl.DateTimeFormat(lang === 'hi' ? 'hi-IN' : 'en-IN', { weekday: 'short', day: 'numeric', month: 'short', hour: 'numeric', minute: '2-digit', numberingSystem: 'latn' }).format(new Date(homework.dueAt));
  const pick = (b: { en?: string; hi?: string }) => b[lang] ?? b.en ?? b.hi ?? '';

  const set = (q: PublicQuestion, a: Answer) => {
    const next = { ...answers, [q.id]: a };
    setAnswers(next);
    void scope.saveDraft(homework.id, next).then((r) => setSaved(r.ok)); // saved on every change
  };

  if (result) {
    return (
      <>
        <StickyNote tape as="section" className="text-center"><p className="text-xl font-extrabold">{t(result.late ? 'link.doneLate' : 'link.done')}</p></StickyNote>
        {!initial.closed ? <Button variant="secondary" onClick={() => { setResult(null); setIndex(0); }}>{t('link.change')}</Button> : null}
      </>
    );
  }

  if (index < 0) {
    return (
      <>
        <StickyNote tape as="section"><h2 className="text-2xl font-extrabold">{pick(homework.chapter)}</h2><p className="mt-1 font-bold text-ink-muted">{`${ctx.classLabel} · ${t('link.due', { when })}`}</p></StickyNote>
        <Button onClick={() => setIndex(0)}>{initial.status === 'draft' ? t('link.continue') : t('link.start')}</Button>
      </>
    );
  }

  if (index >= qs.length) {
    const blank = qs.filter((q) => !answers[q.id]).length;
    return (
      <>
        <Card title={t('link.reviewTitle')} titleId="rv">
          {blank > 0 ? <p className="font-bold">{t('link.reviewBlank', { count: blank })}</p> : null}
        </Card>
        <Button onClick={async () => { const r = await scope.submit(homework.id); if (r.ok) setResult(r.value); }}>{t('link.submit')}</Button>
        <Button variant="secondary" onClick={() => setIndex(qs.length - 1)}>{t('link.prev')}</Button>
      </>
    );
  }

  const q = qs[index] as PublicQuestion;
  const a = answers[q.id];
  return (
    <>
      <p className="font-bold text-ink-muted" aria-live="polite">{t('link.question', { n: index + 1, total: qs.length })}</p>
      <ol className="flex gap-1.5" aria-hidden="true">{qs.map((x, i) => <li key={x.id} className={`h-1.5 flex-1 rounded-full ${i <= index ? 'bg-primary' : 'bg-line'}`} />)}</ol>
      <Card>
        <p className="text-xl font-extrabold leading-snug"><FractionText text={pick(q.prompt)} /></p>
        <div className="mt-4 flex flex-col gap-3">
          {q.type === 'mcq' ? (
            <fieldset className="flex flex-col gap-3">
              <legend className="sr-only">{pick(q.prompt)}</legend>
              {q.options.map((o) => {
                const on = a?.type === 'mcq' && a.optionId === o.id;
                return (
                  <label key={o.id} className="cursor-pointer">
                    <input type="radio" name={q.id} className="peer sr-only" checked={on} onChange={() => set(q, { type: 'mcq', optionId: o.id })} />
                    <span className={`flex min-h-14 items-center rounded-2xl border-2 px-4 text-lg font-bold peer-focus-visible:outline peer-focus-visible:outline-3 peer-focus-visible:outline-primary ${on ? 'border-primary bg-tag-blue' : 'border-line bg-card'}`}><FractionText text={pick(o.text)} /></span>
                  </label>
                );
              })}
            </fieldset>
          ) : null}
          {q.type === 'fill' || q.type === 'short' ? (
            <label className="font-bold">{t('link.typeAnswer')}
              <input className={`${inputClass} mt-1 h-14`} inputMode={q.type === 'fill' && q.numeric ? 'decimal' : 'text'} autoComplete="off" maxLength={500}
                value={a && (a.type === 'fill' || a.type === 'short') ? a.text : ''} onChange={(e) => set(q, { type: q.type, text: e.target.value })} />
            </label>
          ) : null}
          {q.type === 'photo' ? <p className="rounded-xl bg-paper p-3 text-sm">{t('link.photoPreview')}</p> : null}
        </div>
      </Card>
      <p className="text-sm text-ink-muted" aria-live="polite">{saved ? t('link.saved') : ''}</p>
      <div className="flex gap-3">
        <Button variant="secondary" className="flex-1" onClick={() => setIndex((i) => Math.max(-1, i - 1))}>{t('link.prev')}</Button>
        <Button className="flex-1" onClick={() => setIndex((i) => i + 1)}>{index === qs.length - 1 ? t('link.review') : t('link.next')}</Button>
      </div>
    </>
  );
}

function PracticeTab({ scope }: { scope: StudentLinkScope }) {
  const { t } = useI18n();
  const list = useLive(useCallback(() => scope.ownPractice(), [scope]));
  const [open, setOpen] = useState<string | null>(null);
  if (list.state === 'loading') return <PaperSkeleton />;
  if (list.state === 'error' || list.data.length === 0) return <EmptyState title={t('link.practiceTitle')} body={t('link.practiceNone')} />;
  const active = list.data.find((p) => p.id === open);
  if (active) return <Player key={active.id} scope={scope} homework={active} ctx={{ classLabel: '', subjectName: {}, defaultLang: 'en', homework: active }} />;
  return (
    <ul className="flex flex-col gap-3">
      {list.data.map((p) => (
        <li key={p.id}><StickyNote color="mint" rotate={-0.8}>
          <p className="text-lg font-extrabold">{t('link.practiceTitle')}</p>
          {p.done ? <p className="font-bold">{t('link.practiceDone')}</p> : <Button className="mt-3" onClick={() => setOpen(p.id)}>{t('link.practiceOpen')}</Button>}
        </StickyNote></li>
      ))}
    </ul>
  );
}

function ProgressTab({ scope }: { scope: StudentLinkScope }) {
  const { t, lang } = useI18n();
  const p = useLive(useCallback(() => scope.ownProgress(), [scope]));
  if (p.state === 'loading') return <PaperSkeleton />;
  if (p.state === 'error' || p.data.length === 0) return <EmptyState title={t('link.progressTitle')} body={t('link.progressNone')} />;
  const key = { understood: 'band.understood', 'getting-there': 'band.gettingThere', 'not-yet': 'band.notYet', 'not-enough-evidence': 'band.notEnough' } as const;
  return (
    <Card title={t('link.progressTitle')} titleId="prog">
      <ul className="flex flex-col gap-3">{p.data.map((c) => <li key={c.conceptId} className="flex justify-between gap-3"><span className="font-bold">{c.name[lang] ?? c.name.en}</span><span className="font-bold text-ink-muted">{t(key[c.band])}</span></li>)}</ul>
    </Card>
  );
}
