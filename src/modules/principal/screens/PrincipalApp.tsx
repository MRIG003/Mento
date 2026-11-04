'use client';

import Link from 'next/link';
import { useCallback, useState, type ReactNode } from 'react';
import { useLive, usePrincipal, type LockState, type PrincipalOverview, type Range } from '@/modules/data';
import { err, formatIndianNumber, ok, type Result } from '@/modules/domain';
import { Badge, Button, ButtonLink, Card, EmptyState, PaperSkeleton, StatusWord, StickyNote, TopBar, useI18n } from '@/modules/foundation';
import { useServices } from '@/modules/services';

type Data = { overview: PrincipalOverview; lock: LockState };
type Section = 'overview' | 'gaps' | 'classes' | 'plan';

const statusOf = (kind: string): 'stuck' | 'on-track' | 'not-enough' => (kind === 'class-gap' ? 'stuck' : kind === 'ok' ? 'on-track' : 'not-enough');

/** One screen component for the four principal tabs; aggregates only, never children or teachers (SPEC-principal). */
export function PrincipalApp({ section }: { section: Section }) {
  const { t, lang } = useI18n();
  const principal = usePrincipal();
  const [range, setRange] = useState<Range>('this-term');
  const scope = principal.state === 'ready' ? principal.scope : null;
  const live = useLive(useCallback(async (): Promise<Result<Data | null>> => {
    if (!scope) return ok(null);
    const [overview, lock] = await Promise.all([scope.overview(range), scope.lockState()]);
    if (!overview.ok) return overview;
    if (!lock.ok) return err(lock.error.code, lock.error.messageKey);
    return ok({ overview: overview.value, lock: lock.value });
  }, [scope, range]));

  const title = t(`tab.principal.${section}`);
  if (principal.state === 'signed-out') {
    return <><TopBar title={title} /><main className="mx-auto max-w-xl px-4 py-6"><EmptyState title={t('p.start.title')} action={<ButtonLink href="/start/principal">{t('p.start.join')}</ButtonLink>} /></main></>;
  }
  const data = live.state === 'ready' ? live.data : null;
  const locked = data ? !data.lock.unlocked && (section === 'gaps' || section === 'classes') : false;

  return (
    <>
      <TopBar title={title} badge={data ? <Badge kind="demo" /> : undefined} />
      <main className="mx-auto flex max-w-xl flex-col gap-5 px-4 py-5">
        {live.state === 'error' ? <EmptyState title={t('error.generic.title')} body={t(live.error.messageKey)} /> : null}
        {!data && live.state !== 'error' ? <PaperSkeleton /> : null}
        {data && (section === 'overview' || section === 'gaps' || section === 'classes') ? (
          <div role="group" aria-label={t('p.range.term')} className="flex gap-2">
            {(['this-week', 'this-term'] as const).map((r) => (
              <button key={r} type="button" aria-pressed={range === r} onClick={() => setRange(r)}
                className={`min-h-tap flex-1 rounded-full border-2 px-4 font-extrabold ${range === r ? 'border-primary bg-primary text-card' : 'border-line bg-card'}`}>
                {t(r === 'this-week' ? 'p.range.week' : 'p.range.term')}
              </button>
            ))}
          </div>
        ) : null}
        {data && section === 'overview' ? <Overview data={data} lang={lang} /> : null}
        {data && section === 'gaps' ? <Locked locked={locked} count={data.lock.activeTeachers}><Gaps data={data} /></Locked> : null}
        {data && section === 'classes' ? <Locked locked={locked} count={data.lock.activeTeachers}><Classes data={data} /></Locked> : null}
        {data && section === 'plan' ? <Plan data={data} /> : null}
      </main>
    </>
  );
}

