'use client';

import type { Checklist } from '@/modules/data';
import { Card, useI18n } from '@/modules/foundation';
import { Sticker, type StickerKind } from './Sticker';

const STEPS: { key: keyof Checklist; sticker: StickerKind }[] = [
  { key: 'createClass', sticker: 'paperclip' },
  { key: 'shareJoin', sticker: 'stamp' },
  { key: 'publishHomework', sticker: 'rubber' },
  { key: 'seeInsight', sticker: 'highlighter' },
  { key: 'sendPractice', sticker: 'seal' },
];

/** Five steps, a sticker for each, hidden once all are done (SPEC-desk). */
export function StarterChecklist({ checklist }: { checklist: Checklist }) {
  const { t } = useI18n();
  const done = STEPS.filter((s) => checklist[s.key]).length;
  if (done === STEPS.length) return null;
  return (
    <Card title={t('checklist.title')} titleId="starter-checklist">
      <p className="-mt-1 mb-3 text-sm font-bold text-ink-muted">{t('checklist.progress', { done })}</p>
      <ol className="flex flex-col gap-2">
        {STEPS.map((s, i) => {
          const earned = checklist[s.key];
          return (
            <li key={s.key} className="flex items-center gap-3">
              <Sticker kind={s.sticker} earned={earned} />
              <div className="flex min-w-0 flex-col">
                {/* No strikethrough: it collides with the Devanagari headline stroke. A check mark marks done steps. */}
                <span className={`font-bold ${earned ? 'text-ink-muted' : ''}`}>{`${earned ? '✓' : `${i + 1}.`} ${t(`checklist.${s.key}`)}`}</span>
                <span className="text-sm text-ink-muted">{earned ? t(`checklist.done.${s.key}`) : t('checklist.stepTodo')}</span>
              </div>
              <span className="sr-only">{earned ? t('checklist.stepDone') : t('checklist.stepTodo')}</span>
            </li>
          );
        })}
      </ol>
    </Card>
  );
}
