import { expect, test } from '@playwright/test';

test('teacher shell: language switch is one tap, keeps typed input, never navigates, no overflow', async ({ page }, info) => {
  const problems: string[] = [];
  page.on('console', (m) => { if (m.type() === 'error' || m.type() === 'warning') problems.push(m.text()); });
  page.on('pageerror', (e) => problems.push(e.message));

  await page.goto('/t');
  const startLang = info.project.name.startsWith('hi') ? 'hi' : 'en';
  await expect(page.locator('html')).toHaveAttribute('lang', startLang);

  const input = page.getByTestId('probe-input');
  await input.fill('3/4 ५');
  let navigations = 0;
  page.on('framenavigated', () => { navigations += 1; });

  const target = startLang === 'en' ? 'hi' : 'en';
  await page.locator(`header button[lang="${target}"]`).click();

  await expect(page.locator('html')).toHaveAttribute('lang', target);
  await expect(input).toHaveValue('3/4 ५');
  expect(navigations).toBe(0);

  const box = await page.locator(`header button[lang="${target}"]`).boundingBox();
  expect(box?.height ?? 0).toBeGreaterThanOrEqual(44);
  expect(box?.width ?? 0).toBeGreaterThanOrEqual(44);

  const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
  expect(overflow).toBe(0);
  await expect(page.getByRole('navigation').getByRole('link')).toHaveCount(4);
  expect(problems, problems.join("\n")).toEqual([]);
});
