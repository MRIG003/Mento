// First-load JS budget check (SPEC §8). For each prerendered route HTML in .next/server/app, sum the gzip size of
// every <script src="/_next/static/..."> it loads on first paint. Lazy chunks are excluded by construction, and so are
// `noModule` scripts (legacy polyfills that modern browsers never download).
import { readFileSync, readdirSync, statSync, existsSync } from 'node:fs';
import { join, relative } from 'node:path';
import { gzipSync } from 'node:zlib';

const root = process.cwd();
const appDir = join(root, '.next/server/app');
const budgets = JSON.parse(readFileSync(join(root, 'scripts/budgets.json'), 'utf8'));
const budgetOverride = process.env.BUDGET_OVERRIDE_KB ? Number(process.env.BUDGET_OVERRIDE_KB) : null;

if (!existsSync(appDir)) {
  console.error('No build output at .next/server/app. Run `npm run build` first.');
  process.exit(1);
}

function htmlFiles(dir) {
  return readdirSync(dir).flatMap((name) => {
    const full = join(dir, name);
    if (statSync(full).isDirectory()) return htmlFiles(full);
    return name.endsWith('.html') ? [full] : [];
  });
}

function routeOf(file) {
  const rel = relative(appDir, file).replace(/\\/g, '/').replace(/\.html$/, '');
  if (rel === 'index') return '/';
  return '/' + rel.replace(/\/index$/, '');
}

const gzCache = new Map();
function gzipKb(src) {
  if (!gzCache.has(src)) {
    const path = join(root, '.next', src.replace(/^\/_next\//, ''));
    gzCache.set(src, existsSync(path) ? gzipSync(readFileSync(path)).length / 1024 : 0);
  }
  return gzCache.get(src);
}

let failed = false;
const rows = [];
for (const file of htmlFiles(appDir)) {
  const route = routeOf(file);
  if (route.startsWith('/_')) continue; // _not-found, _global-error
  const html = readFileSync(file, 'utf8');
  const tags = [...html.matchAll(/<script[^>]*>/g)].map((m) => m[0]).filter((tag) => !/\snoModule/i.test(tag));
  const srcs = [...new Set(tags.map((tag) => tag.match(/src="(\/_next\/static\/[^"]+\.js)"/)?.[1]).filter(Boolean))];
  const kb = srcs.reduce((sum, s) => sum + gzipKb(s), 0);
  const budget = budgetOverride ?? budgets[route] ?? budgets.default;
  const ok = kb <= budget;
  if (!ok) failed = true;
  rows.push({ route, kb: kb.toFixed(1), budget, chunks: srcs.length, status: ok ? 'ok' : 'OVER' });
}

rows.sort((a, b) => a.route.localeCompare(b.route));
console.table(rows);
if (failed) {
  console.error('First-load JS budget exceeded. See SPEC §8 and docs/perf.md.');
  process.exit(1);
}
