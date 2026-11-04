'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useCallback, useState } from 'react';
import { useLive, useTeacher, type ClassSummary } from '@/modules/data';
import { ok, type ClassId, type Result, type Student, type StudentId } from '@/modules/domain';
import { Badge, Button, ButtonLink, Card, EmptyState, Field, NameTag, PaperSkeleton, RadioChips, Sheet, TopBar, inputClass, useI18n, useTextSize, type TextSize } from '@/modules/foundation';
import { useServices } from '@/modules/services';

type Loaded = { summary: ClassSummary; students: Student[]; consent: Map<string, boolean>; demo: boolean };

export function ClassScreen() {
  const { t } = useI18n();
  const teacher = useTeacher();
  const services = useServices();
  const router = useRouter();
  const scope = teacher.state === 'ready' ? teacher.scope : null;
  const repos = teacher.state === 'ready' ? teacher.repos : null;
  const [textSize, setTextSize] = useTextSize();
  const [copied, setCopied] = useState(false);
  const [deleting, setDeleting] = useState<Student | null>(null);
  const [typed, setTyped] = useState('');
  const [wipeOpen, setWipeOpen] = useState(false);

  const live = useLive(useCallback(async (): Promise<Result<Loaded | null>> => {
    if (!scope || !repos) return ok(null);
    const classes = await scope.listClasses();
    if (!classes.ok) return classes;
    const summary = classes.value[0];
    if (!summary) return ok(null);
    const [students, consents, demo] = await Promise.all([scope.listStudents(summary.class.id), scope.listConsents(summary.class.id), repos.demo.isSeeded()]);
    if (!students.ok) return students;
    if (!consents.ok) return consents;
    return ok({ summary, students: students.value, consent: new Map(consents.value.map((c) => [c.studentId, !c.withdrawn])), demo });
  }, [scope, repos]));

  const download = async (classId: ClassId) => {
    if (!scope) return;
    const r = await scope.exportClassCsv(classId);
    if (!r.ok) return;
    const url = URL.createObjectURL(new Blob([r.value], { type: 'text/csv;charset=utf-8' }));
    const a = document.createElement('a');
    a.href = url;
    a.download = 'mento-class-data.csv'; // no names in the file name
    a.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  };

  const data = live.state === 'ready' ? live.data : null;
  const word = t('class.deleteWord');
  const sizes: { value: TextSize; label: string }[] = [{ value: 100, label: t('class.textSize.100') }, { value: 115, label: t('class.textSize.115') }, { value: 130, label: t('class.textSize.130') }];

  return (
    <>
      <TopBar title={t('class.title')} badge={data?.demo ? <Badge kind="demo" /> : undefined} />
      <main className="mx-auto flex max-w-xl flex-col gap-5 px-4 py-5">
        {teacher.state === 'signed-out' || (live.state === 'ready' && !data) ? <EmptyState title={t('class.none')} action={<ButtonLink href="/start/teacher">{t('desk.signedOut.start')}</ButtonLink>} /> : null}
        {teacher.state !== 'signed-out' && !data && live.state !== 'error' && live.state !== 'ready' ? <PaperSkeleton /> : null}
        {data ? (
          <>
            <Card title={`${t('class.roster')} · ${data.summary.label}`} titleId="roster">
              <ul className="flex flex-col gap-3">
                {data.students.filter((s) => s.status === 'pending').map((s) => (
                  <li key={s.id} className="flex items-center justify-between gap-2 rounded-xl bg-note p-2"><span className="font-bold">{`${t('class.pending')}: ${s.firstName}`}</span>
                    <Button variant="secondary" onClick={() => void scope?.approvePending(s.id as StudentId)}>{t('class.approve', { name: s.firstName })}</Button></li>
                ))}
                {data.students.filter((s) => s.status === 'active').map((s) => {
                  const has = data.consent.get(s.id) === true;
                  return (
                    <li key={s.id} className="flex flex-wrap items-center gap-2">
                      <NameTag id={s.id} name={s.firstName} />
                      <span className="text-sm font-bold text-ink-muted">{has ? t('class.consent.yes') : t('class.consent.no')}</span>
                      <span className="ml-auto flex gap-1">
                        <Button variant="quiet" onClick={() => void (has ? scope?.withdrawConsent(s.id) : scope?.recordConsent(s.id))}>{has ? t('class.consent.withdraw') : t('class.consent.record')}</Button>
                        <Button variant="quiet" aria-label={t('class.delete', { name: s.firstName })} onClick={() => { setDeleting(s); setTyped(''); }}>{'×'}</Button>
                      </span>
                    </li>
                  );
                })}
              </ul>
            </Card>

            <Card title={t('class.joinLink')} titleId="join">
              <p className="break-all rounded-xl bg-paper p-3 font-mono text-sm">{typeof window === 'undefined' ? '' : `${window.location.origin}/join#k=${data.summary.class.joinToken}`}</p>
              <Button variant="secondary" className="mt-3" onClick={async () => { const r = await services?.share.copyLink(`${window.location.origin}/join#k=${data.summary.class.joinToken}`); setCopied(Boolean(r?.ok)); }}>{t(copied ? 'class.copied' : 'class.copy')}</Button>
            </Card>

            <Card>
              <Button variant="secondary" onClick={() => void download(data.summary.class.id)}>{t('class.export')}</Button>
              <p className="mt-2 text-sm text-ink-muted">{t('class.exportNote')}</p>
            </Card>
          </>
        ) : null}

        <Card title={t('class.settings')} titleId="settings">
          <RadioChips legend={t('class.textSize')} value={textSize} onChange={setTextSize} options={sizes} />
          <Link href="/privacy" className="mt-4 inline-flex min-h-tap items-center font-extrabold text-primary underline underline-offset-4">{t('class.keep')}</Link>
        </Card>

        {repos ? (
          <Card>
            <Button variant="secondary" onClick={() => setWipeOpen(true)}>{t('class.wipe')}</Button>
            <p className="mt-2 text-sm text-ink-muted">{t('class.wipeBody')}</p>
          </Card>
        ) : null}
      </main>

      <Sheet open={deleting !== null} onClose={() => setDeleting(null)} title={t('class.deleteTitle', { name: deleting?.firstName ?? '' })}>
        <p className="mb-3">{t('class.deleteBody', { word })}</p>
        <Field label={word}>{(c) => <input {...c} className={inputClass} autoComplete="off" value={typed} onChange={(e) => setTyped(e.target.value)} />}</Field>
        <div className="mt-4 flex flex-col gap-2">
          <Button disabled={typed.trim().toLocaleLowerCase() !== word.toLocaleLowerCase()} onClick={async () => { if (deleting) await scope?.deleteStudent(deleting.id as StudentId); setDeleting(null); }}>{t('class.deleteConfirm')}</Button>
          <Button variant="secondary" onClick={() => setDeleting(null)}>{t('class.cancel')}</Button>
        </div>
      </Sheet>
      <Sheet open={wipeOpen} onClose={() => setWipeOpen(false)} title={t('class.wipe')}>
        <p className="mb-3">{t('class.wipeBody')}</p>
        <div className="flex flex-col gap-2">
          <Button onClick={async () => { await repos?.wipeAll(); setWipeOpen(false); router.push('/'); }}>{t('class.deleteConfirm')}</Button>
          <Button variant="secondary" onClick={() => setWipeOpen(false)}>{t('class.cancel')}</Button>
        </div>
      </Sheet>
    </>
  );
}
