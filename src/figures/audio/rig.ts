// The Audio Cleaner bench: a recording arrives on tape, a gantry carries three heads along it
// (denoise, find silences, polish), the silences close up and the clean take winds onto the reel.

import type { Content } from '../../content';
import { iso, type Point3, translateAlong } from '../../iso/iso-kit';
import { type Spring, spring } from '../../iso/react/live';
import {
  afterCut,
  DEEPFILTER_KEEP,
  duration,
  envelope,
  NOISE,
  PRESET_NAMES,
  PRESETS,
  type PresetName,
  spans,
  TAKE,
  trim,
} from '../../models/audio/model';
import { linear, type Seg, smoother } from '../engine/director';
import { focusParts, moveLayer } from '../engine/dom';
import { blank, type Io, Rig, type Station } from '../engine/rig';
import { barOf, FRAMES, gantryFrame, pointerOf, spokesOf, woundOf } from './geometry';
import {
  HALF,
  HEAD_DX,
  HEAD_LOW,
  HEAD_REST,
  HEIGHT,
  P,
  PARK_X,
  PRESET_ANGLES,
  REELS,
  TAPE,
  TAPE_Z,
  WIDTH,
  X0,
  X1,
  xOf,
} from './view';

const STROKE = HEAD_REST - HEAD_LOW;
const SAMPLES = envelope(TAKE, 100); // one bar per 100 ms keeps the voice readable
const RAW_X = SAMPLES.map((s) => xOf(s.at));
const SWEEP = 3.4; // seconds for one pass along the tape

type Pose = {
  gx: number;
  h0: number;
  h1: number;
  h2: number;
  feed: number;
  contract: number;
  wind: number;
};
type Text = Content['audio'];
// Each step and where its label points: the tape coming in, the three heads (they ride the gantry),
// and the right-hand reel, where the cleaned recording ends up.
const TAPE_AT = iso([xOf(1200), TAPE.y, TAPE_Z] as Point3, P);
const RESULT_AT = iso([REELS[1][0], REELS[1][1] - 10, 8] as Point3, P);
const labelsAt = (gx: number): [number, number][] => [
  TAPE_AT,
  ...HEAD_DX.map((dx, k) => iso([gx + dx, 0, HEAD_REST + 3 + k * 5] as Point3, P)),
  RESULT_AT,
];

const REST: Pose = { gx: PARK_X, h0: 0, h1: 0, h2: 0, feed: 0, contract: 0, wind: 0 };
const HEAD_KEYS = ['h0', 'h1', 'h2'] as const;
const sec = (ms: number) => (ms / 1000).toFixed(1);

// Where every sample of the raw take ends up after the cut; cut samples close up onto the next kept stretch.
function cutMap(name: PresetName) {
  const kept = spans(TAKE, PRESETS[name]);
  return SAMPLES.map((s) => {
    const at = afterCut(kept, s.at);
    if (at !== null) return { x: xOf(at), cut: false };
    const next = kept.find((k) => k.from > s.at);
    return { x: next ? xOf(next.start) : xOf(duration(trim(TAKE, PRESETS[name]))), cut: true };
  });
}

function finalLine(name: PresetName, t: Text) {
  const p = PRESETS[name];
  const after = duration(trim(TAKE, p));
  return `${sec(duration(TAKE))} s → ${sec(after)} s · ${t.params.silence} ${p.min_silence_duration_ms} ms · ${t.params.pad} ${p.speech_pad_ms} ms · noisereduce −${Math.round(p.prop_decrease * 100)}%`;
}

// The waveform for a moment of the run: voice, noise floor, and the silences the blade has marked.
type Tape = {
  heads: number; // head passes finished
  pass: number;
  gx: number;
  feed: number; // 0 = nothing yet, 1 = the whole recording is on the tape
  contract: number;
  preset: PresetName;
  map: ReturnType<typeof cutMap>;
};

