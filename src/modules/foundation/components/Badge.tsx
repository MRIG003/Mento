'use client';

import { useI18n } from '../i18n/provider';

export type BadgeKind = 'demo' | 'preview' | 'late';

const LOOK: Record<BadgeKind, string> = {
  // Rubber-stamp look: words, never colour alone.
  demo: 'border-dashed border-ink-muted text-ink-muted',
  preview: 'border-primary text-primary',
  late: 'border-ink text-ink',
};
const LABEL = { demo: 'common.demoData', preview: 'common.preview', late: 'common.late' } as const;

export function Badge({ kind, className = '' }: { kind: BadgeKind; className?: string }) {
  const { t } = useI18n();
  return (
    <span className={`inline-flex shrink-0 items-center rounded-md border-2 bg-card/70 px-2 py-0.5 caps text-xs font-extrabold ${LOOK[kind]} ${className}`}>
      {t(LABEL[kind])}
    </span>
  );
}
