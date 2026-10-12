import assert from 'node:assert/strict';
import { test } from 'node:test';
import { roll } from './rng.ts';

test('same input, same roll', () => {
  assert.equal(roll(7, 2, 3), roll(7, 2, 3));
  assert.notEqual(roll(7, 2, 3), roll(7, 2, 4));
});

test('rolls are roughly uniform in [0, 1)', () => {
  const buckets = new Array(10).fill(0);
  for (let s = 0; s < 50; s++)
    for (let k = 0; k < 20; k++)
      for (let n = 0; n < 20; n++) {
        const r = roll(s, k, n);
        assert.ok(r >= 0 && r < 1);
        buckets[Math.floor(r * 10)]++;
      }
  for (const b of buckets) assert.ok(b > 1700 && b < 2300, `bucket ${b} of 20000`);
});
