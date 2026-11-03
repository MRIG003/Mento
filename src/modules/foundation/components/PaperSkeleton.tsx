'use client';

import { useI18n } from '../i18n/provider';

/** Ruled-paper loading state: lines that fill left to right. No spinners on content (creative brief §5). */
export function PaperSkeleton({ lines = 4 }: { lines?: number }) {
  const { t, ready } = useI18n();
  return (
    <div role="status" className="flex flex-col gap-4 rounded-card bg-card/60 p-5">
      {/* Before the language is known (prerender), say nothing rather than guess the wrong language. */}
      <span className="sr-only">{ready ? t('common.loading') : ''}</span>
      {Array.from({ length: lines }, (_, i) => (
        <span
          key={i}
          aria-hidden="true"
          className="block h-3 animate-paper-fill rounded-full bg-[length:200%_100%]"
          style={{
            width: `${[92, 78, 85, 60, 70][i % 5]}%`,
            backgroundImage: 'linear-gradient(90deg, var(--color-line) 0%, var(--color-dot) 50%, var(--color-line) 100%)',
          }}
        />
      ))}
    </div>
  );
}
