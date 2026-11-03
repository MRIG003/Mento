'use client';

import { useState } from 'react';
import type { Concept, Question, QuestionId } from '@/modules/domain';
import { FractionText, useI18n, type TKey } from '@/modules/foundation';

const TYPE_KEY: Record<Question['type'], TKey> = { mcq: 'create.type.mcq', fill: 'create.type.fill', short: 'create.type.short', photo: 'create.type.photo' };

type Props = { concepts: Concept[]; questions: Question[]; selected: QuestionId[]; suggested: QuestionId[]; onToggle: (id: QuestionId) => void };

/**
 * Bank questions for the chapter, grouped by concept, with checkboxes (native, keyboard friendly).
 * Collapsed by default to the selected questions, so a returning teacher can publish without scrolling.
 */
export function BankPicker({ concepts, questions, selected, suggested, onToggle }: Props) {
  const { t, lang } = useI18n();
  const [showAll, setShowAll] = useState(false);
  const visible = showAll ? questions : questions.filter((q) => selected.includes(q.id));
  const pick = (b: { en?: string; hi?: string }) => b[lang] ?? b.en ?? b.hi ?? '';
  return (
    <div className="flex flex-col gap-4">
      {concepts.map((c) => {
        const qs = visible.filter((q) => q.conceptId === c.id);
        if (qs.length === 0) return null;
        return (
          <fieldset key={c.id} className="flex flex-col gap-2">
            <legend className="caps mb-1 text-xs font-extrabold text-ink-muted">{pick(c.name)}</legend>
            {qs.map((q) => {
              const checked = selected.includes(q.id);
              return (
                <label key={q.id} className={`flex min-h-tap cursor-pointer items-start gap-3 rounded-xl border-2 p-3 ${checked ? 'border-primary bg-card' : 'border-line bg-card/70'}`}>
                  <input type="checkbox" className="mt-1 h-5 w-5 shrink-0 accent-primary" checked={checked} onChange={() => onToggle(q.id)} />
                  <span className="flex min-w-0 flex-col gap-0.5">
                    <span className="font-bold"><FractionText text={pick(q.prompt)} /></span>
                    <span className="text-sm text-ink-muted">
                      {t(TYPE_KEY[q.type])}
                      {suggested.includes(q.id) ? ` · ${t('create.suggested')}` : ''}
                    </span>
                  </span>
                </label>
              );
            })}
          </fieldset>
        );
      })}
      <button type="button" aria-expanded={showAll} onClick={() => setShowAll((v) => !v)}
        className="min-h-tap self-start rounded-full px-2 font-extrabold text-primary underline underline-offset-4">
        {showAll ? t('create.showSelected') : t('create.showAll', { count: questions.length })}
      </button>
    </div>
  );
}
