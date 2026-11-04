'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useCallback, useEffect, useState } from 'react';
import { useRepositories } from '@/modules/data';
import type { TeacherScope } from '@/modules/data';
import { useLive, useTeacher, type HomeworkResults, type ReviewItem } from '@/modules/data';
import { ok, type Answer, type Homework, type Question, type Result } from '@/modules/domain';
import { Badge, Button, ButtonLink, Card, EmptyState, FractionText, HighlighterMark, Icons, NameTag, PaperSkeleton, ProgressBar, Sheet, StickyNote, TopBar, translateIn, useI18n, type Status } from '@/modules/foundation';
import { useServices } from '@/modules/services';

const statusOf = (kind: string, rate: number | null): Status => (kind === 'not-enough-evidence' || rate === null ? 'not-enough' : kind === 'class-gap' ? 'stuck' : rate >= 80 ? 'on-track' : 'getting-there');

export function Results() {
  const { t } = useI18n();
  const teacher = useTeacher();
  const hwParam = useSearchParams().get('hw');
  const scope = teacher.state === 'ready' ? teacher.scope : null;

  const list = useLive(useCallback(async (): Promise<Result<Homework[]>> => (scope ? scope.listHomework() : ok([])), [scope]));
  const homework = list.state === 'ready' ? list.data.filter((h) => h.status === 'published') : [];
  const chosen = homework.find((h) => h.id === hwParam) ?? homework.find((h) => h.kind === 'homework') ?? null;

  const body = () => {
    if (teacher.state === 'signed-out') return <EmptyState title={t('desk.signedOut.title')} action={<ButtonLink href="/start/teacher">{t('desk.signedOut.start')}</ButtonLink>} />;
    if (list.state !== 'ready' || !scope) return <PaperSkeleton />;
    if (!chosen) return <EmptyState title={t('results.none')} action={<ButtonLink href="/t/create">{t('desk.create')}</ButtonLink>} />;
    return <ResultsBody scope={scope} homework={homework} chosenId={chosen.id} />;
  };

  return (
    <>
      <TopBar title={t('results.title')} badge={teacher.state === 'ready' ? <Badge kind="demo" /> : undefined} />
      <main className="mx-auto flex max-w-xl flex-col gap-5 px-4 py-5">{body()}</main>

    </>
  );

}

function ResultsBody({ scope, homework, chosenId }: { scope: TeacherScope; homework: Homework[]; chosenId: Homework['id'] }) {
  const { t, lang } = useI18n();
  const router = useRouter();
  const [view, setView] = useState<'concepts' | 'review'>('concepts');
  const results = useLive(useCallback((): Promise<Result<HomeworkResults>> => scope.getResults(chosenId), [scope, chosenId]));
  if (results.state === 'loading') return <PaperSkeleton />;
  if (results.state === 'error') return <EmptyState title={t('error.generic.title')} />;
  const data = results.data;
  return (
    <>
      <OpenedRecorder scope={scope} homeworkId={chosenId} />
      {homework.length > 1 ? (
        <label className="flex flex-col font-bold">{t('results.pickHw')}
          <select className="mt-1 min-h-tap rounded-xl border-2 border-line bg-card px-3 text-lg" value={chosenId} onChange={(e) => router.push(`/t/results?hw=${e.target.value}`)}>
            {homework.map((h) => <option key={h.id} value={h.id}>{`${h.kind === 'practice' ? '✎ ' : ''}${h.chapter[lang] ?? h.chapter.en ?? h.chapter.hi}`}</option>)}
          </select>
        </label>
      ) : null}
      <div role="tablist" className="flex gap-2">
        {(['concepts', 'review'] as const).map((v) => (
          <button key={v} type="button" role="tab" aria-selected={view === v} onClick={() => setView(v)}
            className={`min-h-tap flex-1 rounded-full border-2 px-4 font-extrabold ${view === v ? 'border-primary bg-primary text-card' : 'border-line bg-card'}`}>
            {t(v === 'concepts' ? 'results.view.concepts' : 'results.view.review')}{v === 'review' && data.review.length > 0 ? ` (${data.review.length})` : ''}
          </button>
        ))}
      </div>
      {view === 'concepts' ? <Concepts r={data} /> : <Review r={data} />}
    </>
  );
}

/** Records that the teacher opened these results (feeds the active-teacher count; no UI, no state). */
function OpenedRecorder({ scope, homeworkId }: { scope: TeacherScope; homeworkId: Homework['id'] }) {
  useEffect(() => { void scope.recordEvent('results-opened', { homeworkId }); }, [scope, homeworkId]);
  return null;
}

