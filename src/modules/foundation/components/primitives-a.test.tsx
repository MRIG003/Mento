import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import type { ReactNode } from 'react';
import { describe, expect, it, vi } from 'vitest';
import { I18nProvider } from '../i18n/provider';
import { Badge } from './Badge';
import { Button, ButtonLink } from './Button';
import { Card } from './Card';
import { StatusWord } from './StatusWord';
import { StickyNote } from './StickyNote';

const wrap = (ui: ReactNode) => render(<I18nProvider>{ui}</I18nProvider>);

describe('Button', () => {
  it('is a real button that is not a form submit by default and responds to keyboard', async () => {
    const onClick = vi.fn();
    const user = userEvent.setup();
    wrap(<Button onClick={onClick}>{'Give practice to these 6'}</Button>);
    const button = await screen.findByRole('button', { name: 'Give practice to these 6' });
    expect(button).toHaveAttribute('type', 'button');
    button.focus();
    await user.keyboard('{Enter}');
    await user.keyboard(' ');
    expect(onClick).toHaveBeenCalledTimes(2);
  });

  it('cannot be pressed twice while busy, and says it is working', async () => {
    const onClick = vi.fn();
    const user = userEvent.setup();
    wrap(<Button busy onClick={onClick}>{'Publish'}</Button>);
    const button = await screen.findByRole('button', { name: /Publish/ });
    expect(button).toBeDisabled();
    expect(button).toHaveAttribute('aria-busy', 'true');
    expect(button).toHaveTextContent('Working…');
    await user.click(button);
    expect(onClick).not.toHaveBeenCalled();
  });

  it('keeps icons out of the accessible name', async () => {
    wrap(<Button icon={<svg data-testid="pencil" />}>{'Write'}</Button>);
    expect(await screen.findByRole('button', { name: 'Write' })).toBeInTheDocument();
  });

  it('ButtonLink is a link with the given href', async () => {
    wrap(<ButtonLink href="/t/create">{'Create'}</ButtonLink>);
    expect(await screen.findByRole('link', { name: 'Create' })).toHaveAttribute('href', '/t/create');
  });
});

describe('StickyNote', () => {
  it('renders its content with the tape hidden from screen readers', () => {
    const { container } = render(<StickyNote tape as="section"><p>{'6 students stuck on Fractions'}</p></StickyNote>);
    expect(screen.getByText('6 students stuck on Fractions')).toBeInTheDocument();
    expect(container.querySelector('[aria-hidden="true"]')).not.toBeNull();
    expect(container.querySelector('section')?.style.transform).toBe('rotate(-1.5deg)');
  });
});

describe('Card', () => {
  it('names its region by the title', () => {
    render(<Card title="Concepts" titleId="concepts"><p>{'rows'}</p></Card>);
    expect(screen.getByRole('region', { name: 'Concepts' })).toBeInTheDocument();
  });
});

describe('Badge', () => {
  it.each([
    ['demo', 'Demo data', 'डेमो डेटा'],
    ['preview', 'Preview', 'प्रीव्यू'],
    ['late', 'Late', 'देर से'],
  ] as const)('%s badge reads as words in both languages', async (kind, english, hindi) => {
    const { unmount } = wrap(<Badge kind={kind} />);
    expect(await screen.findByText(english)).toBeInTheDocument();
    unmount();
    localStorage.setItem('mento:prefs', JSON.stringify({ lang: 'hi' }));
    wrap(<Badge kind={kind} />);
    expect(await screen.findByText(hindi)).toBeInTheDocument();
  });
});

describe('StatusWord', () => {
  it.each([
    ['stuck', 'stuck'],
    ['getting-there', 'getting there'],
    ['on-track', 'on track'],
    ['not-enough', 'not enough answers yet'],
  ] as const)('%s is shown as a word, not colour alone', async (status, word) => {
    wrap(<StatusWord status={status} />);
    expect(await screen.findByText(word, { exact: false })).toBeInTheDocument();
  });
});