function Overview({ data, lang }: { data: Data; lang: 'en' | 'hi' }) {
  const { t } = useI18n();
  const o = data.overview;
  const n = (v: number) => formatIndianNumber(v, lang);
  const subject = (id: string) => o.subjectNames[id]?.[lang] ?? o.subjectNames[id]?.en ?? id;
  const tiles: { key: string; label: string; value: string; help?: string }[] = [
    { key: 'active', label: t('p.tile.active'), value: `${n(data.lock.activeTeachers)}`, help: t('p.tile.activeHelp') },
    { key: 'hw', label: t('p.tile.homework'), value: n(o.homeworkSet) },
    { key: 'sub', label: t('p.tile.submission'), value: o.submissionRate === null ? '–' : `${o.submissionRate}%` },
    { key: 'ps', label: t('p.tile.practiceSent'), value: n(o.practiceSent) },
    { key: 'pd', label: t('p.tile.practiceDone'), value: n(o.practiceCompleted) },
    { key: 'pr', label: t('p.tile.reports'), value: n(o.parentReportsOpened) },
  ];
  return (
    <>
      <StickyNote tape as="section">
        <p className={`text-[30px] leading-tight ${lang === 'hi' ? 'font-deva font-bold' : 'font-hand'}`}>
          {o.headline ? t('p.headline', { class: o.headline.classLabel, subject: subject(o.headline.subjectId) }) : t('p.headline.none')}
        </p>
        <p className="mt-1 text-sm font-bold text-ink-muted">{o.schoolName}</p>
      </StickyNote>
      <ul className="grid grid-cols-2 gap-3">
        {tiles.map((x) => (
          <li key={x.key} className="rounded-card bg-card p-4 shadow-card">
            <p className="text-3xl font-extrabold tabular-nums">{x.value}</p>
            <p className="mt-1 text-sm font-bold text-ink-muted">{x.label}</p>
            {x.help ? <p className="mt-1 text-xs text-ink-muted">{x.help}</p> : null}
          </li>
        ))}
      </ul>
      {!data.lock.unlocked ? (
        <Card><p className="font-extrabold">{t('p.locked.title')}</p><p className="mt-1 text-ink-muted">{t('p.locked.body', { count: data.lock.activeTeachers })}</p>
          <div className="mt-3 flex flex-wrap gap-2"><Link href="/p/gaps" className="min-h-tap font-extrabold text-primary underline underline-offset-4">{t('tab.principal.gaps')}</Link><Link href="/p/plan" className="min-h-tap font-extrabold text-primary underline underline-offset-4">{t('p.locked.see')}</Link></div></Card>
      ) : null}
    </>
  );
}

/** Locked sections show a clearly labelled, blurred demo preview plus the rule and the live count. */
function Locked({ locked, count, children }: { locked: boolean; count: number; children: ReactNode }) {
  const { t } = useI18n();
  if (!locked) return <>{children}</>;
  return (
    <div className="flex flex-col gap-4">
      <Card><p className="text-lg font-extrabold">{t('p.locked.title')}</p><p className="mt-1">{t('p.locked.body', { count })}</p>
        <ButtonLink href="/p/plan" variant="secondary" className="mt-3">{t('p.locked.see')}</ButtonLink></Card>
      <p className="flex items-center gap-2 text-sm font-bold text-ink-muted"><Badge kind="demo" />{t('p.locked.preview')}</p>
      <div aria-hidden="true" inert className="pointer-events-none select-none blur-[5px]">{children}</div>
    </div>
  );
}

