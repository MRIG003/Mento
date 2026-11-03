import { expect, test } from '@playwright/test';

test('role chooser: three roles, language switch, clean console, no overflow', async ({ page }, info) => {
  const problems: string[] = [];
  page.on('console', (m) => { if (m.type() === 'error' || m.type() === 'warning') problems.push(m.text()); });
  page.on('pageerror', (e) => problems.push(e.message));
  const hi = info.project.name.startsWith('hi');

  await page.goto('/');
  await expect(page.getByRole('link', { name: hi ? /मैं टीचर हूँ/ : /I’m a teacher/ })).toBeVisible();
  await expect(page.getByRole('link', { name: hi ? /मैं प्रिंसिपल हूँ/ : /I’m a principal/ })).toBeVisible();

  // Typed text survives a language switch on the first screen too.
  await page.getByRole('button', { name: hi ? /मुझे बच्चे के स्कूल/ : /I got a link/ }).click();
  const field = page.locator('input[inputmode="url"]');
  await field.fill('half-typed link');
  await page.locator(`header button[lang="${hi ? 'en' : 'hi'}"]`).click();
  await expect(field).toHaveValue('half-typed link');

  const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
  expect(overflow).toBe(0);
  expect(problems, problems.join('\n')).toEqual([]);
});
