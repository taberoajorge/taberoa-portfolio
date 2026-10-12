// One port per checkout, so several worktrees can serve at once. The main checkout keeps 3302.

import { execFileSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { existsSync, realpathSync } from 'node:fs';

const BASE = 3300;
const MAIN = 3302;

type Checkout = { path: string; main: boolean };

export const portOf = ({ path, main }: Checkout) =>
  main
    ? MAIN
    : BASE +
      (Number.parseInt(createHash('sha256').update(path).digest('hex').slice(0, 8), 16) % 100);

// Another registered checkout that would get the same port, if any.
export function clash(self: Checkout, all: Checkout[]) {
  const port = portOf(self);
  return all.find((other) => other.path !== self.path && portOf(other) === port) ?? null;
}

// `git worktree list` names the main checkout first.
function checkouts(cwd = process.cwd()): { self: Checkout; all: Checkout[] } {
  const paths = execFileSync('git', ['worktree', 'list', '--porcelain'], { cwd, encoding: 'utf8' })
    .split('\n')
    .filter((line) => line.startsWith('worktree '))
    .map((line) => line.slice('worktree '.length))
    // a worktree folder deleted without `git worktree prune` is still listed
    .map((path) => (existsSync(path) ? realpathSync(path) : path));
  const all = paths.map((path, i) => ({ path, main: i === 0 }));
  const here = realpathSync(
    execFileSync('git', ['rev-parse', '--show-toplevel'], { cwd, encoding: 'utf8' }).trim(),
  );
  return { self: all.find((c) => c.path === here) ?? { path: here, main: false }, all };
}

export function port(cwd = process.cwd()) {
  const { self, all } = checkouts(cwd);
  const other = clash(self, all);
  if (other)
    throw new Error(
      `Port ${portOf(self)} is also the port of the worktree at ${other.path}. Move or rename one of them (git worktree move) and retry.`,
    );
  return portOf(self);
}

if (import.meta.main) process.stdout.write(`${port()}\n`);
