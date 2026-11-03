'use client';

import { useI18n } from '../i18n/provider';

export type Status = 'stuck' | 'getting-there' | 'on-track' | 'not-enough';

const META: Record<Status, { key: 'status.stuck' | 'status.gettingThere' | 'status.onTrack' | 'status.notEnough'; mark: string; dot: string }> = {
  stuck: { key: 'status.stuck', mark: '▲', dot: 'text-bad' },
  'getting-there': { key: 'status.gettingThere', mark: '◆', dot: 'text-warn' },
  'on-track': { key: 'status.onTrack', mark: '●', dot: 'text-ok' },
  'not-enough': { key: 'status.notEnough', mark: '○', dot: 'text-ink-muted' },
};

/** Status as a word plus a shape-coded mark: never colour alone (owner's prompt §5). Text stays ink for contrast. */
export function StatusWord({ status, className = '' }: { status: Status; className?: string }) {
  const { t } = useI18n();
  const meta = META[status];
  return (
    <span className={`inline-flex items-center gap-1 text-sm font-bold text-ink ${className}`}>
      <span aria-hidden="true" className={meta.dot}>{meta.mark}</span>
      {t(meta.key)}
    </span>
  );
}
