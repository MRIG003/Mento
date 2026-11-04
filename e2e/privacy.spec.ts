import { expect, test } from '@playwright/test';

const L = {
  en: { demo: 'Try with a demo class', classTab: 'Class', download: 'Download class data (CSV)', keep: 'What we keep, and for how long', title: 'What we keep', largest: 'Largest' },
  hi: { demo: 'डेमो क्लास के साथ आज़माएँ', classTab: 'क्लास', download: 'क्लास का डेटा डाउनलोड करें (CSV)', keep: 'हम क्या रखते हैं, और कितने समय तक', title: 'हम क्या रखते हैं', largest: 'सबसे बड़ा' },
};

test('class tab: consent status, safe CSV download, text size, and the public what-we-keep page', async ({ page }, info) => {
  const t = info.project.name.startsWith('hi') ? L.hi : L.en;
  const problems: string[] = [];
  page.on('console', (m) => { if (m.type() === 'error') problems.push(m.text()); });

  await page.goto('/');
  await page.getByRole('button', { name: t.demo }).click();
  await page.waitForURL('**/t');
  await page.getByRole('navigation').getByRole('link', { name: t.classTab }).click();
  await expect(page.getByRole('button', { name: t.download })).toBeVisible();

  const [download] = await Promise.all([page.waitForEvent('download'), page.getByRole('button', { name: t.download }).click()]);
  expect(download.suggestedFilename()).toBe('mento-class-data.csv');
  const stream = await download.createReadStream();
  let csv = '';
  for await (const chunk of stream) csv += chunk.toString('utf8');
  expect(csv.replace(/^﻿/, '').startsWith('first_name,homework,question,verdict')).toBe(true);
  expect(csv).toContain('Anaya,Fractions,');
  expect(csv).not.toMatch(/^[=+@-]/m);

  await page.getByRole('radio', { name: t.largest }).check({ force: true });
  expect(await page.evaluate(() => document.documentElement.style.fontSize)).toBe('130%');
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
  expect(overflow).toBe(0);

  await page.getByRole('link', { name: t.keep }).click();
  await expect(page.getByRole('heading', { name: t.title })).toBeVisible();
  expect(problems, problems.join('\n')).toEqual([]);
});
