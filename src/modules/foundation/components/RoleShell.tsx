'use client';

import { usePathname } from 'next/navigation';
import type { ReactNode } from 'react';
import { ClassIcon, DeskIcon, GapsIcon, OverviewIcon, PencilIcon, PlanIcon, ResultsIcon } from './icons';
import { TabBar, type TabItem } from './TabBar';

export type Role = 'teacher' | 'principal';

type TabDef = Omit<TabItem, 'active'> & { match: (path: string) => boolean };

const startsWith = (prefix: string) => (path: string) => path === prefix || path.startsWith(`${prefix}/`);

/** Teacher: Desk · Create · Results · Class (CHECKPOINT 1 decision). Principal: Overview · Gaps · Classes · Plan. */
export const ROLE_TABS: Record<Role, TabDef[]> = {
  teacher: [
    { key: 'desk', labelKey: 'tab.teacher.desk', href: '/t', icon: DeskIcon, match: (p) => p === '/t' },
    { key: 'create', labelKey: 'tab.teacher.create', href: '/t/create', icon: PencilIcon, match: startsWith('/t/create') },
    { key: 'results', labelKey: 'tab.teacher.results', href: '/t/results', icon: ResultsIcon, match: startsWith('/t/results') },
    { key: 'class', labelKey: 'tab.teacher.class', href: '/t/class', icon: ClassIcon, match: startsWith('/t/class') },
  ],
  principal: [
    { key: 'overview', labelKey: 'tab.principal.overview', href: '/p', icon: OverviewIcon, match: (p) => p === '/p' },
    { key: 'gaps', labelKey: 'tab.principal.gaps', href: '/p/gaps', icon: GapsIcon, match: startsWith('/p/gaps') },
    { key: 'classes', labelKey: 'tab.principal.classes', href: '/p/classes', icon: ClassIcon, match: startsWith('/p/classes') },
    { key: 'plan', labelKey: 'tab.principal.plan', href: '/p/plan', icon: PlanIcon, match: startsWith('/p/plan') },
  ],
};

export function tabsFor(role: Role, pathname: string): TabItem[] {
  return ROLE_TABS[role].map(({ match, ...tab }) => ({ ...tab, active: match(pathname) }));
}

/** Wraps a role's screens: content plus the bottom tab bar (content padded so the bar never covers it). */
export function RoleShell({ role, children }: { role: Role; children: ReactNode }) {
  const pathname = usePathname() ?? '';
  return (
    <div className="min-h-dvh pb-24">
      {children}
      <TabBar items={tabsFor(role, pathname)} />
    </div>
  );
}
