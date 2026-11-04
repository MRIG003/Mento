'use client';

import { useId, useState } from 'react';
import { Badge, inputClass, useI18n } from '@/modules/foundation';
import type { Services } from '@/modules/services';

type Props = { label: string; value: { en: string; hi: string }; onChange: (v: { en: string; hi: string }) => void; services: Services | null; multiline?: boolean; maxLength: number };

/** One field, two languages (EN / हिं tabs). The other language can be typed or auto-translated (Preview, editable). */
export function BilingualField({ label, value, onChange, services, multiline = false, maxLength }: Props) {
  const { t, lang } = useI18n();
  const [tab, setTab] = useState<'en' | 'hi'>(lang);
  const [machine, setMachine] = useState<{ en: boolean; hi: boolean }>({ en: false, hi: false });
  const [note, setNote] = useState<string | null>(null);
  const id = useId();
  const other = tab === 'en' ? 'hi' : 'en';

  const autoTranslate = async () => {
    if (!services) return;
    const r = await services.translate.translate(value[other], other, tab);
    if (r.ok) { onChange({ ...value, [tab]: r.value.text }); setMachine({ ...machine, [tab]: true }); setNote(null); }
    else setNote(t(r.error.messageKey));
  };

  const common = {
    id, lang: tab, value: value[tab], maxLength,
    className: `${inputClass} ${tab === 'hi' ? 'font-deva' : ''} ${multiline ? 'min-h-24' : ''}`,
    onChange: (e: { target: { value: string } }) => { onChange({ ...value, [tab]: e.target.value }); setMachine({ ...machine, [tab]: false }); },
  };

  return (
    <div className="flex flex-col gap-1">
      <div className="flex items-center justify-between gap-2">
        <label htmlFor={id} className="font-bold">{label}</label>
        <div role="tablist" aria-label={t('lang.label')} className="flex rounded-full border border-line bg-card p-0.5">
          {(['en', 'hi'] as const).map((l) => (
            <button key={l} type="button" role="tab" aria-selected={tab === l} lang={l} onClick={() => setTab(l)}
              className={`min-h-tap min-w-tap rounded-full px-3 font-bold ${tab === l ? 'bg-primary text-card' : ''} ${l === 'hi' ? 'font-deva' : ''}`}>
              {l === 'en' ? t('lang.switchEn') : t('lang.switchHi')}{value[l].trim() ? ' ✓' : ''}
            </button>
          ))}
        </div>
      </div>
      {multiline ? <textarea {...common} /> : <input {...common} />}
      {!value[tab].trim() && value[other].trim() ? (
        <div className="flex flex-wrap items-center gap-2 text-sm">
          <span className="text-ink-muted">{t(tab === 'hi' ? 'editor.addHindi' : 'editor.addEnglish')}</span>
          <button type="button" onClick={autoTranslate} className="min-h-tap rounded-full border-2 border-primary px-3 font-bold text-primary">{t('editor.autoTranslate')}</button>
          <Badge kind="preview" />
        </div>
      ) : null}
      {machine[tab] ? <p className="text-sm font-bold text-warn">{t('editor.machineDraft')}</p> : null}
      {note ? <p role="status" className="text-sm text-ink-muted">{note}</p> : null}
    </div>
  );
}