function Gaps({ data }: { data: Data }) {
  const { t, lang } = useI18n();
  const o = data.overview;
  const subject = (id: string) => o.subjectNames[id]?.[lang] ?? o.subjectNames[id]?.en ?? id;
  const statusKey = { stuck: 'status.stuck', 'on-track': 'status.onTrack', 'not-enough': 'status.notEnough' } as const;
  return (
    <Card title={t('p.gaps.title')} titleId="gaps">
      <ul className="grid grid-cols-2 gap-3">
        {o.gapCells.map((c) => {
          const st = statusOf(c.status);
          const label = c.ratePercent === null ? t('p.gaps.cellNone', { class: c.classLabel, subject: subject(c.subjectId) }) : t('p.gaps.cell', { class: c.classLabel, subject: subject(c.subjectId), rate: c.ratePercent, status: t(statusKey[st]) });
          return (
            <li key={`${c.classLabel}-${c.subjectId}`} tabIndex={0} aria-label={label} className={`rounded-xl p-3 ${st === 'stuck' ? 'bg-highlight' : st === 'on-track' ? 'bg-tag-mint' : 'bg-paper'}`}>
              <p className="font-extrabold">{`${c.classLabel} · ${subject(c.subjectId)}`}</p>
              <p className="text-2xl font-extrabold tabular-nums">{c.ratePercent === null ? '–' : `${c.ratePercent}%`}</p>
              <StatusWord status={st} />
            </li>
          );
        })}
      </ul>
    </Card>
  );
}

function Classes({ data }: { data: Data }) {
  const { t, lang } = useI18n();
  const o = data.overview;
  const subject = (id: string) => o.subjectNames[id]?.[lang] ?? o.subjectNames[id]?.en ?? id;
  const needing = o.gapCells.filter((c) => c.status === 'class-gap');
  return (
    <Card title={t('p.classes.title')} titleId="classes">
      {needing.length === 0 ? <p>{t('p.classes.none')}</p> : (
        <ul className="flex flex-col gap-3">
          {needing.map((c) => (
            <li key={`${c.classLabel}-${c.subjectId}`} className="rounded-xl bg-paper p-3">
              <p className="font-extrabold">{`${c.classLabel} · ${subject(c.subjectId)} · ${c.ratePercent ?? 0}%`}</p>
              {c.weakestConceptId && o.conceptNames[c.weakestConceptId] ? <p className="text-ink-muted">{t('p.classes.weakest', { concept: o.conceptNames[c.weakestConceptId]?.[lang] ?? o.conceptNames[c.weakestConceptId]?.en ?? '' })}</p> : null}
            </li>
          ))}
        </ul>
      )}
    </Card>
  );
}

function Plan({ data }: { data: Data }) {
  const { t, lang } = useI18n();
  const services = useServices();
  const [note, setNote] = useState<string | null>(null);
  const trial = async () => {
    const r = await services?.payments.startTrial('sch_demo' as never);
    if (r?.ok) setNote(t('p.plan.trialStarted', { date: new Intl.DateTimeFormat(lang === 'hi' ? 'hi-IN' : 'en-IN', { dateStyle: 'medium', numberingSystem: 'latn' }).format(new Date(r.value.trialEndsAt)) }));
  };
  const quote = async () => {
    const r = await services?.payments.requestUpgrade('sch_demo' as never, 106);
    if (r?.ok) setNote(t('p.plan.quote', { students: 106, low: formatIndianNumber(r.value.quoteRangeInr[0], lang), high: formatIndianNumber(r.value.quoteRangeInr[1], lang) }));
  };
  return (
    <>
      <Card title={t('p.plan.free')} titleId="free"><p>{t('p.plan.freeList')}</p></Card>
      <StickyNote color="mint" rotate={0.7} as="section"><h2 className="text-lg font-extrabold">{t('p.plan.school')}</h2><p className="mt-1">{t('p.plan.schoolList')}</p>
        <p className="mt-2 text-sm font-bold">{t('p.plan.price')}</p></StickyNote>
      <p className="flex items-center gap-2 text-sm font-bold"><Badge kind="preview" />{t('p.plan.noCard')}</p>
      <div className="flex flex-col gap-2"><Button onClick={trial}>{t('p.plan.trial')}</Button><Button variant="secondary" onClick={quote}>{t('p.plan.upgrade')}</Button></div>
      {note ? <p role="status" className="rounded-xl bg-card p-3 font-bold">{note}</p> : null}
      <p className="text-sm text-ink-muted">{t('p.locked.body', { count: data.lock.activeTeachers })}</p>
    </>
  );
}
