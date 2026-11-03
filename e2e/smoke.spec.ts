import { expect, test } from '@playwright/test';

test('home hydrates with a clean console and no horizontal overflow', async ({ page }) => {
  const problems: string[] = [];
  page.on('console', (m) => { if (m.type() === 'error' || m.type() === 'warning') problems.push(m.text()); });
  page.on('pageerror', (e) => problems.push(e.message));

  await page.goto('/');
  const probe = page.getByTestId('hydration-probe');
  await probe.click();
  await expect(probe).toHaveText('taps: 1');

  const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
  expect(overflow).toBe(0);
  expect(problems).toEqual([]);
});
