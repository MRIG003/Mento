import { render, screen } from '@testing-library/react';
import type { ReactNode } from 'react';
import { describe, expect, it } from 'vitest';
import { I18nProvider } from '../i18n/provider';
import { EmptyState } from './EmptyState';
import { FractionText } from './Fraction';
import { HighlighterMark } from './HighlighterMark';
import { NameTag, tagLook } from './NameTag';
import { PaperSkeleton } from './PaperSkeleton';
import { ProgressBar } from './ProgressBar';

const wrap = (ui: ReactNode) => render(<I18nProvider>{ui}</I18nProvider>);

describe('tagLook', () => {
  it('gives the same student the same tint and tilt every time', () => {
    expect(tagLook('stu_anaya')).toEqual(tagLook('stu_anaya'));
  });
  it('spreads a class across several tints and keeps tilts small', () => {
    const looks = Array.from({ length: 40 }, (_, i) => tagLook(`stu_${i}`));
    expect(new Set(looks.map((l) => l.tint)).size).toBeGreaterThanOrEqual(5);
    expect(looks.every((l) => Math.abs(l.tilt) <= 3)).toBe(true);
  });
});

describe('NameTag', () => {
  it('shows the first name as text', () => {
    render(<ul><NameTag as="li" id="stu_1" name="Anaya" /></ul>);
    expect(screen.getByRole('listitem')).toHaveTextContent('Anaya');
  });
});

describe('FractionText', () => {
  it('reads fractions aloud as "n over d" and leaves the rest as text', async () => {
    const { container } = wrap(<p><FractionText text="Which is bigger: 3/5 or 2/5?" /></p>);
    expect(await screen.findByText('3 over 5')).toBeInTheDocument();
    expect(screen.getByText('2 over 5')).toBeInTheDocument();
    expect(container.textContent).toContain('Which is bigger:');
  });
  it('handles Devanagari digits and Hindi reading', async () => {
    localStorage.setItem('mento:prefs', JSON.stringify({ lang: 'hi' }));
    wrap(<p><FractionText text="३/४ बड़ा है" /></p>);
    expect(await screen.findByText('३ बटा ४')).toBeInTheDocument();
  });
  it('renders markup-looking teacher text as plain text (threat model T2)', () => {
    const { container } = wrap(<p><FractionText text={'<img src=x onerror=alert(1)> 1/2'} /></p>);
    expect(container.querySelector('img')).toBeNull();
    expect(container.textContent).toContain('<img src=x onerror=alert(1)>');
  });
});

describe('HighlighterMark', () => {
  it('marks the weak concept semantically', () => {
    render(<p><HighlighterMark>{'Comparing fractions'}</HighlighterMark></p>);
    expect(screen.getByText('Comparing fractions').closest('mark')).not.toBeNull();
  });
});

describe('ProgressBar', () => {
  it('exposes a labelled meter with value and words', async () => {
    wrap(<ProgressBar label="Comparing fractions" percent={41.4} status="stuck" />);
    const meter = await screen.findByRole('meter', { name: 'Comparing fractions' });
    expect(meter).toHaveAttribute('aria-valuenow', '41');
    expect(meter).toHaveAttribute('aria-valuetext', '41% right, stuck');
    expect(screen.getByText('41%')).toBeInTheDocument();
  });
  it('shows "not enough answers yet" instead of a number when evidence is thin', async () => {
    wrap(<ProgressBar label="Decimals" percent={null} status="not-enough" />);
    expect(await screen.findByText('not enough answers yet', { exact: false })).toBeInTheDocument();
    expect(screen.queryByRole('meter')).toBeNull();
  });
});

describe('EmptyState and PaperSkeleton', () => {
  it('empty state names the next action', () => {
    render(<EmptyState title="Desk is clear." body="Start with a homework." action={<button type="button">{'Create'}</button>} />);
    expect(screen.getByText('Desk is clear.')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Create' })).toBeInTheDocument();
  });
  it('skeleton is a status region announcing loading', async () => {
    wrap(<PaperSkeleton />);
    expect(await screen.findByRole('status')).toHaveTextContent('Loading…');
  });
});
