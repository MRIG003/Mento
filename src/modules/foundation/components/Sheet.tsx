'use client';

import { useEffect, useId, useRef, type ReactNode } from 'react';
import { useI18n } from '../i18n/provider';

type SheetProps = { open: boolean; onClose: () => void; title: string; children: ReactNode };

/**
 * Bottom sheet on a native modal <dialog>: the browser traps focus, makes the page inert and closes on Esc
 * (MDN: HTMLDialogElement.showModal). Focus goes back to whatever opened it.
 */
export function Sheet({ open, onClose, title, children }: SheetProps) {
  const { t } = useI18n();
  const ref = useRef<HTMLDialogElement>(null);
  const opener = useRef<Element | null>(null);
  const titleId = useId();

  useEffect(() => {
    const dialog = ref.current;
    if (!dialog) return;
    if (open && !dialog.open) {
      opener.current = document.activeElement;
      dialog.showModal();
    } else if (!open && dialog.open) {
      dialog.close();
    }
  }, [open]);

  useEffect(() => {
    if (open) return;
    if (opener.current instanceof HTMLElement) opener.current.focus();
    opener.current = null;
  }, [open]);

  return (
    <dialog
      ref={ref}
      aria-labelledby={titleId}
      onCancel={(event) => { event.preventDefault(); onClose(); }}
      onClick={(event) => { if (event.target === ref.current) onClose(); }}
      className="fixed inset-x-0 bottom-0 top-auto m-0 mx-auto max-h-[88dvh] w-full max-w-xl overflow-y-auto rounded-t-3xl bg-card p-0 text-ink shadow-note backdrop:bg-ink/45"
    >
      <div className="flex items-center gap-2 border-b border-line px-5 py-3">
        <h2 id={titleId} className="flex-1 text-lg font-extrabold">{title}</h2>
        <button type="button" onClick={onClose} className="min-h-tap rounded-full px-3 font-bold text-primary">{t('common.close')}</button>
      </div>
      <div className="px-5 py-4">{children}</div>
    </dialog>
  );
}