function tapeOf({ heads, pass, gx, feed, contract, preset, map }: Tape) {
  const prop = PRESETS[preset].prop_decrease;
  const c = smoother(contract);
  const front = (k: number) =>
    heads > k ? Infinity : pass === k + 1 ? gx + HEAD_DX[k] : -Infinity;
  // While it arrives, the recording slides in off the left reel.
  const lag = (1 - smoother(feed)) * (X1 - X0 + 30);
  const [denoised, marked, polished] = [front(0), front(1), front(2)];
  const voice: string[] = [];
  const noise: string[] = [];
  const cut: string[] = [];
  SAMPLES.forEach((s, i) => {
    const m = map[i];
    const x = RAW_X[i] + (m.x - RAW_X[i]) * c - lag;
    if (x < X0 - 6) return;
    const floor = NOISE * (x < denoised ? DEEPFILTER_KEEP : 1) * (x < polished ? 1 - prop : 1);
    const bar = barOf(x, Math.max(0.35, Math.min(1, floor * s.jitter + s.speech) * HALF));
    if (m.cut && x < marked) cut.push(bar);
    else if (s.kind === 'speech') voice.push(bar);
    else noise.push(bar);
  });
  return {
    voice: voice.join(''),
    noise: noise.join(''),
    cut: cut.join(''),
    fade: (1 - c).toFixed(3),
  };
}

export const RAW_TAPE = tapeOf({
  heads: 0,
  pass: 0,
  gx: PARK_X,
  feed: 0,
  contract: 0,
  preset: 'natural',
  map: cutMap('natural'),
});

// Steps 2–4 follow the gantry wherever it is (see showStep); the tape steps frame the whole tape.
const STEPS: Station[] = Array.from({ length: 5 }, () => ({ frame: 'tape', parts: ['tape'] }));

/* ── The rig: the bench's logic, outside React ───────────────────── */

export class AudioRig extends Rig<Pose, PresetName, Text> {
  readonly r = {
    view: blank<HTMLDivElement>(),
    root: blank<HTMLDivElement>(),
    back: blank<SVGSVGElement>(),
    front: blank<SVGSVGElement>(),
    voice: blank<SVGPathElement>(),
    noise: blank<SVGPathElement>(),
    cut: blank<SVGPathElement>(),
    spokes: [blank<SVGPathElement>(), blank<SVGPathElement>()],
    wound: [blank<SVGPathElement>(), blank<SVGPathElement>()],
    pointer: blank<SVGPathElement>(),
  };
  private preset: PresetName = 'natural';
  private map = cutMap('natural');
  private stage = 0; // 0 waiting · 1 recording in · 2 noise removed · 3 silences trimmed · 4 final pass done
  private pass = 0; // the stage being swept now, 0 if none
  private knob: Spring = { at: PRESET_ANGLES[1], rate: 0 };

  constructor(io: Io<Text>) {
    super(REST, FRAMES, WIDTH, HEIGHT, STEPS, io);
  }

  protected done() {
    return this.stage >= 4;
  }

  protected labels(pose: Pose) {
    return labelsAt(pose.gx);
  }

  idle() {
    return this.io.t.fig.say.waiting;
  }

  // The head steps frame the gantry wherever it is now.
  override showStep(i: number, seconds = 1) {
    if (i === 0 || i === 4) return super.showStep(i, seconds);
    const frame = gantryFrame(this.director.pose.gx);
    this.director.aimBox(frame.box, frame.most, seconds);
    focusParts(this.r.root.current, ['gantry', 'tape']);
    this.io.step(i);
  }

  private head(k: number, on: boolean) {
    this.r.root.current
      ?.querySelector(`[data-head="${k}"] .iso-solid:nth-of-type(2)`)
      ?.toggleAttribute('data-lit', on);
  }

  /* per frame */

  private bars(p: Pose) {
    const tape = tapeOf({
      heads: Math.max(0, this.stage - 1),
      pass: this.pass,
      gx: p.gx,
      feed: p.feed,
      contract: p.contract,
      preset: this.preset,
      map: this.map,
    });
    this.put(this.r.voice.current, 'd', tape.voice);
    this.put(this.r.noise.current, 'd', tape.noise);
    this.put(this.r.cut.current, 'd', tape.cut);
    this.put(this.r.cut.current, 'opacity', tape.fade);
  }

