'use client';

import { useState } from 'react';
import { newId, cryptoRandom, type Concept, type Question } from '@/modules/domain';
import { Button, RadioChips, Sheet, inputClass, useI18n } from '@/modules/foundation';
import type { Services } from '@/modules/services';
import { emptyDraft, toQuestion, type QuestionDraft } from '../lib/draft';
import { BilingualField } from './BilingualField';
import { VariantChips } from './VariantChips';

type Props = { open: boolean; onClose: () => void; concepts: Concept[]; services: Services | null; onSave: (q: Question) => Promise<void> };

/** Teacher's own question: plain text only, bilingual, with a key and accepted variants (SPEC-homework). */
export function QuestionEditor({ open, onClose, concepts, services, onSave }: Props) {
  const { t, lang } = useI18n();
  const [draft, setDraft] = useState<QuestionDraft>(() => emptyDraft('mcq', concepts[0]?.id ?? ''));
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const set = (patch: Partial<QuestionDraft>) => { setDraft((d) => ({ ...d, ...patch })); setError(null); };
  const name = (c: Concept) => c.name[lang] ?? c.name.en ?? c.name.hi ?? c.id;

  const save = async () => {
    const r = toQuestion(draft, newId('q', cryptoRandom));
    if (!r.ok) { setError(t(r.error.messageKey)); return; }
    setBusy(true);
    await onSave(r.value);
    setBusy(false);
    setDraft(emptyDraft(draft.type, draft.conceptId));
    onClose();
  };

  return (
    <Sheet open={open} onClose={onClose} title={t('editor.title')}>
      <div className="flex flex-col gap-5">
        <RadioChips legend={t('editor.type')} value={draft.type} onChange={(type) => set({ type })}
          options={[{ value: 'mcq', label: t('create.type.mcq') }, { value: 'fill', label: t('create.type.fill') }, { value: 'short', label: t('create.type.short') }, { value: 'photo', label: t('create.type.photo') }]} />
        <BilingualField label={t('editor.prompt')} value={draft.prompt} onChange={(prompt) => set({ prompt })} services={services} multiline maxLength={300} />
        {concepts.length > 1 ? <RadioChips legend={t('editor.concept')} value={draft.conceptId} onChange={(conceptId) => set({ conceptId })} options={concepts.map((c) => ({ value: c.id, label: name(c) }))} /> : null}

        {draft.type === 'mcq' ? (
          <fieldset className="flex flex-col gap-3">
            <legend className="mb-1 font-bold">{t('editor.options')}</legend>
            {draft.options.map((o, i) => (
              <div key={i} className="flex flex-col gap-2 rounded-xl border-2 border-line p-3">
                <div className="flex items-start gap-2">
                  <input type="radio" name="editor-correct" aria-label={t('editor.correct', { n: i + 1 })} checked={draft.correct === i} onChange={() => set({ correct: i })} className="mt-3 h-6 w-6 shrink-0 accent-primary" />
                  <div className="min-w-0 flex-1">
                    <BilingualField label={t('editor.option', { n: i + 1 })} value={o.text} maxLength={80} services={services}
                      onChange={(text) => set({ options: draft.options.map((x, j) => (j === i ? { ...x, text } : x)) })} />
                  </div>
                </div>
                {draft.correct !== i ? (
                  <label className="text-sm font-bold text-ink-muted">{t('editor.meaning')}
                    <input className={`${inputClass} mt-1 text-base`} maxLength={120} value={o.meaning} onChange={(e) => set({ options: draft.options.map((x, j) => (j === i ? { ...x, meaning: e.target.value } : x)) })} />
                  </label>
                ) : null}
                {draft.options.length > 2 ? (
                  <Button variant="quiet" onClick={() => set({ options: draft.options.filter((_, j) => j !== i), correct: draft.correct === i ? null : draft.correct !== null && draft.correct > i ? draft.correct - 1 : draft.correct })}>{t('editor.removeOption', { n: i + 1 })}</Button>
                ) : null}
              </div>
            ))}
            {draft.options.length < 5 ? <Button variant="secondary" onClick={() => set({ options: [...draft.options, { text: { en: '', hi: '' }, meaning: '' }] })}>{t('editor.addOption')}</Button> : null}
          </fieldset>
        ) : null}

        {draft.type === 'fill' ? (
          <div className="flex flex-col gap-3">
            <label className="font-bold">{t('editor.answer')}<input className={`${inputClass} mt-1`} maxLength={40} value={draft.answer} onChange={(e) => set({ answer: e.target.value })} /></label>
            <label className="flex min-h-tap items-center gap-3 font-bold"><input type="checkbox" className="h-5 w-5 accent-primary" checked={draft.numeric} onChange={(e) => set({ numeric: e.target.checked })} />{t('editor.numeric')}</label>
            <VariantChips values={draft.variants} onChange={(variants) => set({ variants })} />
          </div>
        ) : null}

        {draft.type === 'short' ? (
          <fieldset className="flex flex-col gap-3">
            <legend className="mb-1 font-bold">{t('editor.keyPoints')}</legend>
            {draft.keyPoints.map((k, i) => (
              <BilingualField key={i} label={t('editor.keyPoint', { n: i + 1 })} value={k} maxLength={80} services={services} onChange={(v) => set({ keyPoints: draft.keyPoints.map((x, j) => (j === i ? v : x)) })} />
            ))}
            {draft.keyPoints.length < 4 ? <Button variant="secondary" onClick={() => set({ keyPoints: [...draft.keyPoints, { en: '', hi: '' }] })}>{t('editor.addVariant')}</Button> : null}
            <RadioChips legend={t('editor.minKeyPoints', { n: draft.minKeyPoints })} value={draft.minKeyPoints} onChange={(minKeyPoints) => set({ minKeyPoints })}
              options={draft.keyPoints.map((_, i) => ({ value: i + 1, label: String(i + 1) }))} />
          </fieldset>
        ) : null}

        {draft.type === 'photo' ? <p className="rounded-xl bg-paper p-3 text-sm">{t('editor.photoNote')}</p> : null}

        {error ? <p role="alert" className="font-bold text-bad">{error}</p> : null}
        <Button onClick={save} busy={busy}>{t('editor.save')}</Button>
      </div>
    </Sheet>
  );
}
