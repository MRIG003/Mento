'use client';

import type { ReactNode } from 'react';
import { useI18n } from '../i18n/provider';
import { HelpIcon } from './icons';
import { LanguageSwitch } from './LanguageSwitch';

export type TopBarFrameProps = {
  title: string;
  /** Element before the title, e.g. a back link. */
  leading?: ReactNode;
  onHelp?: () => void;
  badge?: ReactNode;
};

/** Top bar without router imports, for light routes (student link, error/not-found). Always shows EN | हिं. */
export function TopBarFrame({ title, leading, onHelp, badge }: TopBarFrameProps) {
  const { t } = useI18n();
  return (
    <header className="sticky top-0 z-20 border-b border-line/70 bg-paper/95 backdrop-blur-sm">
      <div className="mx-auto flex min-h-16 max-w-xl items-center gap-2 px-3 py-2">
        {leading}
        <h1 className="min-w-0 flex-1 truncate text-lg font-extrabold">{title}</h1>
        {badge}
        {onHelp ? (
          <button type="button" onClick={onHelp} aria-label={t('common.help')} className="flex min-h-tap min-w-tap items-center justify-center rounded-full text-ink hover:bg-card">
            <HelpIcon />
          </button>
        ) : null}
        <LanguageSwitch />
      </div>
    </header>
  );
}
