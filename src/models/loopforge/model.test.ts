import assert from 'node:assert/strict';
import { test } from 'node:test';
import { assigned, GUTTER, initial, run, step } from './model.ts';

test('3 lanes finish in fewer ticks than 1 lane, same seed', () => {
  const one = run(initial({ lanes: 1 }));
  const three = run(initial({ lanes: 3 }));
  assert.ok(three.tick < one.tick, `${three.tick} < ${one.tick}`);
  // same outcomes per (story, attempt): parallelism changes time, not results
  assert.deepEqual(
    three.stories.map((s) => s.status),
    one.stories.map((s) => s.status),
  );
});

test('a story never runs before its dependency merges', () => {
  let s = initial({ lanes: 3 });
  while (!s.finished) {
    s = step(s);
    if (s.stories[1].attempts > 0) assert.equal(s.stories[0].status, 'merged');
    if (s.stories[4].attempts > 0) {
      assert.equal(s.stories[2].status, 'merged');
      assert.equal(s.stories[3].status, 'merged');
    }
  }
});

test('3 consecutive failures send a story to human review and block its dependents', () => {
  const end = run(initial({ pFail: 0.9 }));
  const review = end.stories.filter((s) => s.status === 'review');
  assert.ok(review.length > 0);
  for (const s of review) assert.equal(s.fails, GUTTER);
  // story 1 depends on 0: if 0 is in review, 1 never ran
  if (end.stories[0].status === 'review') assert.equal(end.stories[1].attempts, 0);
  assert.ok(end.lanes.every((id) => id === null));
});

test('paused: nothing moves', () => {
  const s = { ...initial(), paused: true };
  assert.equal(step(s), s);
});

test('default run shows one story in human review', () => {
  const end = run(initial());
  assert.equal(end.stories.filter((s) => s.status === 'review').length, 1);
});

test('assigned() names the story each lane attempts this tick', () => {
  let s = initial();
  while (!s.finished) {
    const lanes = assigned(s);
    const next = step(s);
    for (const id of lanes)
      if (id !== null) assert.equal(next.stories[id].attempts, s.stories[id].attempts + 1);
    s = next;
  }
});
