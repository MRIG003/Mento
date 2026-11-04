import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { createLocalRepositories, createMemoryDrivers, RepositoriesProvider } from '@/modules/data';
import { seededRandom } from '@/modules/domain';
import { I18nProvider } from '@/modules/foundation';
import { createPreviewServices, ServicesProvider } from '@/modules/services';
import { Create } from '../screens/Create';

vi.mock('next/navigation', () => ({ useSearchParams: () => new URLSearchParams(), useRouter: () => ({ push: vi.fn() }), usePathname: () => '/t/create' }));

async function setup() {
  const clock = { now: () => new Date() };
  const repos = createLocalRepositories({ driver: createMemoryDrivers(1)[0]!, blobs: null, clock, rng: seededRandom(1) });
  await repos.session.useDemoTeacher();
  render(<I18nProvider><RepositoriesProvider repositories={repos}><ServicesProvider services={createPreviewServices({ clock, rng: seededRandom(2) })}><Create /></ServicesProvider></RepositoriesProvider></I18nProvider>);
  await screen.findByText('5 questions selected');
  const user = userEvent.setup();
  await user.click(screen.getByRole('button', { name: 'Write my own question' }));
  return { user, sheet: await screen.findByRole('dialog', { name: 'Your question' }) };
}

describe('own-question editor', () => {
  it('guides the teacher to a valid MCQ and adds it to the homework', async () => {
    const { user, sheet } = await setup();
    const s = within(sheet);
    await user.click(s.getByRole('button', { name: 'Add to homework' }));
    expect(s.getByRole('alert')).toHaveTextContent('Type the question in at least one language.');
    await user.type(s.getByRole('textbox', { name: 'Question' }), 'Which is bigger: 2/7 or 5/7?');
    await user.type(s.getByRole('textbox', { name: 'Option 1' }), '5/7');
    await user.type(s.getByRole('textbox', { name: 'Option 2' }), '2/7');
    await user.click(s.getByRole('button', { name: 'Add to homework' }));
    expect(s.getByRole('alert')).toHaveTextContent('Tap the circle next to the right option.');
    await user.click(s.getByRole('radio', { name: 'Right answer: option 1' }));
    await user.click(s.getByRole('button', { name: 'Add to homework' }));
    expect(await screen.findByText('6 questions selected')).toBeInTheDocument();
    expect(screen.getByText('5 over 7')).toBeInTheDocument(); // the new question, shown with stacked fractions
  });

  it('offers Preview auto-translate that fills a machine draft, or says it cannot', async () => {
    const { user, sheet } = await setup();
    const s = within(sheet);
    await user.click(s.getByRole('radio', { name: 'Notebook photo' }));
    await user.type(s.getByRole('textbox', { name: 'Question' }), 'Comparing fractions');
    await user.click(s.getAllByRole('tab', { name: /हिं/ })[0]!);
    expect(s.getByText('Preview')).toBeInTheDocument();
    await user.click(s.getByRole('button', { name: 'Auto-translate' }));
    expect(s.getByRole('textbox', { name: 'Question' })).toHaveValue('भिन्नों की तुलना');
    expect(s.getByText('Machine draft. Please check before publishing.')).toBeInTheDocument();
  });
});
