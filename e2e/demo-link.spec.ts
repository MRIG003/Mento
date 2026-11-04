import { expect, test } from '@playwright/test';

test('/demo?to=… loads the demo class and opens the requested screen; unknown targets fall back to the Desk', async ({ page }) => {
  await page.goto('/demo?to=/t/results');
  await expect(page.getByRole('heading', { name: /6 students stuck on Comparing fractions|6 बच्चे भिन्नों की तुलना में अटके हैं/ })).toBeVisible();

  await page.goto('/demo?to=/p/plan');
  await expect(page).toHaveURL(/\/p\/plan$/);

  await page.goto('/demo?to=https://evil.example/x');
  await expect(page).toHaveURL(/\/t$/);
});

test('the app can be framed by its own origin only', async ({ page, request }) => {
  const res = await request.get('/');
  expect(res.headers()['x-frame-options']).toBe('SAMEORIGIN');
  expect(res.headers()['content-security-policy']).toContain("frame-ancestors 'self'");
  void page;
});
