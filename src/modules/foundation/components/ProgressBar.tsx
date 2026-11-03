'use client';

import { useI18n } from '../i18n/provider';
import { StatusWord, type Status } from './StatusWord';

const BAR: Record<Exclude<Status, 'not-enough'>, string> = { 'on-track': 'bg-ok', 'getting-there': 'bg-warn', stuck: 'bg-bad' };

type ProgressBarProps = { label: string; percent: number | null; status: Status };

/** A thin bar plus the % and a status word (colour is never the only signal). `percent: null` = not enough evidence. */
export function ProgressBar({ label, percent, status }: ProgressBarProps) {
  const { t } = useI18n();
  if (percent === null || status === 'not-enough') {
    return <StatusWord status="not-enough" />;
  }
  const value = Math.round(Math.min(100, Math.max(0, percent)));
  return (
    <div className="flex w-full items-center gap-3">
      <div
        role="meter"
        aria-label={label}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={value}
        aria-valuetext={`${t('progress.percentRight', { percent: value })}, ${t(statusKey(status))}`}
        className="h-2 flex-1 overflow-hidden rounded-full bg-line"
      >
        <div className={`h-full rounded-full ${BAR[status]}`} style={{ width: `${value}%` }} />
      </div>
      <span className="w-11 text-right text-sm font-extrabold tabular-nums">{`${value}%`}</span>
    </div>
  );
}

function statusKey(status: Exclude<Status, 'not-enough'>) {
  return ({ 'on-track': 'status.onTrack', 'getting-there': 'status.gettingThere', stuck: 'status.stuck' } as const)[status];
}
