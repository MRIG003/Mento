import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

describe('component test harness', () => {
  it('renders into jsdom and finds elements by role', () => {
    render(<button type="button">{'ok'}</button>);
    expect(screen.getByRole('button', { name: 'ok' })).toBeInTheDocument();
  });
});
