'use client';

import { useRouter } from 'next/navigation';
import { useCallback, useId, useState, type ComponentType, type ReactNode, type SVGProps } from 'react';
import { useLive, useRepositories } from '@/modules/data';
import { Button, Field, Icons, StickyNote, TopBarFrame, inputClass, useI18n, type TKey } from '@/modules/foundation';
import { linkPathFromPaste } from '../lib/link';

type ChoiceProps = { href?: string; onClick?: () => void; icon: ComponentType<SVGProps<SVGSVGElement>>; titleKey: TKey; hintKey: TKey; tint: string; expanded?: boolean; controls?: string };

function Choice({ href, onClick, icon: Icon, titleKey, hintKey, tint, expanded, controls }: ChoiceProps) {
  const { t } = useI18n();
  const body: ReactNode = (
    <>
      <span aria-hidden="true" className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl ${tint}`}><Icon /></span>
      <span className="flex min-w-0 flex-col text-left">
        <span className="text-lg font-extrabold">{t(titleKey)}</span>
        <span className="text-sm text-ink-muted">{t(hintKey)}</span>
      </span>
    </>
  );
  const cls = 'flex min-h-20 w-full items-center gap-4 rounded-card bg-card p-4 shadow-card transition-transform active:scale-[0.98] motion-reduce:transform-none';
  // Plain <a> on purpose: keeps next/link off the first screen (bundle budget, docs/perf.md).
  return href ? <a href={href} className={cls}>{body}</a> : (
    <button type="button" onClick={onClick} aria-expanded={expanded} aria-controls={controls} className={cls}>{body}</button>
  );
}

/** First open: who are you? Language switch visible; the parent path never asks for an account (SPEC-onboarding). */
export function RoleChooser() {
  const { t } = useI18n();
  const router = useRouter();
  const repos = useRepositories();
  const loadSession = useCallback((r: NonNullable<typeof repos>) => r.session.get(), []);
  const session = useLive(loadSession);
  const [showPaste, setShowPaste] = useState(false);
  const [pasted, setPasted] = useState('');
  const [pasteError, setPasteError] = useState<string | null>(null);
  const [demoBusy, setDemoBusy] = useState(false);
  const pasteId = useId();

  const startDemo = async () => {
    if (!repos) return;
    setDemoBusy(true);
    const r = await repos.session.useDemoTeacher();
    if (r.ok) router.push('/t');
    else setDemoBusy(false);
  };

  const openPasted = () => {
    const path = linkPathFromPaste(pasted);
    if (!path) { setPasteError(t('role.pasteInvalid')); return; }
    window.location.assign(path);
  };

  const role = session.state === 'ready' ? session.data.role : undefined;

  return (
    <>
      <TopBarFrame title={t('common.appName')} />
      <main className="mx-auto flex max-w-xl flex-col gap-5 px-4 pb-10 pt-6">
        <StickyNote tape as="section" className="mx-1">
          <h2 className="text-2xl font-extrabold leading-snug">{t('role.title')}</h2>
          <p className="mt-1 text-ink-muted">{t('role.subtitle')}</p>
        </StickyNote>

        {role === 'teacher' ? <Button onClick={() => router.push('/t')}>{t('role.continueTeacher')}</Button> : null}
        {role === 'principal' ? <Button onClick={() => router.push('/p')}>{t('role.continuePrincipal')}</Button> : null}

        <nav aria-label={t('role.title')} className="flex flex-col gap-3">
          <Choice href="/start/teacher" icon={Icons.PencilIcon} titleKey="role.teacher" hintKey="role.teacherHint" tint="bg-tag-yellow" />
          <Choice href="/start/principal" icon={Icons.OverviewIcon} titleKey="role.principal" hintKey="role.principalHint" tint="bg-tag-blue" />
          <Choice onClick={() => setShowPaste((v) => !v)} icon={Icons.ClassIcon} titleKey="role.parent" hintKey="role.parentHint" tint="bg-tag-mint" expanded={showPaste} controls={pasteId} />
        </nav>

        {showPaste ? (
          <section id={pasteId} className="rounded-card bg-card/80 p-4">
            <p className="mb-3">{t('role.parentHelp')}</p>
            <Field label={t('role.pasteLabel')} error={pasteError}>
              {(control) => (
                <input {...control} className={inputClass} inputMode="url" autoComplete="off" value={pasted}
                  onChange={(e) => { setPasted(e.target.value); setPasteError(null); }}
                  onKeyDown={(e) => { if (e.key === 'Enter') openPasted(); }} />
              )}
            </Field>
            <Button variant="secondary" className="mt-3" onClick={openPasted}>{t('role.pasteOpen')}</Button>
          </section>
        ) : null}

        <div className="mt-2 flex flex-col items-center gap-1 text-center">
          <Button variant="quiet" onClick={startDemo} busy={demoBusy} disabled={!repos}>{t('role.demo')}</Button>
          <p className="text-sm text-ink-muted">{t('role.demoHint')}</p>
        </div>
      </main>
    </>
  );
}
