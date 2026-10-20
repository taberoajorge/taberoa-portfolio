// Renders a post's share card (1200 × 630) to public/writing/<slug>.png with headless Chrome:
// the parity-bench figure on the left, the title on the right. Run `pnpm og` after changing either.
// LinkedIn and X shrink and recompress the card hard, so it is rendered at 2× with heavier, darker
// lines and larger type than the site's figures use.
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
.card{display:grid;grid-template-columns:640px 1fr;align-items:center;height:630px;padding:0 48px 0 12px;box-sizing:border-box}
.iso{--anatomy-weight:1.5px;--anatomy-hi:#1a1a1e;--anatomy-mid:#55555a;--anatomy-lo:#85858a;--anatomy-faint:#b8b8bc;
  --anatomy-shade-0:#cdcdca;--anatomy-shade-1:#dadad7;--anatomy-shade-2:#e6e6e3;--anatomy-shade-3:#f1f1ee}
.fig svg{width:${WIDTH}px;height:${HEIGHT}px;display:block}
.text{display:flex;flex-direction:column;gap:24px;padding-left:12px}
.kicker{font-size:23px;letter-spacing:4px;color:#3f3f44}
.title{font-size:58px;line-height:1.08;font-weight:700;letter-spacing:-0.8px}
.name{font-size:30px;color:#3f3f44}
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
  '--force-device-scale-factor=2',
  '--window-size=1200,630',
  `--screenshot=${join(process.cwd(), out)}`,
  pathToFileURL(page).href,
]);
process.stdout.write(`${out}\n`);
