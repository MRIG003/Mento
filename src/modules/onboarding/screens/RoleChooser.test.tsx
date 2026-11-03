import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { createLocalRepositories, createMemoryDrivers, RepositoriesProvider } from '@/modules/data';
import { seededRandom } from '@/modules/domain';
import { I18nProvider } from '@/modules/foundation';
import { RoleChooser } from './RoleChooser';

const push = vi.fn();
vi.mock('next/navigation', () => ({ useRouter: () => ({ push }), usePathname: () => '/' }));

const clock = { now: () => new Date('2026-11-03T15:00:00.000Z') };
function renderChooser() {
  const repos = createLocalRepositories({ driver: createMemoryDrivers(1)[0]!, blobs: null, clock, rng: seededRandom(1) });
  render(<I18nProvider><RepositoriesProvider repositories={repos}><RoleChooser /></RepositoriesProvider></I18nProvider>);
  return repos;
}

describe('RoleChooser', () => {
  it('offers the three roles and the language switch on the first screen', async () => {
    renderChooser();
    expect(await screen.findByRole('link', { name: /I’m a teacher/ })).toHaveAttribute('href', '/start/teacher');
    expect(screen.getByRole('link', { name: /I’m a principal/ })).toHaveAttribute('href', '/start/principal');
    expect(screen.getByRole('button', { name: /I got a link/ })).toHaveAttribute('aria-expanded', 'false');
    expect(screen.getByRole('group', { name: 'Language' })).toBeInTheDocument();
  });

  it('reads naturally in Hindi', async () => {
    localStorage.setItem('mento:prefs', JSON.stringify({ lang: 'hi' }));
    renderChooser();
    expect(await screen.findByText('मैं टीचर हूँ')).toBeInTheDocument();
    expect(screen.getByText('मुझे बच्चे के स्कूल से लिंक मिला है')).toBeInTheDocument();
  });

  it('helps a parent without the link and rejects a pasted non-Mento link', async () => {
    const user = userEvent.setup();
    renderChooser();
    await user.click(await screen.findByRole('button', { name: /I got a link/ }));
    await user.type(screen.getByRole('textbox', { name: 'Homework link' }), 'https://example.com/hello');
    await user.click(screen.getByRole('button', { name: 'Open homework' }));
    expect(screen.getByRole('alert')).toHaveTextContent('doesn’t look like a Mento homework link');
  });

  it('"Try with a demo class" seeds the demo and opens the desk', async () => {
    const user = userEvent.setup();
    const repos = renderChooser();
    await user.click(await screen.findByRole('button', { name: 'Try with a demo class' }));
    await vi.waitFor(() => expect(push).toHaveBeenCalledWith('/t'));
    expect(await repos.demo.isSeeded()).toBe(true);
  });
});
