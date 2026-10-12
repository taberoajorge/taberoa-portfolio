import assert from 'node:assert/strict';
import { test } from 'node:test';
import { GUTTER, initial, MAX_ITERATIONS, run, step } from './model.ts';

test('low failure chance: the loop ends with every story done', () => {
  const end = run(initial({ pFail: 0.2 }));
  assert.ok(end.stories.every((s) => s.status === 'done'));
  assert.ok(end.iteration < MAX_ITERATIONS);
});

test('a guardrail appears on the 3rd failure of a story', () => {
  let s = initial({ pFail: 0.8 });
  while (!s.finished && s.last !== 'guardrail') {
    const next = step(s);
    if (next.last === 'guardrail') {
      const story = next.stories.find((x) => x.id === next.current);
      assert.equal(story?.fails, GUTTER);
      assert.equal(story?.guardrails, 1);
    }
    s = next;
  }
  assert.equal(s.last, 'guardrail');
});

test('max failure chance: stops at the cap and reports what is left', () => {
  const end = run(initial({ pFail: 0.95 }));
  assert.equal(end.iteration, MAX_ITERATIONS);
  assert.ok(end.finished);
  assert.ok(end.stories.some((s) => s.status !== 'done'));
  // just below the slider max the loop still finishes on its own
  assert.ok(run(initial({ pFail: 0.9 })).stories.every((s) => s.status === 'done'));
});

test('a clumsier agent needs more iterations with the same seed', () => {
  const easy = run(initial({ pFail: 0.2 })).iteration;
  const hard = run(initial({ pFail: 0.6 })).iteration;
  assert.ok(hard > easy, `${hard} > ${easy}`);
});

test('each step reports the roll and the threshold that decided it', () => {
  let s = initial();
  while (!s.finished) {
    s = step(s);
    if (s.roll === null || s.threshold === null) continue;
    assert.equal(s.last === 'pass', s.roll >= s.threshold);
  }
});
