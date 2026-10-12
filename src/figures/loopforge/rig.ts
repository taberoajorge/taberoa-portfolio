// LoopForge's bench: story cards wait in a rack, the ready ones fly to free worktree lanes, probes
// verify them, and each card goes on to main or, after three failures, to human review.

import type { Content } from '../../content';
import { iso, type Point3, translateAlong } from '../../iso/iso-kit';
import {
  assigned,
  initial,
  isReady,
  type LoopForgeState,
  step,
} from '../../models/loopforge/model';
import { type Seg, smoother } from '../engine/director';
import { focusParts, shown } from '../engine/dom';
import { blank, type Io, Rig, type Station } from '../engine/rig';
import { FLAG_DROP, FRAMES } from './geometry';
import {
  ANVIL_H,
  BRIDGE_H,
  BRIDGE_Y,
  BRIDGE_Z,
  FLAG_X,
  FLAG_Y,
  HEIGHT,
  LAMP_X,
  LANE_X,
  LANE_Y,
  MAIN_H,
  MAIN_X,
  MAIN_Y,
  P,
  PAD_PRESS,
  PAD_REST,
  PITCH,
  POCKET_Y,
  RACK,
  RACK_H,
  RACK_X,
  REVIEW,
  REVIEW_FLOOR,
  STORIES,
  WIDTH,
} from './view';

const STROKE = PAD_REST - PAD_PRESS;
const ARC = 26; // how high a card is lifted when it changes station

type Pose = { p0: number; p1: number; p2: number; fly: number; flag: number; lift: number };
type Text = Content['loopforge'];
type Flight = { from: Point3; to: Point3; delay: number; span: number };

// Each step: the station the camera frames, what stays in focus, and where its label points.
const STEPS: (Station & { at: Point3 })[] = [
  { frame: 'rack', parts: ['rack'], at: [RACK_X, RACK.y, RACK_H] },
  { frame: 'lanes', parts: ['lanes'], at: [LANE_X, -BRIDGE_Y + 12, BRIDGE_Z + BRIDGE_H] },
  { frame: 'lanes', parts: ['lanes'], at: [LAMP_X, LANE_Y[2] + 6, 2.6] },
  { frame: 'out', parts: ['out'], at: [MAIN_X, MAIN_Y, MAIN_H + 21] },
  { frame: 'out', parts: ['out'], at: [FLAG_X, FLAG_Y, 35] },
];
const ANCHORS = STEPS.map((step) => iso(step.at, P));

const REST: Pose = { p0: 0, p1: 0, p2: 0, fly: 0, flag: 0, lift: 0 };
const PRESS = ['p0', 'p1', 'p2'] as const;

export const rackAt = (i: number): Point3 => [RACK_X, POCKET_Y(i), RACK_H];
const laneAt = (l: number): Point3 => [LANE_X, LANE_Y[l], ANVIL_H];
const mainAt = (n: number): Point3 => [MAIN_X, MAIN_Y, MAIN_H + n * PITCH];
const reviewAt = (n: number): Point3 => [
  REVIEW.x + REVIEW.w / 2,
  REVIEW.y + REVIEW.d / 2,
  REVIEW_FLOOR + n * PITCH,
];
const ready = (s: LoopForgeState) => s.stories.filter((x) => isReady(s.stories, x.id)).length;
const START = initial();
export const BLOCKED = START.stories.filter((x) => !isReady(START.stories, x.id)).map((x) => x.id);

/* ── The rig: the bench's logic, outside React ───────────────────── */

export class LoopForgeRig extends Rig<Pose, number, Text> {
  readonly r = {
    view: blank<HTMLDivElement>(),
    root: blank<HTMLDivElement>(),
    flag: blank<SVGGElement>(),
  };
  private model = initial();
  private cardAt: Point3[] = Array.from({ length: STORIES }, (_, k) => rackAt(k));
  private flights = new Map<number, Flight>();
  private freeing: number[] = [];
  private merged = 0;
  private reviewed = 0;

  constructor(io: Io<Text>) {
    super(REST, FRAMES, WIDTH, HEIGHT, STEPS, io);
  }

  protected done() {
    return this.model.finished;
  }

  protected labels() {
    return ANCHORS;
  }

  idle() {
    return this.io.t.fig.idle(ready(this.model), this.model.lanes.length);
  }

  private say(text: string) {
    this.io.narrate(text);
  }

  private names(ids: number[]) {
    return ids.map((id) => this.io.t.stories[id]).join(', ');
  }

  /* drawing state */

