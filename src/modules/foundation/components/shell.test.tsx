import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { I18nProvider } from '../i18n/provider';
import { tabsFor } from './RoleShell';
import { TabBar } from './TabBar';
import { TopBar } from './TopBar';

vi.mock('next/navigation', () => ({ usePathname: () => '/t/results' }));

describe('TopBar language switch', () => {
  it('is a labelled group of two pressed-state buttons, and switching keeps what was typed and the focus', async () => {
    const user = userEvent.setup();
    render(
      <I18nProvider>
        <TopBar title="Fractions" />
        <label>{'answer'}<input /></label>
      </I18nProvider>,
    );
    const group = await screen.findByRole('group', { name: 'Language' });
    const english = within(group).getByRole('button', { name: 'Switch to English' });
    const hindi = within(group).getByRole('button', { name: 'Switch to हिन्दी' });
    expect(english).toHaveAttribute('aria-pressed', 'true');
    expect(hindi).toHaveAttribute('aria-pressed', 'false');

    await user.type(screen.getByRole('textbox'), '५/८');
    await user.click(hindi);

    expect(screen.getByRole('group', { name: 'भाषा' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'हिन्दी में बदलें' })).toHaveAttribute('aria-pressed', 'true');
    expect(screen.getByRole('textbox')).toHaveValue('५/८');
    expect(document.documentElement.lang).toBe('hi');
  });

  it('shows Help only when a handler exists, and labels icon-only buttons', async () => {
    const onHelp = vi.fn();
    const user = userEvent.setup();
    render(<I18nProvider><TopBar title="Desk" backHref="/t" onHelp={onHelp} /></I18nProvider>);
    await user.click(await screen.findByRole('button', { name: 'Help' }));
    expect(onHelp).toHaveBeenCalledOnce();
    expect(screen.getByRole('link', { name: 'Back' })).toHaveAttribute('href', '/t');
  });
});

describe('TabBar', () => {
  it('shows the four teacher tabs with visible labels and marks the current one', async () => {
    render(<I18nProvider><TabBar items={tabsFor('teacher', '/t/results')} /></I18nProvider>);
    const nav = await screen.findByRole('navigation', { name: 'Main' });
    const links = within(nav).getAllByRole('link');
    expect(links.map((l) => l.textContent)).toEqual(['Desk', 'Create', 'Results', 'Class']);
    expect(within(nav).getByRole('link', { name: 'Results' })).toHaveAttribute('aria-current', 'page');
    expect(within(nav).getByRole('link', { name: 'Desk' })).not.toHaveAttribute('aria-current');
  });

  it('matches nested paths to their tab but keeps Desk exact', () => {
    expect(tabsFor('teacher', '/t/results/abc').find((t) => t.active)?.key).toBe('results');
    expect(tabsFor('teacher', '/t').find((t) => t.active)?.key).toBe('desk');
    expect(tabsFor('principal', '/p/plan').find((t) => t.active)?.key).toBe('plan');
  });
});
