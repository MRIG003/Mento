'use client';

import Link from 'next/link';
import type { ComponentType, SVGProps } from 'react';
import { useI18n, type TKey } from '../i18n/provider';

export type TabItem = {
  key: string;
  labelKey: TKey;
  href: string;
  icon: ComponentType<SVGProps<SVGSVGElement>>;
  active: boolean;
};

/** Bottom tab bar: icon + visible label, ≥ 48 px targets, aria-current on the active tab. */
export function TabBar({ items }: { items: TabItem[] }) {
  const { t } = useI18n();
  return (
    <nav aria-label={t('common.mainNav')} className="fixed inset-x-0 bottom-0 z-20 border-t border-line bg-card/95 pb-[env(safe-area-inset-bottom)] backdrop-blur-sm">
      <ul className="mx-auto flex max-w-xl">
        {items.map(({ key, labelKey, href, icon: Icon, active }) => (
          <li key={key} className="flex-1">
            <Link
              href={href}
              aria-current={active ? 'page' : undefined}
              className={`flex min-h-14 flex-col items-center justify-center gap-0.5 px-1 text-xs font-bold leading-tight ${
                active ? 'text-primary' : 'text-ink-muted hover:text-ink'
              }`}
            >
              <Icon />
              <span className="max-w-full truncate">{t(labelKey)}</span>
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}
