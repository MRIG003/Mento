'use client';

import Link from 'next/link';
import { useCallback } from 'react';
import { useLive, useTeacher, type Repositories, type TeacherScope } from '@/modules/data';
import { buildEveningWrap, ok, type Bilingual, type EveningWrap, type Result } from '@/modules/domain';
import type { Checklist } from '@/modules/data';
import { Badge, Button, ButtonLink, EmptyState, Icons, PaperSkeleton, StickyNote, TopBar, useI18n, type NoteColor } from '@/modules/foundation';
import { StarterChecklist } from '../components/StarterChecklist';

const NOTE_COLORS: NoteColor[] = ['blue', 'yellow', 'pink', 'mint', 'lilac', 'peach'];

type DeskData = { checklist: Checklist; notes: { id: string; chapter: Bilingual; submitted: number; total: number }[]; demo: boolean; wrap: { hwId: string; wrap: EveningWrap; concept: Bilingual } | null };

async function loadDesk(scope: TeacherScope, repos: Repositories): Promise<Result<DeskData>> {
  const [checklist, homework, demo] = await Promise.all([scope.checklist(), scope.listHomework(), repos.demo.isSeeded()]);
  if (!checklist.ok) return checklist;
  if (!homework.ok) return homework;
  const recent = homework.value.filter((h) => h.status === 'published' && h.kind === 'homework').slice(0, 4);
  const notes: DeskData['notes'] = [];
  for (const hw of recent) {
    const r = await scope.getResults(hw.id);
    if (r.ok) notes.push({ id: hw.id, chapter: hw.chapter, submitted: r.value.submittedCount, total: r.value.totalStudents });
  }
  // Evening Wrap: computed from the latest homework, never hand-written (SPEC-desk).
  let wrap: DeskData['wrap'] = null;
  const latest = recent[0];
  if (latest) {
    const r = await scope.getResults(latest.id);
    if (r.ok) {
      const practiceOut = homework.value.some((h) => h.kind === 'practice' && h.parentHomeworkId === latest.id);
      const focus = r.value.focus;
      const w = buildEveningWrap({
        now: new Date().toISOString(), dueAt: latest.dueAt, submitted: r.value.submittedCount, total: r.value.totalStudents,
        concepts: r.value.concepts.map((c) => ({ conceptId: c.conceptId, stuckCount: c.stuckStudentIds.length, counts: c.counts })),
        practiceSentFor: practiceOut && focus ? [focus.conceptId] : [],
      });
      const concept = w.kind === 'focus' ? r.value.concepts.find((c) => c.conceptId === w.conceptId)?.name ?? { en: '' } : { en: '' };
      wrap = { hwId: latest.id, wrap: w, concept };
    }
  }
  return ok({ checklist: checklist.value, notes, demo, wrap });
}

export function Desk() {
  const { t, lang } = useI18n();
  const teacher = useTeacher();
  const load = useCallback(
    (repos: Repositories): Promise<Result<DeskData | null>> => (teacher.state === 'ready' ? loadDesk(teacher.scope, repos) : Promise.resolve(ok(null))),
    [teacher],
  );
  const live = useLive(load);

  if (teacher.state === 'signed-out') {
    return (
      <>
        <TopBar title={t('desk.title')} />
        <main className="mx-auto max-w-xl px-4 py-6">
          <EmptyState title={t('desk.signedOut.title')} body={t('desk.signedOut.body')} action={<ButtonLink href="/start/teacher">{t('desk.signedOut.start')}</ButtonLink>} />
        </main>
      </>
    );
  }

  const data = teacher.state === 'ready' && live.state === 'ready' ? live.data : null;
  return (
    <>
      <TopBar title={t('desk.title')} badge={data?.demo ? <Badge kind="demo" /> : undefined} />
      <main className="mx-auto flex max-w-xl flex-col gap-5 px-4 py-5">
        {live.state === 'error' ? <EmptyState title={t('error.generic.title')} body={t(live.error.messageKey)} /> : null}
        {!data && live.state !== 'error' ? <PaperSkeleton /> : null}
        {data ? (
          <>
            {data.wrap ? <EveningWrapNote wrap={data.wrap} /> : null}
            {data.notes.length === 0 ? (
              <EmptyState title={t('desk.empty.title')} body={t('desk.empty.body')} action={<ButtonLink href="/t/create" icon={<Icons.PencilIcon />}>{t('desk.create')}</ButtonLink>} />
            ) : (
              <ul className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                {data.notes.map((note, i) => (
                  <StickyNote key={note.id} as="li" color={NOTE_COLORS[i % NOTE_COLORS.length] ?? 'yellow'} rotate={[-1.5, 1.2, -0.8, 1.6][i % 4] ?? 0}>
                    <p className="text-lg font-extrabold">{t('desk.note.homework', { chapter: note.chapter[lang] ?? note.chapter.en ?? note.chapter.hi ?? '', submitted: note.submitted, total: note.total })}</p>
                    <Link href={`/t/results?hw=${note.id}`} className="mt-2 inline-flex min-h-tap items-center font-extrabold text-primary underline underline-offset-4">{t('desk.note.open')}</Link>
                  </StickyNote>
                ))}
              </ul>
            )}
            <StarterChecklist checklist={data.checklist} />
            {data.notes.length > 0 ? <ButtonLink href="/t/create" icon={<Icons.PencilIcon />}>{t('desk.create')}</ButtonLink> : null}
            {data.demo && teacher.state === 'ready' ? (
              <div className="flex flex-col items-center gap-1 text-center">
                <Button variant="quiet" onClick={() => { void teacher.repos.demo.reset(); }}>{t('desk.resetDemo')}</Button>
                <p className="text-sm text-ink-muted">{t('desk.resetHint')}</p>
              </div>
            ) : null}
          </>
        ) : null}
      </main>
    </>
  );
}


function EveningWrapNote({ wrap }: { wrap: NonNullable<DeskData['wrap']> }) {
  const { t, lang } = useI18n();
  const w = wrap.wrap;
  const concept = wrap.concept[lang] ?? wrap.concept.en ?? '';
  const text = w.kind === 'focus' ? (w.practiceSent ? t('wrap.sent', { concept }) : t('wrap.focus', { concept, count: w.stuckCount }))
    : w.kind === 'waiting' ? t('wrap.waiting', { submitted: w.submitted, total: w.total }) : t('wrap.allClear');
  return (
    <StickyNote color="yellow" rotate={-1.2} tape as="section">
      <p className="caps text-xs font-extrabold text-ink-muted">{t('wrap.title')}</p>
      <p className={`mt-1 text-2xl leading-snug ${lang === 'hi' ? 'font-deva font-bold' : 'font-hand'}`}>{text}</p>
      {w.kind === 'focus' ? <Link href={`/t/results?hw=${wrap.hwId}`} className="mt-3 inline-flex min-h-tap items-center rounded-full bg-primary px-5 font-extrabold text-card">{t(w.practiceSent ? 'wrap.look' : 'wrap.send')}</Link> : null}
    </StickyNote>
  );
}
