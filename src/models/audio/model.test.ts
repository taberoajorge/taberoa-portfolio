import assert from 'node:assert/strict';
import { test } from 'node:test';
import { afterCut, bars, duration, envelope, GAP_MS, PRESETS, spans, TAKE, trim } from './model.ts';

test('presets match presets.py exactly', () => {
  assert.deepEqual(PRESETS, {
    gentle: {
      min_speech_duration_ms: 500,
      min_silence_duration_ms: 1200,
      speech_pad_ms: 350,
      prop_decrease: 0.5,
    },
    natural: {
      min_speech_duration_ms: 500,
      min_silence_duration_ms: 800,
      speech_pad_ms: 250,
      prop_decrease: 0.7,
    },
    aggressive: {
      min_speech_duration_ms: 500,
      min_silence_duration_ms: 600,
      speech_pad_ms: 200,
      prop_decrease: 0.85,
    },
  });
});

test('every speech run is at least min_speech_duration long', () => {
  for (const seg of TAKE.filter((s) => s.kind === 'speech')) assert.ok(seg.ms >= 500);
});

test('a long silence between phrases becomes pad + 150 ms + pad', () => {
  const p = PRESETS.natural;
  const take = [
    { kind: 'speech', ms: 1000 },
    { kind: 'silence', ms: 2000 },
    { kind: 'speech', ms: 1000 },
  ] as const;
  const out = trim([...take], p);
  const first = out.findIndex((s) => s.kind === 'speech');
  const last = out.findLastIndex((s) => s.kind === 'speech');
  const between = out.slice(first + 1, last);
  assert.equal(duration(between), 2 * p.speech_pad_ms + GAP_MS);
});

test('a silence shorter than min_silence is kept as is', () => {
  const p = PRESETS.gentle;
  const out = trim(
    [
      { kind: 'speech', ms: 1000 },
      { kind: 'silence', ms: 1100 },
      { kind: 'speech', ms: 1000 },
    ],
    p,
  );
  assert.ok(out.some((s) => s.kind === 'silence' && s.ms === 1100));
});

test('more aggressive presets give shorter takes, all shorter than the raw one', () => {
  const [g, n, a] = (['gentle', 'natural', 'aggressive'] as const).map((k) =>
    duration(trim(TAKE, PRESETS[k])),
  );
  assert.ok(a < n && n < g && g < duration(TAKE), `${a} < ${n} < ${g} < ${duration(TAKE)}`);
});

test('the trimmed take ends with the 150 ms pipeline.py adds after the last segment', () => {
  const out = trim(TAKE, PRESETS.natural);
  assert.deepEqual(out.at(-1), { kind: 'gap', ms: GAP_MS });
});

test('bars span exactly the take, never past its end', () => {
  for (const name of ['gentle', 'natural', 'aggressive'] as const) {
    const segs = trim(TAKE, PRESETS[name]);
    assert.ok(bars(segs, 0.1).length * 60 <= duration(segs));
  }
});

test('spans() keep exactly what trim() keeps', () => {
  for (const name of ['gentle', 'natural', 'aggressive'] as const) {
    const p = PRESETS[name];
    const kept = spans(TAKE, p);
    const total = kept.reduce((t, s) => t + (s.to - s.from) + GAP_MS, 0);
    assert.equal(total, duration(trim(TAKE, p)));
    // speech is never cut out
    for (const sample of envelope(TAKE))
      if (sample.kind === 'speech') assert.notEqual(afterCut(kept, sample.at), null);
  }
});

test('afterCut() never moves a moment later than it was', () => {
  const kept = spans(TAKE, PRESETS.natural);
  for (const sample of envelope(TAKE)) {
    const to = afterCut(kept, sample.at);
    if (to !== null) assert.ok(to <= sample.at);
  }
});
