// What a visitor and a crawler get from each page: the head, the visible text and the JSON-LD.
// `save` writes the baseline; `compare` fails on any difference from it.
// ponytail: regex over Next's own HTML, not a parser; it only has to read what this site renders.
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';

const PAGES = { en: '/', es: '/es' } as const;
const DIR = 'artifacts/parity';

const ENTITIES: Record<string, string> = { amp: '&', lt: '<', gt: '>', quot: '"', nbsp: ' ' };
const decode = (s: string) =>
  s.replace(/&(#x[\da-f]+|#\d+|\w+);/gi, (m, e: string) =>
    e[0] === '#'
      ? String.fromCodePoint(Number(e[1] === 'x' ? `0${e.slice(1)}` : e.slice(1)))
      : (ENTITIES[e] ?? m),
  );
const attrs = (tag: string) =>
  Object.fromEntries([...tag.matchAll(/([\w:-]+)="([^"]*)"/g)].map(([, k, v]) => [k, decode(v)]));

function snapshot(html: string) {
  const head = html.slice(0, html.indexOf('</head>'));
  const meta = [...head.matchAll(/<meta [^>]*>/g)]
    .map(([tag]) => attrs(tag))
    .filter((a) => (a.name || a.property) && a.content !== undefined)
    // generated image URLs carry a build hash in the query
    .map((a) => `${a.name ?? a.property}=${a.content.replace(/\?[\da-f]{16}$/, '')}`)
    .sort();
  const links = [...head.matchAll(/<link [^>]*>/g)]
    .map(([tag]) => attrs(tag))
    .filter((a) => a.rel === 'canonical' || a.rel === 'alternate')
    .map((a) => `${a.rel} ${a.hrefLang ?? a.hreflang ?? ''} ${a.href}`.replace(/\s+/g, ' '))
    .sort();
  const jsonld = [...html.matchAll(/<script type="application\/ld\+json">(.*?)<\/script>/gs)].map(
    ([, json]) => JSON.parse(json),
  );
  const body = html
    .slice(html.indexOf('<body'))
    .replace(/<(script|style|svg|template)\b.*?<\/\1>/gs, ' ')
    .replace(/<[^>]+>/g, '\n');
  const text = decode(body)
    .split('\n')
    .map((line) => line.replace(/\s+/g, ' ').trim())
    .filter(Boolean);
  return {
    title: decode(/<title>(.*?)<\/title>/s.exec(head)?.[1] ?? ''),
    meta,
    links,
    jsonld,
    text,
  };
}

type Snapshot = ReturnType<typeof snapshot>;

// Prints what changed; true when something did.
function differs(lang: string, was: Snapshot, now: Snapshot) {
  let changed = false;
  for (const key of Object.keys(now) as (keyof Snapshot)[]) {
    const a = JSON.stringify(was[key], null, 1).split('\n');
    const b = JSON.stringify(now[key], null, 1).split('\n');
    if (a.join() === b.join()) continue;
    changed = true;
    console.error(`${lang} ${key} differs:`);
    for (const line of a.filter((x) => !b.includes(x))) console.error(`  - ${line.trim()}`);
    for (const line of b.filter((x) => !a.includes(x))) console.error(`  + ${line.trim()}`);
  }
  return changed;
}

async function main() {
  const [mode = 'save', base = 'http://localhost:3302'] = process.argv.slice(2);
  for (const [lang, path] of Object.entries(PAGES)) {
    const res = await fetch(new URL(path, base), {
      headers: { 'accept-language': lang },
      redirect: 'manual',
    });
    if (res.status !== 200) throw new Error(`${path}: HTTP ${res.status}`);
    const now = snapshot(await res.text());
    const file = `${DIR}/${lang}.json`;
    if (mode === 'save') {
      mkdirSync(DIR, { recursive: true });
      writeFileSync(file, `${JSON.stringify(now, null, 2)}\n`);
      console.log(`saved ${file}`);
    } else if (differs(lang, JSON.parse(readFileSync(file, 'utf8')), now)) process.exitCode = 1;
    else console.log(`${lang}: same as baseline`);
  }
}

if (import.meta.main) await main();
