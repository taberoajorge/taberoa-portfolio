import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { test } from 'node:test';
import { clash, port, portOf } from './port.ts';

test('the main checkout keeps 3302', () => {
  assert.equal(portOf({ path: '/any/where', main: true }), 3302);
});

test('a worktree gets a stable port in 3300–3399', () => {
  const wt = { path: '/Users/me/orca/workspaces/taberoa-portfolio/fix-x', main: false };
  const p = portOf(wt);
  assert.equal(portOf({ ...wt }), p);
  assert.ok(p >= 3300 && p < 3400);
});

test('a clash names the other worktree', () => {
  const self = { path: '/w/a', main: false };
  // find a second path that lands on the same port
  let n = 0;
  while (portOf({ path: `/w/b${n}`, main: false }) !== portOf(self)) n++;
  const other = { path: `/w/b${n}`, main: false };
  assert.equal(clash(self, [self, other])?.path, other.path);
  assert.equal(clash(self, [self, { path: '/w/main', main: true }]), null);
});

test('a deleted, unpruned worktree does not break the port lookup', () => {
  const root = mkdtempSync(join(tmpdir(), 'port-'));
  const git = (...args: string[]) => execFileSync('git', args, { cwd: root, stdio: 'ignore' });
  git('init', '-q');
  git('-c', 'user.name=t', '-c', 'user.email=t@t', 'commit', '-q', '--allow-empty', '-m', 'init');
  git('worktree', 'add', '-q', join(root, 'gone'));
  rmSync(join(root, 'gone'), { recursive: true });
  assert.equal(port(root), 3302);
});