  private lit(id: number, on: boolean) {
    this.el(`[data-card="${id}"] .iso-solid`)?.toggleAttribute('data-lit', on);
  }

  private lamps(lane: number, n: number) {
    for (let i = 0; i < 3; i++) shown(this.el(`[data-lamp="${lane}-${i}"]`), i < n);
  }

  private locks() {
    const s = this.model;
    for (const story of s.stories)
      shown(
        this.el(`[data-lock="${story.id}"]`),
        story.status === 'queued' && !isReady(s.stories, story.id),
      );
  }

  private shutters() {
    for (let l = 0; l < LANE_Y.length; l++)
      shown(this.el(`[data-shutter="${l}"]`), l >= this.model.lanes.length);
  }

  // Cards leave one after another, so the eye can follow each one to where it lands.
  private fly(moves: [number, Point3][]) {
    this.director.pose.fly = 0;
    const span = moves.length > 1 ? 0.55 : 1;
    moves.forEach(([id, to], i) => {
      const delay = moves.length > 1 ? (i * (1 - span)) / (moves.length - 1) : 0;
      this.flights.set(id, { from: this.cardAt[id], to, delay, span });
    });
  }
  private flightTime = (n: number) => 0.9 + 0.6 * n;

  private land() {
    for (const [id, f] of this.flights) this.cardAt[id] = f.to;
    this.flights.clear();
  }

  /* per frame */

  protected write(p: Pose) {
    for (let id = 0; id < STORIES; id++) {
      const f = this.flights.get(id);
      const s = f ? smoother(Math.min(1, Math.max(0, (p.fly - f.delay) / f.span))) : 0;
      const pos: Point3 = f
        ? [
            f.from[0] + (f.to[0] - f.from[0]) * s,
            f.from[1] + (f.to[1] - f.from[1]) * s,
            f.from[2] + (f.to[2] - f.from[2]) * s + ARC * Math.sin(Math.PI * s),
          ]
        : this.cardAt[id];
      this.put(this.el(`[data-card="${id}"]`), 'transform', translateAlong(P, pos));
    }
    PRESS.forEach((key, l) => {
      this.put(
        this.el(`[data-probe="${l}"]`),
        'transform',
        translateAlong(P, [0, 0, -STROKE * p[key]]),
      );
    });
    this.put(
      this.r.flag.current,
      'transform',
      translateAlong(P, [0, 0, -FLAG_DROP * (1 - p.flag)]),
    );
    // unlocked pins rise out of their tray and fade
    for (const id of this.freeing) {
      const pin = this.el(`[data-lock="${id}"]`);
      this.put(pin, 'transform', translateAlong(P, [0, 0, 12 * smoother(p.lift)]));
      this.put(pin, 'opacity', (1 - smoother(p.lift)).toFixed(3));
    }
  }

  /* choreography: one wide view, the steps in order, a short beat whenever the step changes */

  private phase(i: number, text: string, parts: string[]) {
    focusParts(this.r.root.current, parts);
    this.io.step(i);
    this.say(text);
  }

  private waiting(s: LoopForgeState) {
    return s.stories.filter((x) => x.status === 'queued' && !isReady(s.stories, x.id)).length;
  }

  // 1 · the queue: what is ready, what waits; 2 · ready cards go to free worktrees, one by one.
  private fillSegs(s0: LoopForgeState, lanes: (number | null)[]): Seg<Pose>[] {
    const say = this.io.t.fig.say;
    const comers = lanes.flatMap((id, l) =>
      id !== null && s0.stories[id].status === 'queued' ? [[id, l]] : [],
    );
    if (!comers.length) return [];
    const ids = comers.map(([id]) => id);
    return [
      {
        to: {},
        dur: 1.8,
        start: () => this.phase(0, say.queue(this.names(ids), this.waiting(s0)), ['rack']),
      },
      {
        to: { fly: 1 },
        dur: this.flightTime(comers.length),
        start: () => {
          this.phase(1, say.fill(this.names(ids)), ['rack', 'lanes']);
          this.fly(comers.map(([id, l]) => [id, laneAt(l)]));
          for (const [id, l] of comers) {
            this.lit(id, true);
            this.lamps(l, 0);
          }
        },
        end: () => this.land(),
      },
      { to: {}, dur: 0.5 },
    ];
  }

