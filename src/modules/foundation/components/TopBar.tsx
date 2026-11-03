'use client';

import Link from 'next/link';
import { useI18n } from '../i18n/provider';
import { BackIcon } from './icons';
import { TopBarFrame, type TopBarFrameProps } from './TopBarFrame';

type TopBarProps = Omit<TopBarFrameProps, 'leading'> & { backHref?: string };

/** Present on every screen for every role; the language switch is never hidden (owner's prompt §11). */
export function TopBar({ backHref, ...rest }: TopBarProps) {
  const { t } = useI18n();
  const leading = backHref ? (
    <Link href={backHref} aria-label={t('common.back')} className="flex min-h-tap min-w-tap items-center justify-center rounded-full text-ink hover:bg-card">
      <BackIcon />
    </Link>
  ) : undefined;
  return <TopBarFrame {...rest} leading={leading} />;
}
