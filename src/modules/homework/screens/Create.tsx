'use client';

import { useSearchParams } from 'next/navigation';
import { useCallback, useMemo, useState } from 'react';
import { useLive, useTeacher, type ClassSummary } from '@/modules/data';
import { ok, type Bilingual, type Concept, type Homework, type LangCode, type Question, type QuestionId, type Result } from '@/modules/domain';
import { Button, Card, EmptyState, PaperSkeleton, RadioChips, StickyNote, TopBar, useI18n, ButtonLink } from '@/modules/foundation';
import { useServices } from '@/modules/services';
import { BankPicker } from '../components/BankPicker';
import { DuePicker } from '../components/DuePicker';
import { ShareSheet } from '../components/ShareSheet';
import { homeworkMessage, homeworkUrl } from '../lib/message';
import { defaultDue, suggestQuestions } from '../lib/suggest';

type Setup = { classes: ClassSummary[]; lastDueAt: string | null };
type Bank = { concepts: Concept[]; questions: Question[] };

const chapterKey = (b: Bilingual) => b.en ?? b.hi ?? '';

export function Create() {
  const { t, lang } = useI18n();
  const params = useSearchParams();
  const mission = params.get('mission') === '1';
  const teacher = useTeacher();
  const services = useServices();
  const scope = teacher.state === 'ready' ? teacher.scope : null;

  const setup = useLive(useCallback(async (): Promise<Result<Setup | null>> => {
    if (!scope) return ok(null);
    const classes = await scope.listClasses();
    if (!classes.ok) return classes;
    const hw = await scope.listHomework();
    const last = hw.ok ? hw.value.find((h) => h.kind === 'homework') : undefined;
    return ok({ classes: classes.value, lastDueAt: last?.dueAt ?? null });
  }, [scope]));

  const [classChoice, setClassChoice] = useState<string | null>(null);
  const classes = setup.state === 'ready' && setup.data ? setup.data.classes : [];
  const current = classes.find((c) => c.class.id === classChoice) ?? classes[0] ?? null;

  const bank = useLive(useCallback(async (): Promise<Result<Bank | null>> => {
    if (!scope || !current) return ok(null);
    const [concepts, questions] = await Promise.all([scope.listConcepts(current.class.subjectId), scope.listBank({ subjectId: current.class.subjectId })]);
    if (!concepts.ok) return concepts;
    if (!questions.ok) return questions;
    // Prefer the class's own grade; fall back to the subject's whole bank.
    const sameGrade = concepts.value.filter((c) => c.grade === current.class.grade);
    const usable = sameGrade.length > 0 ? sameGrade : concepts.value;
    const ids = new Set(usable.map((c) => c.id));
    return ok({ concepts: usable, questions: questions.value.filter((q) => ids.has(q.conceptId)) });
  }, [scope, current]));

  const chapters = useMemo(() => {
    if (bank.state !== 'ready' || !bank.data) return [];
    const seen = new Map<string, Bilingual>();
    for (const c of bank.data.concepts) if (!seen.has(chapterKey(c.chapter))) seen.set(chapterKey(c.chapter), c.chapter);
    return [...seen.entries()].map(([key, name]) => ({ key, name }));
  }, [bank]);
  const [chapterChoice, setChapterChoice] = useState<string | null>(null);
  const chapter = chapters.find((c) => c.key === chapterChoice) ?? chapters[0] ?? null;

  const chapterConcepts = useMemo(
    () => (bank.state === 'ready' && bank.data && chapter ? bank.data.concepts.filter((c) => chapterKey(c.chapter) === chapter.key) : []),
    [bank, chapter],
  );
  const chapterQuestions = useMemo(
    () => (bank.state === 'ready' && bank.data ? bank.data.questions.filter((q) => chapterConcepts.some((c) => c.id === q.conceptId)) : []),
    [bank, chapterConcepts],
  );
  const suggested = useMemo(() => suggestQuestions(chapterQuestions, chapterConcepts.map((c) => c.id)), [chapterQuestions, chapterConcepts]);

  // Selection is remembered per class + chapter; untouched combinations use the suggestion.
  const selectionKey = `${current?.class.id ?? ''}|${chapter?.key ?? ''}`;
  const [selections, setSelections] = useState<Record<string, QuestionId[]>>({});
  const selected = selections[selectionKey] ?? suggested;
  const toggle = (id: QuestionId) => setSelections((s) => {
    const cur = s[selectionKey] ?? suggested;
    return { ...s, [selectionKey]: cur.includes(id) ? cur.filter((x) => x !== id) : [...cur, id] };
  });

  const [now] = useState(() => new Date());
  const baseDue = useMemo(() => defaultDue(now, setup.state === 'ready' ? setup.data?.lastDueAt ?? undefined : undefined), [now, setup]);
  const [dueChoice, setDueChoice] = useState<Date | null>(null);
  const due = dueChoice ?? baseDue;
  const [langChoice, setLangChoice] = useState<LangCode | null>(null);
  const hwLang: LangCode = langChoice ?? current?.class.defaultLang ?? lang;

  const [busy, setBusy] = useState(false);
  const [published, setPublished] = useState<Homework | null>(null);

  const reason = !current ? t('create.reason.noClass') : selected.length === 0 ? t('create.reason.noQuestions') : due.getTime() <= now.getTime() ? t('create.reason.pastDue') : null;

  const publish = async () => {
    if (!scope || !current || !chapter || reason) return;
    setBusy(true);
    const draft = await scope.saveHomework({ classId: current.class.id, chapter: chapter.name, questionIds: selected, dueAt: due.toISOString(), defaultLang: hwLang });
    const done = draft.ok ? await scope.publishHomework(draft.value.id) : draft;
    setBusy(false);
    if (done.ok) setPublished(done.value);
  };

  if (teacher.state === 'signed-out') {
    return (<><TopBar title={t('create.title')} /><main className="mx-auto max-w-xl px-4 py-6"><EmptyState title={t('desk.signedOut.title')} body={t('desk.signedOut.body')} action={<ButtonLink href="/start/teacher">{t('desk.signedOut.start')}</ButtonLink>} /></main></>);
  }

  const url = published && typeof window !== 'undefined' ? homeworkUrl(window.location.origin, published.token, published.defaultLang) : '';
  return (
    <>
      <TopBar title={t('create.title')} backHref="/t" />
      <main className="mx-auto flex max-w-xl flex-col gap-5 px-4 py-5 pb-28">
        {mission ? <StickyNote tape className="font-bold">{t('create.mission')}</StickyNote> : null}
        {setup.state !== 'ready' || !setup.data ? <PaperSkeleton /> : classes.length === 0 ? (
          <EmptyState title={t('create.reason.noClass')} action={<ButtonLink href="/start/teacher">{t('desk.signedOut.start')}</ButtonLink>} />
        ) : (
          <>
            {classes.length > 1 ? (
              <RadioChips legend={t('create.class')} value={current?.class.id ?? null} onChange={(id) => { setClassChoice(id); setChapterChoice(null); setLangChoice(null); }}
                options={classes.map((c) => ({ value: c.class.id, label: c.label }))} />
            ) : null}
            {chapters.length > 0 ? (
              <RadioChips legend={t('create.chapter')} value={chapter?.key ?? null} onChange={setChapterChoice}
                options={chapters.map((c) => ({ value: c.key, label: c.name[lang] ?? c.key }))} />
            ) : null}
            <Card title={t('create.questions')} titleId="create-questions">
              <p className="-mt-1 mb-3 text-sm font-bold" aria-live="polite">{t('create.selected', { count: selected.length })}</p>
              {bank.state !== 'ready' ? <PaperSkeleton lines={3} /> : chapterQuestions.length === 0 ? <p className="text-ink-muted">{t('create.noBank')}</p> : (
                <BankPicker concepts={chapterConcepts} questions={chapterQuestions} selected={selected} suggested={suggested} onToggle={toggle} />
              )}
            </Card>
            <Card><DuePicker value={due} base={baseDue} onChange={setDueChoice} /></Card>
            <Card>
              <RadioChips legend={t('create.lang')} value={hwLang} onChange={setLangChoice} options={[{ value: 'hi', label: 'हिन्दी', lang: 'hi' }, { value: 'en', label: 'English', lang: 'en' }]} />
            </Card>
            <div className="flex flex-col gap-2">
              {reason ? <p id="publish-reason" className="text-sm font-bold text-ink-muted">{reason}</p> : null}
              <Button onClick={publish} busy={busy} disabled={Boolean(reason)} aria-describedby={reason ? 'publish-reason' : undefined}>{t('create.publish')}</Button>
            </div>
          </>
        )}
      </main>
      {published && services && current ? (
        <ShareSheet open onClose={() => setPublished(null)} services={services} url={url} resultsHref={`/t/results?hw=${published.id}`}
          message={homeworkMessage({ lang: published.defaultLang, classLabel: current.label, subject: current.subjectName, chapter: published.chapter, dueAt: published.dueAt, url })}
          onShared={() => { void scope?.recordEvent('homework-shared', { homeworkId: published.id }); }} />
      ) : null}
    </>
  );
}
