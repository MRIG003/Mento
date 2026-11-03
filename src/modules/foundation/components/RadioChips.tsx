'use client';

import { useId } from 'react';

type Option<V extends string | number> = { value: V; label: string; lang?: 'en' | 'hi' };

/** A row of large pill radio buttons (native radios, so arrow keys and screen readers work). */
export function RadioChips<V extends string | number>({ legend, options, value, onChange, hint }: { legend: string; options: Option<V>[]; value: V | null; onChange: (v: V) => void; hint?: string }) {
  const name = useId();
  return (
    <fieldset className="flex flex-col gap-2">
      <legend className="mb-1 font-bold">{legend}</legend>
      {hint ? <p className="-mt-1 text-sm text-ink-muted">{hint}</p> : null}
      <div className="flex flex-wrap gap-2">
        {options.map((o) => (
          <label key={String(o.value)} lang={o.lang} className="cursor-pointer">
            <input type="radio" name={name} className="peer sr-only" checked={value === o.value} onChange={() => onChange(o.value)} />
            <span className={`flex min-h-tap min-w-tap items-center justify-center rounded-full border-2 px-4 text-lg font-bold peer-focus-visible:outline peer-focus-visible:outline-3 peer-focus-visible:outline-primary ${
              value === o.value ? 'border-primary bg-primary text-card' : 'border-line bg-card text-ink'} ${o.lang === 'hi' ? 'font-deva' : ''}`}>
              {o.label}
            </span>
          </label>
        ))}
      </div>
    </fieldset>
  );
}
