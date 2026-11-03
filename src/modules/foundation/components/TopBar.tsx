'use client';

import Link from 'next/link';
import type { ReactNode } from 'react';
import { useI18n } from '../i18n/provider';
import { BackIcon, HelpIcon } from './icons';
import { LanguageSwitch } from './LanguageSwitch';

type TopBarProps = {
  title: string;
  backHref?: string;
  onHelp?: () => void;
  /** e.g. the "Demo data" badge */
  badge?: ReactNode;
};

/** Present on every screen for every role; the language switch is never hidden (owner's prompt §11). */
export function TopBar({ title, backHref, onHelp, badge }: TopBarProps) {
  const { t } = useI18n();
  return (
    <header className="sticky top-0 z-20 border-b border-line/70 bg-paper/95 backdrop-blur-sm">
      <div className="mx-auto flex min-h-16 max-w-xl items-center gap-2 px-3 py-2">
        {backHref ? (
          <Link href={backHref} aria-label={t('common.back')} className="flex min-h-tap min-w-tap items-center justify-center rounded-full text-ink hover:bg-card">
            <BackIcon />
          </Link>
        ) : null}
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
