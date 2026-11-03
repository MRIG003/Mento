'use client';

import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';
import { useI18n, type TKey } from '../i18n/provider';

export type CoachStep = { target: string; textKey: TKey };
/** At most 4 coach marks per screen (owner's prompt §13), enforced by the type. */
export type CoachSteps = [CoachStep] | [CoachStep, CoachStep] | [CoachStep, CoachStep, CoachStep] | [CoachStep, CoachStep, CoachStep, CoachStep];

type Rect = { top: number; left: number; width: number; height: number };

function targetRect(target: string): Rect | null {
  const el = document.querySelector(`[data-coach="${CSS.escape(target)}"]`);
  if (!el) return null;
  el.scrollIntoView({ block: 'center', inline: 'nearest' });
  const r = el.getBoundingClientRect();
  return { top: r.top, left: r.left, width: r.width, height: r.height };
}

/**
 * Spotlight tour: one sentence per step, skippable, Esc = skip. Uses a modal <dialog> for the focus trap.
 * Targets are elements marked with data-coach="<id>"; a missing target shows the card centred.
 */
export function CoachMarks({ steps, open, onFinish }: { steps: CoachSteps; open: boolean; onFinish: (skipped: boolean) => void }) {
  const { t } = useI18n();
  const ref = useRef<HTMLDialogElement>(null);
  const [index, setIndex] = useState(0);
  const [rect, setRect] = useState<Rect | null>(null);
  const step = steps[index] ?? steps[0];
  const last = index === steps.length - 1;

  useEffect(() => {
    const dialog = ref.current;
    if (!dialog) return;
    if (open && !dialog.open) dialog.showModal();
    if (!open && dialog.open) dialog.close();
  }, [open]);

  // Measure after layout (and after scrollIntoView) in a frame callback, and again on resize.
  const measure = useCallback(() => {
    if (!open) return undefined;
    const frame = requestAnimationFrame(() => setRect(targetRect(step.target)));
    return () => cancelAnimationFrame(frame);
  }, [open, step.target]);
  useLayoutEffect(measure, [measure]);
  useEffect(() => {
    const onResize = () => { measure(); };
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, [measure]);

  const finish = (skipped: boolean) => {
    setIndex(0);
    onFinish(skipped);
  };

  const pad = 6;
  const below = rect ? rect.top + rect.height + 180 < window.innerHeight : true;
  return (
    <dialog
      ref={ref}
      aria-label={t(step.textKey)}
      onCancel={(event) => { event.preventDefault(); finish(true); }}
      className="fixed inset-0 m-0 h-full max-h-none w-full max-w-none bg-transparent p-0 backdrop:bg-transparent"
    >
      {rect ? (
        <div
          aria-hidden="true"
          className="pointer-events-none fixed rounded-2xl ring-4 ring-highlight transition-all motion-reduce:transition-none"
          style={{ top: rect.top - pad, left: rect.left - pad, width: rect.width + pad * 2, height: rect.height + pad * 2, boxShadow: '0 0 0 9999px rgb(43 43 43 / 0.5)' }}
        />
      ) : (
        <div aria-hidden="true" className="fixed inset-0 bg-ink/50" />
      )}
      <div
        className="fixed inset-x-4 mx-auto max-w-sm rounded-2xl bg-note p-4 text-ink shadow-note"
        style={rect ? (below ? { top: rect.top + rect.height + pad + 12 } : { bottom: window.innerHeight - rect.top + pad + 12 }) : { top: '35%' }}
      >
        <p className="text-sm font-bold text-ink-muted">{t('coach.step', { n: index + 1, total: steps.length })}</p>
        <p className="mt-1 text-lg font-bold">{t(step.textKey)}</p>
        <div className="mt-3 flex items-center justify-between gap-2">
          <button type="button" onClick={() => finish(true)} className="min-h-tap rounded-full px-3 font-bold text-ink underline underline-offset-4">{t('coach.skip')}</button>
          <button
            type="button"
            autoFocus
            onClick={() => (last ? finish(false) : setIndex((i) => i + 1))}
            className="min-h-tap rounded-full bg-primary px-5 font-extrabold text-card"
          >
            {t(last ? 'coach.done' : 'coach.next')}
          </button>
        </div>
      </div>
    </dialog>
  );
}