  // 2 · the probes work together; 3 · the verdicts: a lamp for each failure.
  private workSegs(s1: LoopForgeState, lanes: (number | null)[]): Seg<Pose>[] {
    const say = this.io.t.fig.say;
    const busy = lanes.map((id) => id !== null);
    const press = Object.fromEntries(
      PRESS.map((key, l) => [key, busy[l] ? 1 : 0]),
    ) as Partial<Pose>;
    const lift = Object.fromEntries(PRESS.map((key) => [key, 0])) as Partial<Pose>;
    const of = (status: string) =>
      lanes.filter((id): id is number => id !== null && s1.stories[id].status === status);
    return [
      { to: press, dur: 0.6, start: () => this.phase(1, say.work, ['lanes']) },
      { to: {}, dur: 1 },
      {
        to: lift,
        dur: 0.5,
        start: () => {
          this.model = s1;
          lanes.forEach((id, l) => {
            if (id !== null) this.lamps(l, s1.stories[id].fails);
          });
          this.phase(
            2,
            say.results(
              this.names(of('merged')),
              this.names(of('running')),
              this.names(of('review')),
            ),
            ['lanes'],
          );
        },
      },
      { to: {}, dur: 1.2 },
    ];
  }

  // 4 · passes go to main; 5 · three failures in a row go to human review.
  private outSegs(s1: LoopForgeState, lanes: (number | null)[]): Seg<Pose>[] {
    const say = this.io.t.fig.say;
    const going = (status: string) =>
      lanes.filter((id): id is number => id !== null && s1.stories[id].status === status);
    const move = (ids: number[], to: () => Point3, stepIndex: number, text: string): Seg<Pose>[] =>
      ids.length
        ? [
            {
              to: { fly: 1 },
              dur: this.flightTime(ids.length),
              start: () => {
                this.phase(stepIndex, text, ['lanes', 'out']);
                for (const id of ids) {
                  this.lit(id, false);
                  this.lamps(lanes.indexOf(id), 0);
                }
                this.fly(ids.map((id) => [id, to()]));
              },
              end: () => this.land(),
            },
            { to: {}, dur: 0.6 },
          ]
        : [];
    const merged = going('merged');
    const review = going('review');
    return [
      ...move(merged, () => mainAt(this.merged++), 3, say.merged(this.names(merged))),
      ...move(review, () => reviewAt(this.reviewed++), 4, say.review(this.names(review))),
      ...(review.length
        ? [
            { to: { flag: 1 }, dur: 0.7 },
            { to: {}, dur: 0.6 },
          ]
        : []),
    ];
  }

  // Back to 1 · the queue: stories whose dependencies just merged lose their pin.
  private unlockSegs(s0: LoopForgeState, s1: LoopForgeState): Seg<Pose>[] {
    if (s1.finished)
      return [
        {
          to: {},
          dur: 0.4,
          start: () => {
            focusParts(this.r.root.current, null);
            this.io.narrate(this.io.t.finished(s1.tick));
            this.io.finished(true);
          },
        },
      ];
    const freed = s1.stories
      .filter((x) => isReady(s1.stories, x.id) && !isReady(s0.stories, x.id))
      .map((x) => x.id);
    if (!freed.length) return [];
    return [
      {
        to: { lift: 1 },
        dur: 1,
        start: () => {
          this.freeing = freed;
          this.director.pose.lift = 0;
          this.phase(0, this.io.t.fig.say.unlock(this.names(freed)), ['rack']);
        },
        end: () => {
          this.locks();
          for (const id of freed) {
            const pin = this.el(`[data-lock="${id}"]`);
            pin?.removeAttribute('transform');
            pin?.removeAttribute('opacity');
            if (pin) this.put.forget(pin);
          }
          this.freeing = [];
        },
      },
      { to: {}, dur: 0.6 },
    ];
  }

  protected plan() {
    const s0 = this.model;
    if (s0.finished) return null;
    const lanes = assigned(s0);
    const s1 = step(s0);
    if (s1 === s0) return null;
    this.director.aim('full', 1); // the whole bench stays in view while it runs
    return [
      ...this.fillSegs(s0, lanes),
      ...this.workSegs(s1, lanes),
      ...this.outSegs(s1, lanes),
      ...this.unlockSegs(s0, s1),
    ];
  }

  protected restart(lanes: number) {
    this.model = initial({ lanes });
    this.cardAt = Array.from({ length: STORIES }, (_, k) => rackAt(k));
    this.flights.clear();
    this.merged = 0;
    this.reviewed = 0;
    for (let id = 0; id < STORIES; id++) this.lit(id, false);
    for (let l = 0; l < LANE_Y.length; l++) this.lamps(l, 0);
    this.locks();
    this.shutters();
  }
}