  protected write(p: Pose) {
    const { r, put } = this;
    for (const el of [r.back.current, r.front.current])
      moveLayer(put, el, P, [p.gx, 0, 0], WIDTH, HEIGHT);
    HEAD_KEYS.forEach((key, k) => {
      put(
        r.root.current?.querySelector(`[data-head="${k}"]`),
        'transform',
        translateAlong(P, [0, 0, -STROKE * p[key]]),
      );
    });
    this.bars(p);
    put(r.spokes[0].current, 'd', spokesOf(0, -p.wind * 5 - p.feed * 9));
    put(r.spokes[1].current, 'd', spokesOf(1, p.wind * 5));
    put(r.wound[0].current, 'd', woundOf(0, 0.8 - 0.3 * p.feed - 0.2 * p.wind));
    put(r.wound[1].current, 'd', woundOf(1, 0.3 + 0.25 * p.wind));
    put(r.pointer.current, 'd', pointerOf(this.knob.at));
  }

  protected override springs(dt: number, calm: boolean) {
    const target = PRESET_ANGLES[PRESET_NAMES.indexOf(this.preset)];
    if (calm) {
      Object.assign(this.knob, { at: target, rate: 0 });
      return false;
    }
    return !spring(this.knob, target, dt, 90, 13);
  }

  /* choreography: the camera rides along with the gantry */

  private sweep(k: number, text: string): Seg<Pose>[] {
    const key = HEAD_KEYS[k];
    const from = X0 - 8 - HEAD_DX[k];
    const to = X1 + 8 - HEAD_DX[k];
    const back = 0.6 + Math.abs(this.director.pose.gx - from) / 220;
    return [
      {
        to: { gx: from },
        dur: back,
        start: () => {
          this.look('start', back, ['gantry', 'tape']);
          this.io.step(k + 1);
          this.io.narrate(text);
        },
      },
      { to: {}, dur: 0.6 },
      {
        to: { [key]: 1 } as Partial<Pose>,
        dur: 0.4,
        start: () => {
          this.pass = k + 1;
          this.head(k, true);
        },
      },
      {
        to: { gx: to },
        dur: SWEEP,
        ease: linear,
        start: () => this.look('end', SWEEP, ['gantry', 'tape']),
      },
      {
        to: { [key]: 0 } as Partial<Pose>,
        dur: 0.35,
        end: () => {
          this.stage = k + 2;
          this.pass = 0;
          this.head(k, false);
        },
      },
    ];
  }

  protected plan(): Seg<Pose>[] | null {
    const say = this.io.t.fig.say;
    const p = PRESETS[this.preset];
    if (this.stage === 0)
      return [
        {
          to: {},
          dur: 0.9,
          start: () => {
            this.showStep(0);
            this.io.narrate(say.arrive(sec(duration(TAKE))));
          },
        },
        {
          to: { feed: 1 },
          dur: 2.8,
          ease: linear,
          end: () => {
            this.stage = 1;
          },
        },
        { to: {}, dur: 0.6 },
      ];
    if (this.stage === 1) return this.sweep(0, say.denoise);
    if (this.stage === 2)
      return [
        ...this.sweep(1, say.detect(p.min_silence_duration_ms)),
        {
          to: { contract: 1, wind: 1 },
          dur: 1.8,
          start: () => {
            this.look('tape', 1.2, ['tape']);
            this.io.narrate(say.trim(p.speech_pad_ms));
          },
        },
        { to: {}, dur: 0.6 },
      ];
    if (this.stage === 3)
      return [
        ...this.sweep(2, say.polish(Math.round(p.prop_decrease * 100))),
        {
          to: { gx: PARK_X },
          dur: 1.4,
          start: () => {
            this.look('full', 1.4, ['tape']);
            this.io.step(4);
          },
          end: () => {
            this.io.narrate(finalLine(this.preset, this.io.t));
            this.io.finished(true);
          },
        },
      ];
    return null;
  }

  protected restart(preset: PresetName) {
    this.preset = preset;
    this.map = cutMap(preset);
    this.stage = 0;
    this.pass = 0;
    for (let k = 0; k < 3; k++) this.head(k, false);
  }

  // Jump to the end of a run: the cleaned recording, as it comes out.
  skip() {
    this.stage = 4;
    Object.assign(this.director.pose, { feed: 1, contract: 1, wind: 1 });
    this.io.step(4);
    this.write(this.director.pose);
    this.io.narrate(finalLine(this.preset, this.io.t));
    this.io.finished(true);
  }
}
