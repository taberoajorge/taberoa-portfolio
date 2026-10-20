// Renders a post's share card (1200 × 630) to public/writing/<slug>.png with headless Chrome:
// the parity-bench figure on the left, the title on the right. Run `pnpm og` after changing either.
import { execFileSync } from 'node:child_process';
import { mkdirSync, mkdtempSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { pathToFileURL } from 'node:url';
import { content, ENGINE_REWRITE } from '../src/content';
import { HEIGHT, svg, WIDTH } from '../src/figures/parity/geometry';

const CHROME =
  process.env.CHROME_PATH ?? '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
const post = ENGINE_REWRITE;
const t = content.en;

const html = `<!doctype html><html><head><meta charset="utf-8"><style>
html,body{margin:0;width:1200px;height:630px;overflow:hidden;background:#f2f2ef;color:#18181a;
  font-family:ui-sans-serif,-apple-system,BlinkMacSystemFont,"Segoe UI",Helvetica,Arial,sans-serif}
.card{display:grid;grid-template-columns:690px 1fr;align-items:center;height:630px;padding:0 56px 0 16px;box-sizing:border-box}
.fig svg{width:${WIDTH * 1.08}px;height:${HEIGHT * 1.08}px;display:block}
.text{display:flex;flex-direction:column;gap:22px;padding-left:8px}
.kicker{font-size:19px;letter-spacing:4px;color:#57575a}
.title{font-size:48px;line-height:1.1;font-weight:600;letter-spacing:-0.5px}
.name{font-size:26px;color:#57575a}
</style></head><body><div class="card"><div class="fig">${svg}</div><div class="text">
<div class="kicker">${t.writing.title.toUpperCase()} · ${post.published}</div>
<div class="title">${post.title}</div>
<div class="name">${t.hero.name}</div></div></div></body></html>`;

const dir = mkdtempSync(join(tmpdir(), 'og-'));
const page = join(dir, 'card.html');
writeFileSync(page, html);
mkdirSync('public/writing', { recursive: true });
const out = `public/writing/${post.slug}.png`;
execFileSync(CHROME, [
  '--headless=new',
  '--hide-scrollbars',
  '--force-device-scale-factor=1',
  '--window-size=1200,630',
  `--screenshot=${join(process.cwd(), out)}`,
  pathToFileURL(page).href,
]);
process.stdout.write(`${out}\n`);
