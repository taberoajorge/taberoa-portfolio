import assert from 'node:assert/strict';
import { test } from 'node:test';
import { forcedToMain, prProblems } from './delivery.ts';

const body = (verification = 'pnpm check, pnpm build, Lighthouse 100/100/100/100') =>
  `## Summary\nAdds llms.txt.\n\n## Intent\nAI search can read the site.\n\n## Verification\n${verification}\n`;

test('a complete PR passes', () => {
  assert.deepEqual(prProblems('feat(site): serve llms.txt', body()), []);
});

test('a missing or empty section is named', () => {
  assert.match(
    prProblems('feat(site): x', body().replace(/## Verification[\s\S]*/, ''))[0],
    /Verification/,
  );
  assert.match(prProblems('feat(site): x', body('<!-- how was it checked? -->'))[0], /empty/);
});

test('the title must be conventional', () => {
  assert.equal(prProblems('Add llms', body()).length, 1);
});

const Z = '0'.repeat(40);
const A = 'a'.repeat(40);
const B = 'b'.repeat(40);

test('a fast-forward to main is fine; a rewrite is not', () => {
  const line = `refs/heads/main ${B} refs/heads/main ${A}`;
  assert.equal(
    forcedToMain(line, () => true),
    false,
  );
  assert.equal(
    forcedToMain(line, () => false),
    true,
  );
});

test('new branches, other branches and deleting main behave', () => {
  assert.equal(
    forcedToMain(`refs/heads/main ${B} refs/heads/main ${Z}`, () => false),
    false,
  );
  assert.equal(
    forcedToMain(`refs/heads/x ${B} refs/heads/x ${A}`, () => false),
    false,
  );
  assert.equal(
    forcedToMain(`(delete) ${Z} refs/heads/main ${A}`, () => true),
    true,
  );
});
