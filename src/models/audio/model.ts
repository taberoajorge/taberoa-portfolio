// Copied from audio-cleaner-oss/modal_app/presets.py.
export const PRESETS = {
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
} as const;

export type PresetName = keyof typeof PRESETS;
export type Preset = (typeof PRESETS)[PresetName];
export const PRESET_NAMES = Object.keys(PRESETS) as PresetName[];

// pipeline.py appends 150 ms of silence after every kept speech segment.
export const GAP_MS = 150;
// ponytail: DeepFilterNet has no preset knob; a fixed illustrative drop of the noise floor.
export const DEEPFILTER_KEEP = 0.3;
export const NOISE = 0.22;

type Kind = 'speech' | 'silence' | 'gap';
export type Segment = { kind: Kind; ms: number };

// ~16 s synthetic take: every speech run ≥ 500 ms so Silero's min_speech_duration never drops one.
export const TAKE: Segment[] = [
  { kind: 'silence', ms: 700 },
  { kind: 'speech', ms: 1400 },
  { kind: 'silence', ms: 350 },
  { kind: 'speech', ms: 900 },
  { kind: 'silence', ms: 1500 },
  { kind: 'speech', ms: 2100 },
  { kind: 'silence', ms: 700 },
  { kind: 'speech', ms: 1100 },
  { kind: 'silence', ms: 2400 },
  { kind: 'speech', ms: 1600 },
  { kind: 'silence', ms: 1000 },
  { kind: 'speech', ms: 1200 },
  { kind: 'silence', ms: 900 },
];

export const duration = (segments: Segment[]) => segments.reduce((t, s) => t + s.ms, 0);

// Silero VAD + pipeline.py: silences shorter than min_silence stay inside a speech group;
// each group keeps speech_pad on both sides, then GAP_MS follows it.
export function trim(segments: Segment[], preset: Preset): Segment[] {
  const pad = preset.speech_pad_ms;
  const out: Segment[] = [];
  let group: Segment[] = [];
  const flush = () => {
    if (!group.length) return;
    out.push({ kind: 'silence', ms: pad }, ...group, { kind: 'silence', ms: pad });
    out.push({ kind: 'gap', ms: GAP_MS });
    group = [];
  };
  segments.forEach((seg, i) => {
    const inner = i > 0 && i < segments.length - 1;
    if (seg.kind === 'speech') group.push(seg);
    else if (inner && group.length && seg.ms < preset.min_silence_duration_ms) group.push(seg);
    else flush();
  });
  flush();
  return out;
}

// Deterministic envelope: speech is a lumpy sine, everything else is noise floor.
export type Bar = { amp: number; kind: Kind };

// One bar per msPerBar of the whole take, sampled at its centre, so the bars span exactly
// duration(segments) and never overflow the trimmed box.
export function bars(segments: Segment[], noise: number, msPerBar = 60): Bar[] {
  const out: Bar[] = [];
  let seg = 0;
  let start = 0;
  const count = Math.floor(duration(segments) / msPerBar);
  for (let t = 0; t < count; t++) {
    const at = t * msPerBar + msPerBar / 2;
    while (at >= start + segments[seg].ms) start += segments[seg++].ms;
    const { kind, ms } = segments[seg];
    const jitter = 0.5 + 0.5 * Math.sin(t * 12.9898) * Math.sin(t * 4.1414);
    const n = noise * (0.6 + 0.4 * Math.abs(jitter));
    if (kind !== 'speech') {
      out.push({ amp: kind === 'gap' ? 0 : n, kind });
      continue;
    }
    const shape = Math.sin((Math.PI * (at - start)) / ms);
    out.push({ amp: Math.min(1, n + shape * (0.55 + 0.4 * Math.abs(Math.sin(t * 0.9)))), kind });
  }
  return out;
}

// The take sampled every msPerBar, with speech and noise kept apart so a figure can lower the
// noise without touching the voice. `at` is the sample's time in the raw take.
export type Sample = { at: number; kind: Kind; speech: number; jitter: number };

export function envelope(segments: Segment[], msPerBar = 60): Sample[] {
  const out: Sample[] = [];
  let seg = 0;
  let start = 0;
  const count = Math.floor(duration(segments) / msPerBar);
  for (let t = 0; t < count; t++) {
    const at = t * msPerBar + msPerBar / 2;
    while (at >= start + segments[seg].ms) start += segments[seg++].ms;
    const { kind, ms } = segments[seg];
    const jitter = 0.6 + 0.4 * Math.abs(0.5 + 0.5 * Math.sin(t * 12.9898) * Math.sin(t * 4.1414));
    const shape = kind === 'speech' ? Math.sin((Math.PI * (at - start)) / ms) : 0;
    out.push({ at, kind, speech: shape * (0.55 + 0.4 * Math.abs(Math.sin(t * 0.9))), jitter });
  }
  return out;
}

// What trim() keeps: each kept stretch of the raw take [from, to) and where it starts after the cut.
export type Span = { from: number; to: number; start: number };

export function spans(segments: Segment[], preset: Preset): Span[] {
  const pad = preset.speech_pad_ms;
  const out: Span[] = [];
  let t = 0;
  let group: [number, number] | null = null;
  let start = 0;
  const flush = () => {
    if (!group) return;
    const from = group[0] - pad;
    const to = group[1] + pad;
    out.push({ from, to, start });
    start += to - from + GAP_MS;
    group = null;
  };
  segments.forEach((seg, i) => {
    const inner = i > 0 && i < segments.length - 1;
    if (seg.kind === 'speech') group = group ? [group[0], t + seg.ms] : [t, t + seg.ms];
    else if (!(inner && group && seg.ms < preset.min_silence_duration_ms)) flush();
    t += seg.ms;
  });
  flush();
  return out;
}

// Where a moment of the raw take lands after the cut, or null if it was cut out.
export function afterCut(list: Span[], at: number): number | null {
  const span = list.find((s) => at >= s.from && at < s.to);
  return span ? span.start + (at - span.from) : null;
}