function Concepts({ r }: { r: HomeworkResults }) {
  const { t, lang } = useI18n();
  const teacher = useTeacher();
  const services = useServices();
  const pick = (b: { en?: string; hi?: string }) => b[lang] ?? b.en ?? b.hi ?? '';
  const focus = r.focus ? r.concepts.find((c) => c.conceptId === r.focus?.conceptId) : null;
  const names = focus ? focus.stuckStudentIds.map((id) => ({ id, name: r.rows.find((x) => x.studentId === id)?.firstName ?? '' })) : [];
  const [sheet, setSheet] = useState<null | { kind: 'review'; setId: string; qs: string[] } | { kind: 'sent'; url: string; message: string }>(null);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const mostMissed = r.mostMissed ? r.questions.find((q) => q.id === r.mostMissed?.questionId) : null;
  const mis = r.misconceptions.find((m) => m.questionId === r.mostMissed?.questionId) ?? r.misconceptions[0];
  const misText = mis ? (() => { const q = r.questions.find((x) => x.id === mis.questionId); const o = q?.type === 'mcq' ? q.options.find((x) => x.id === mis.optionId) : null; return o?.misconception ? pick(o.misconception) : ''; })() : '';

  const start = async () => {
    if (teacher.state !== 'ready' || !focus) return;
    setBusy(true);
    const d = await teacher.scope.draftPractice(r.homework.id, focus.conceptId, focus.stuckStudentIds);
    setBusy(false);
    if (!d.ok) { setErr(t(d.error.messageKey)); return; }
    setErr(null);
    setSheet({ kind: 'review', setId: d.value.id, qs: d.value.questionIds });
  };
  const approve = async () => {
    if (teacher.state !== 'ready' || sheet?.kind !== 'review' || !focus) return;
    const hw = await teacher.scope.approvePractice(sheet.setId as never);
    if (!hw.ok) return;
    const url = `${window.location.origin}/h#k=${hw.value.token}&lang=${hw.value.defaultLang}`;
    void teacher.scope.recordEvent('practice-shared', { homeworkId: hw.value.id });
    setSheet({ kind: 'sent', url, message: translateIn(hw.value.defaultLang, 'practice.message', { concept: focus.name[hw.value.defaultLang] ?? focus.name.en ?? '', link: url }) });
  };

  return (
    <>
      <StickyNote tape as="section">
        <h2 className={`text-[34px] leading-tight ${lang === 'hi' ? 'font-deva font-bold' : 'font-hand'}`}>
          {focus ? t('results.headline', { count: r.focus?.stuckCount ?? 0, concept: pick(focus.name) }) : r.concepts.every((c) => c.classStatus === 'not-enough-evidence') ? t('results.notEnough') : t('results.allGood')}
        </h2>
        <p className="mt-1 text-sm font-bold text-ink-muted">{t('results.sub', { class: r.classLabel, subject: pick(r.subjectName), submitted: r.submittedCount, total: r.totalStudents })}</p>
      </StickyNote>

      <Card title={t('results.concepts')} titleId="concepts">
        <ul className="flex flex-col gap-4">
          {r.concepts.map((c) => (
            <li key={c.conceptId}>
              <p className="mb-1 font-bold">{c.conceptId === focus?.conceptId ? <HighlighterMark>{pick(c.name)}</HighlighterMark> : pick(c.name)}</p>
              <ProgressBar label={pick(c.name)} percent={c.ratePercent} status={statusOf(c.classStatus, c.ratePercent)} />
            </li>
          ))}
        </ul>
        {focus ? (
          <div className="mt-4 flex flex-col gap-1 rounded-xl bg-paper p-3 text-sm">
            <p className="font-bold">{t('results.evidence', { correct: focus.counts.correct, attempted: focus.counts.attempted })}</p>
            {r.mostMissed && mostMissed ? <p>{t('results.mostMissed', { wrong: r.mostMissed.wrong, attempted: r.mostMissed.attempted })}: <FractionText text={pick(mostMissed.prompt)} /></p> : null}
            {mis && misText ? <p>{t('results.misconception', { count: mis.count, of: mis.of, text: misText })}</p> : null}
          </div>
        ) : null}
      </Card>

      {focus && names.length > 0 ? (
        <section aria-labelledby="needs">
          <h2 id="needs" className="caps mb-3 text-xs font-extrabold text-ink-muted">{t('results.needsHelp')}</h2>
          <ul className="flex flex-wrap gap-3">{names.map((n, i) => <NameTag key={n.id} as="li" id={n.id} name={n.name} animate delayMs={i * 70} />)}</ul>
          {err ? <p role="alert" className="mt-3 font-bold text-bad">{err}</p> : null}
          <div className="mt-5 flex flex-col items-center gap-1">
            <Button icon={<Icons.PencilIcon />} onClick={start} busy={busy}>{t('results.givePractice', { count: names.length })}</Button>
            <Badge kind="demo" />
          </div>
        </section>
      ) : null}

      <Sheet open={sheet !== null} onClose={() => setSheet(null)} title={sheet?.kind === 'sent' ? t('practice.sent') : t('practice.title')}>
        {sheet?.kind === 'review' ? (
          <div className="flex flex-col gap-3">
            <p className="font-bold">{t('practice.for', { names: names.map((n) => n.name).join(', ') })}</p>
            <ol className="flex list-decimal flex-col gap-2 pl-5">{sheet.qs.map((id) => { const q = r.questions.find((x) => x.id === id); return <li key={id} className="font-bold">{q ? <FractionText text={pick(q.prompt)} /> : id}</li>; })}</ol>
            <Button onClick={approve}>{t('practice.approve')}</Button>
          </div>
        ) : null}
        {sheet?.kind === 'sent' && services ? (
          <div className="flex flex-col gap-3">
            <p>{t('practice.sentBody')}</p>
            <p className="break-all rounded-xl bg-paper p-3 font-mono text-sm">{sheet.url}</p>
            <a href={services.share.whatsappUrl(sheet.message)} target="_blank" rel="noopener noreferrer" className="inline-flex min-h-pill items-center justify-center rounded-full bg-primary px-6 text-lg font-extrabold text-card">{t('share.whatsapp')}</a>
            <Button variant="secondary" onClick={() => services.share.copyLink(sheet.url)}>{t('share.copy')}</Button>
          </div>
        ) : null}
      </Sheet>
    </>
  );
}

