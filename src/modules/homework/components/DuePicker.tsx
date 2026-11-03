'use client';

import { useId } from 'react';
import { useI18n } from '@/modules/foundation';

const pad = (n: number) => String(n).padStart(2, '0');
/** Value for <input type="datetime-local"> in this device's time zone. */
export const toLocalInput = (d: Date) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;

/** Quick choices (tomorrow / day after, same time) or a custom date and time. */
export function DuePicker({ value, base, onChange }: { value: Date; base: Date; onChange: (d: Date) => void }) {
  const { t, lang } = useI18n();
  const id = useId();
  const time = new Intl.DateTimeFormat(lang === 'hi' ? 'hi-IN' : 'en-IN', { hour: 'numeric', minute: '2-digit', numberingSystem: 'latn' }).format(base);
  const dayAfter = new Date(base);
  dayAfter.setDate(dayAfter.getDate() + 1);
  const quick = [
    { label: t('create.due.tomorrow', { time }), date: base },
    { label: t('create.due.dayAfter', { time }), date: dayAfter },
  ];
  return (
    <fieldset className="flex flex-col gap-2">
      <legend className="mb-1 font-bold">{t('create.due')}</legend>
      <div className="flex flex-wrap gap-2">
        {quick.map((q) => {
          const active = q.date.getTime() === value.getTime();
          return (
            <button key={q.label} type="button" aria-pressed={active} onClick={() => onChange(q.date)}
              className={`min-h-tap rounded-full border-2 px-4 font-bold ${active ? 'border-primary bg-primary text-card' : 'border-line bg-card'}`}>
              {q.label}
            </button>
          );
        })}
      </div>
      <label htmlFor={id} className="mt-1 text-sm font-bold text-ink-muted">{t('create.due.custom')}</label>
      <input id={id} type="datetime-local" className="min-h-tap rounded-xl border-2 border-line bg-card px-3 text-lg"
        value={toLocalInput(value)} onChange={(e) => { const d = new Date(e.target.value); if (!Number.isNaN(d.getTime())) onChange(d); }} />
    </fieldset>
  );
}
