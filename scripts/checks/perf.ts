// Lighthouse on / and /es, mobile and desktop, against the four scores and the load budgets.
// `pnpm perf` targets this checkout's `pnpm start`; `--url https://taberoa.com` targets production;
// `--ci` accepts Performance >= 95 (shared runners are noisy); the other categories must be 100.
import { execFileSync } from 'node:child_process';
import { readFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { gzipSync } from 'node:zlib';
import { port } from '../port.ts';

const LIGHTHOUSE = 'lighthouse@13.5.0';
const PAGES = ['/', '/es'];
const DEVICES = ['mobile', 'desktop'] as const;
const CATEGORIES = ['performance', 'accessibility', 'best-practices', 'seo'];
// firstLoadJsKB is compressed transfer, the same figure `next build` reports as First Load JS.
// lcpMs is Lighthouse's simulated mobile LCP: Next's ~103 KB runtime is requested before the hero
// paints, so on simulated slow 4G it cannot go below ~1.9 s even though real paint is ~50 ms.
const BUDGET = {
  htmlGzipKB: 40,
  firstLoadJsKB: 110,
  lcpMs: { mobile: 2000, desktop: 800 },
  tbtMs: 50,
  cls: 0,
};

type Audit = {
  score: number | null;
  numericValue?: number;
  details?: {
    items?: {
      resourceType?: string;
      transferSize?: number;
      networkRequestTime?: number;
      observedLoad?: number;
    }[];
  };
};
type Report = {
  categories: Record<string, { score: number }>;
  audits: Record<string, Audit>;
};

function lighthouse(url: string, device: (typeof DEVICES)[number]): Report {
  const out = join(tmpdir(), `lh-${device}-${Date.now()}.json`);
  execFileSync(
    'pnpm',
    [
      'dlx',
      LIGHTHOUSE,
      url,
      '--quiet',
      '--output=json',
      `--output-path=${out}`,
      '--chrome-flags=--headless=new',
      ...(device === 'desktop' ? ['--preset=desktop'] : []),
    ],
    { stdio: ['ignore', 'ignore', 'inherit'] },
  );
  return JSON.parse(readFileSync(out, 'utf8'));
}

// Everything that fails for one page on one device.
function problems(report: Report, device: string, ci: boolean): string[] {
  const found: string[] = [];
  for (const id of CATEGORIES) {
    const score = Math.round(report.categories[id].score * 100);
    const floor = ci && id === 'performance' ? 95 : 100;
    if (score < floor) {
      const failing = Object.entries(report.audits)
        .filter(([, a]) => a.score !== null && a.score < 1 && a.details?.items?.length)
        .map(([name]) => name);
      found.push(`${id} ${score} (< ${floor}); audits not passing: ${failing.join(', ')}`);
    }
  }
  const metric = (id: string) => report.audits[id]?.numericValue ?? 0;
  const lcpBudget = BUDGET.lcpMs[device as keyof typeof BUDGET.lcpMs];
  if (metric('largest-contentful-paint') > lcpBudget)
    found.push(`LCP ${Math.round(metric('largest-contentful-paint'))} ms > ${lcpBudget} ms`);
  if (device === 'mobile' && metric('total-blocking-time') > BUDGET.tbtMs)
    found.push(`TBT ${Math.round(metric('total-blocking-time'))} ms > ${BUDGET.tbtMs} ms`);
  if (Number(metric('cumulative-layout-shift').toFixed(3)) > BUDGET.cls)
    found.push(`CLS ${metric('cumulative-layout-shift').toFixed(3)} > ${BUDGET.cls}`);
  const blocking =
    report.audits['render-blocking-insight'] ?? report.audits['render-blocking-resources'];
  if (blocking?.details?.items?.length)
    found.push(`${blocking.details.items.length} render-blocking resource(s)`);
  // First load: scripts requested before the load event (figure code waits for it, then for idle).
  const loaded = report.audits.metrics?.details?.items?.[0]?.observedLoad ?? Infinity;
  const js = (report.audits['network-requests']?.details?.items ?? [])
    .filter((item) => item.resourceType === 'Script' && (item.networkRequestTime ?? 0) < loaded)
    .reduce((sum, item) => sum + (item.transferSize ?? 0), 0);
  if (js / 1024 > BUDGET.firstLoadJsKB)
    found.push(`first-load JS ${(js / 1024).toFixed(0)} KB > ${BUDGET.firstLoadJsKB} KB`);
  return found;
}

async function htmlProblems(url: string) {
  const get = () => fetch(url, { headers: { 'accept-language': 'en' } });
  const html = await (await get().catch(get)).text(); // one retry: a keep-alive reset after Lighthouse
  const kb = gzipSync(html).length / 1024;
  const found =
    kb > BUDGET.htmlGzipKB ? [`HTML ${kb.toFixed(1)} KB gzip > ${BUDGET.htmlGzipKB} KB`] : [];
  return { kb, found };
}

async function main() {
  const args = process.argv.slice(2);
  const ci = args.includes('--ci');
  const at = args.indexOf('--url');
  const base = at >= 0 ? args[at + 1] : `http://localhost:${port()}`;
  let failed = false;
  for (const path of PAGES) {
    const url = new URL(path, base).href;
    const html = await htmlProblems(url);
    for (const device of DEVICES) {
      const report = lighthouse(url, device);
      const scores = CATEGORIES.map((id) => Math.round(report.categories[id].score * 100)).join(
        '/',
      );
      const lcp = Math.round(report.audits['largest-contentful-paint'].numericValue ?? 0);
      const found = [...(device === 'mobile' ? html.found : []), ...problems(report, device, ci)];
      process.stdout.write(
        `${found.length ? '✖' : '✔'} ${path} ${device}: ${scores} · LCP ${lcp} ms · HTML ${html.kb.toFixed(1)} KB gzip\n`,
      );
      for (const line of found) process.stdout.write(`    ${line}\n`);
      failed ||= found.length > 0;
    }
  }
  if (failed) process.exitCode = 1;
}

if (import.meta.main) await main();
