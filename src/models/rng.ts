// Deterministic roll in [0, 1) for one attempt of one story.
// Keyed by (seed, story, attempt) instead of a running sequence, so the outcome of an
// attempt never depends on execution order: 1 lane and 3 lanes see the same passes/fails.
export function roll(seed: number, story: number, attempt: number): number {
  let h = (seed ^ Math.imul(story + 1, 0x9e3779b1) ^ Math.imul(attempt + 1, 0x85ebca77)) >>> 0;
  h = Math.imul(h ^ (h >>> 16), 0x7feb352d);
  h = Math.imul(h ^ (h >>> 15), 0x846ca68b);
  return ((h ^ (h >>> 16)) >>> 0) / 4294967296;
}