function Review({ r }: { r: HomeworkResults }) {
  const { t, lang } = useI18n();
  const teacher = useTeacher();
  const pick = (b: { en?: string; hi?: string }) => b[lang] ?? b.en ?? b.hi ?? '';
  if (r.review.length === 0) return <EmptyState title={t('results.reviewNone')} />;
  const mark = (item: ReviewItem, v: 'correct' | 'incorrect') => { if (teacher.state === 'ready') void teacher.scope.overrideEvaluation(item.submissionId, item.questionId, v); };
  return (
    <ul className="flex flex-col gap-3">
      {r.review.map((item) => {
        const q = r.questions.find((x) => x.id === item.questionId);
        return (
          <li key={`${item.submissionId}-${item.questionId}`}><Card>
            <p className="text-sm font-bold text-ink-muted">{item.firstName}</p>
            {q ? <p className="font-bold"><FractionText text={pick(q.prompt)} /></p> : null}
            {item.answer && (item.answer.type === 'short' || item.answer.type === 'fill') ? <p className="my-2 rounded-xl bg-paper p-3">{item.answer.text}</p> : null}
            {item.answer?.type === 'photo' && q ? <PhotoReview answer={item.answer} question={q} name={item.firstName} /> : null}
            {item.reasonKey ? <p className="text-sm text-ink-muted">{t(item.reasonKey as never)}</p> : null}
            <div className="mt-3 flex gap-2">
              <Button className="flex-1" onClick={() => mark(item, 'correct')}>{t('results.markRight')}</Button>
              <Button variant="secondary" className="flex-1" onClick={() => mark(item, 'incorrect')}>{t('results.markWrong')}</Button>
            </div>
          </Card></li>
        );
      })}
    </ul>
  );
}

/** The child's notebook photo (kept on this phone) and the simulated reader's suggestion. The teacher decides. */
function PhotoReview({ answer, question, name }: { answer: Extract<Answer, { type: 'photo' }>; question: Question; name: string }) {
  const { t } = useI18n();
  const repos = useRepositories();
  const services = useServices();
  const [url, setUrl] = useState<string | null>(null);
  const [suggestion, setSuggestion] = useState<'correct' | 'incorrect' | 'unreadable' | null>(null);

  useEffect(() => {
    let revoke: string | null = null;
    let cancelled = false;
    void (async () => {
      const blob = await repos?.blobs?.get(answer.photoRef);
      if (!blob?.ok || cancelled) return;
      revoke = URL.createObjectURL(blob.value);
      setUrl(revoke);
      const read = await services?.reader.read({ photo: blob.value, question, qualityScore: answer.qualityScore });
      if (read?.ok && !cancelled) setSuggestion(read.value.suggestion);
    })();
    return () => { cancelled = true; if (revoke) URL.revokeObjectURL(revoke); };
  }, [repos, services, answer.photoRef, answer.qualityScore, question]);

  const key = { correct: 'cap.reader.correct', incorrect: 'cap.reader.incorrect', unreadable: 'cap.reader.unreadable' } as const;
  return (
    <div className="my-2 flex flex-col gap-2">
      {/* eslint-disable-next-line @next/next/no-img-element -- local blob URL */}
      {url ? <img src={url} alt={t('cap.photoOf', { name })} className="max-h-80 w-full rounded-xl border-2 border-line object-contain" /> : <PaperSkeleton lines={2} />}
      {suggestion ? <p className="flex items-center gap-2 text-sm font-bold"><Badge kind="preview" />{`${t('cap.reader')}: ${t(key[suggestion])}`}</p> : null}
    </div>
  );
}
