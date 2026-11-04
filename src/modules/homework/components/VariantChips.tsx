'use client';

import { useId, useState } from 'react';
import { inputClass, useI18n } from '@/modules/foundation';

/** Accepted variants as removable chips (≤ 10 × 40 chars). */
export function VariantChips({ values, onChange }: { values: string[]; onChange: (v: string[]) => void }) {
  const { t } = useI18n();
  const [draft, setDraft] = useState('');
  const id = useId();
  const add = () => {
    const v = draft.trim().slice(0, 40);
    if (v && !values.includes(v) && values.length < 10) onChange([...values, v]);
    setDraft('');
  };
  return (
    <div className="flex flex-col gap-1">
      <label htmlFor={id} className="font-bold">{t('editor.variants')}</label>
      <p className="text-sm text-ink-muted">{t('editor.variantsHint')}</p>
      <ul className="flex flex-wrap gap-2">
        {values.map((v) => (
          <li key={v} className="flex items-center gap-1 rounded-full bg-tag-blue pl-3 font-bold">
            {v}
            <button type="button" aria-label={t('editor.removeVariant', { value: v })} onClick={() => onChange(values.filter((x) => x !== v))} className="min-h-tap min-w-tap rounded-full">{'×'}</button>
          </li>
        ))}
      </ul>
      <div className="flex gap-2">
        <input id={id} className={inputClass} value={draft} maxLength={40} onChange={(e) => setDraft(e.target.value)} onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); add(); } }} />
        <button type="button" onClick={add} className="min-h-tap shrink-0 rounded-full border-2 border-ink/80 px-4 font-bold">{t('editor.addVariant')}</button>
      </div>
    </div>
  );
}
