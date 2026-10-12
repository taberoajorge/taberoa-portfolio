// Who may import whom inside src/, and no grab-bag files. See AGENTS.md for the map.
// ponytail: regex over import specifiers, not a parser; this codebase only uses static ESM imports.
import { readdirSync, readFileSync } from 'node:fs';
import { dirname, join, normalize, relative } from 'node:path';

type Source = { path: string; text: string }; // path relative to the repo root, e.g. src/site/Home.tsx

const SPEC = /(?:import|export)\s[^'"]*?from\s*['"]([^'"]+)['"]|import\s*\(?\s*['"]([^'"]+)['"]/g;
const GRAB_BAG = /^(utils|helpers|misc)(\.[jt]sx?)?$/;

const area = (path: string) => path.split('/')[1]; // src/<area>/...

// One rule per area: given the importing file and the resolved target, a message if it is not allowed.
const RULES: Record<string, (from: string, to: string | null, spec: string) => string | null> = {
  models: (_from, to, spec) =>
    /^(react|next)(\/|$)/.test(spec)
      ? 'models stay pure: no React or Next'
      : to && area(to) !== 'models'
        ? 'models import nothing else from src/'
        : null,
  iso: (_from, to) => (to && area(to) !== 'iso' ? 'the vendored iso kit is self-contained' : null),
  figures: (_from, to) =>
    to && ['site', 'app'].includes(area(to)) ? 'figures never import site or app' : null,
  site: (_from, to) =>
    to?.startsWith('src/figures/') && !/^src\/figures\/[^/]+\/Figure$/.test(to)
      ? 'site imports a figure only through its Figure component'
      : null,
  // stylesheets are the exception: globals.css pulls in the kit's theme
  app: (_from, to, spec) =>
    to && !spec.endsWith('.css') && !['site', 'content', 'app'].includes(area(to))
      ? 'app imports only site and content'
      : null,
};

function importProblems({ path, text }: Source): string[] {
  const rule = RULES[area(path)];
  if (!rule) return [];
  return [...text.matchAll(SPEC)].flatMap((match) => {
    const spec = match[1] ?? match[2];
    const to = spec.startsWith('.')
      ? normalize(join(dirname(path), spec)).replace(/\.(tsx?|css)$/, '')
      : null;
    const problem = rule(path, to, spec);
    return problem ? [`${path}: imports '${spec}' (${problem})`] : [];
  });
}

export function violations(sources: Source[]): string[] {
  return sources.flatMap((source) => [
    ...(source.path.split('/').some((part) => GRAB_BAG.test(part))
      ? [`${source.path}: no utils, helpers or misc files; name it for what it does`]
      : []),
    ...importProblems(source),
  ]);
}

function sourcesUnder(root: string): Source[] {
  return readdirSync(root, { recursive: true, withFileTypes: true })
    .filter((entry) => entry.isFile() && /\.(tsx?|css)$/.test(entry.name))
    .map((entry) => {
      const path = relative(process.cwd(), join(entry.parentPath, entry.name));
      return { path, text: readFileSync(path, 'utf8') };
    });
}

if (import.meta.main) {
  const found = violations(sourcesUnder('src'));
  for (const line of found) console.error(line);
  if (found.length) process.exitCode = 1;
  else console.log('boundaries: ok');
}
