// Ralph's bench: a card per story rides from the magazine to the test station, the probe presses,
// the dial reads a roll, and a passing card drops into the tray. Failing twice hangs a guardrail tag.

import type { Content } from '../../content';
import { axisVector, iso, type Point3, translateAlong } from '../../iso/iso-kit';
import { type Spring, spring } from '../../iso/react/live';
import { effectivePFail, initial, type RalphState, step } from '../../models/ralph/model';
import { fall, linear, type Seg, settle, smoother } from '../engine/director';
import { moveLayer, shown } from '../engine/dom';
import { blank, type Io, Rig, type Station } from '../engine/rig';
import { doneTop, FRAMES, failZoneOf, needleOf, TAGS, tagPivot, thresholdOf } from './geometry';
import {
  ARM_H,
  ARM_Z,
  BOARD as BOARD_PLAN,
  BOARD_TOP,
  CARD_PITCH,
  CARRIAGE_TOP,
  DIAL,
  DIAL_R,
  DIAL_TOP,
  EJECT_X,
  HEIGHT,
  LOAD_X,
  MAG_POST_Y,
  MAG_TOP,
  P,
  PROBE_PRESS,
  PROBE_REST,
  STACK_Z,
  TEST_X,
  TRAY,
  TRAY_WALL,
  TRAY_X,
  WIDTH,
} from './view';

const STROKE = PROBE_REST - PROBE_PRESS;
const DROP = STACK_Z - CARRIAGE_TOP;

type Pose = { car: number; probe: number; slide: number; drop: number; stack: number };
type Machine = { model: RalphState; loaded: number | null; stack: number; done: number };
type Swing = Spring & { done?: boolean };
type Text = Content['ralph'];

// Each step: the station the camera frames, what stays in focus, and where its label points.
const STEPS: (Station & { at: Point3 })[] = [
  { frame: 'magazine', parts: ['magazine', 'carriage'], at: [LOAD_X, -MAG_POST_Y, MAG_TOP + 3] },
  { frame: 'station', parts: ['station', 'carriage'], at: [0, 0, ARM_Z + ARM_H] },
  { frame: 'station', parts: ['station'], at: [DIAL[0], DIAL[1] - DIAL_R, DIAL_TOP] },
  {
    frame: 'board',
    parts: ['board'],
    at: [BOARD_PLAN.x + 26, BOARD_PLAN.y + BOARD_PLAN.d, BOARD_TOP],
  },
  { frame: 'tray', parts: ['tray'], at: [TRAY_X, TRAY.y, TRAY_WALL] },
];
const ANCHORS = STEPS.map((step) => iso(step.at, P));

const REST: Pose = { car: LOAD_X, probe: 0, slide: 0, drop: 1, stack: 0 };
const travel = (from: number, to: number) => 0.35 + Math.abs(to - from) / 230;
const fresh = (pFail: number): Machine => ({
  model: initial({ pFail }),
  loaded: null,
  stack: 5,
  done: 0,
});

function readoutOf(b: Machine, t: Text) {
  const s = b.model;
  const done = s.stories.filter((x) => x.status === 'done').length;
  if (s.finished && done === s.stories.length) return t.doneAll(s.iteration);
  if (s.finished)
    return t.capped(
      s.stories
        .filter((x) => x.status !== 'done')
        .map((x) => t.stories[x.id])
        .join(', '),
    );
  if (b.loaded === null) return t.fig.idle(b.stack, Math.round(s.pFail * 100));
  return t.fig.running(t.stories[b.loaded], s.stories[b.loaded].fails + 1, done, s.stories.length);
}

// A rotation by `angle` in the board's x–z plane about `pivot`, as a screen-space SVG matrix:
// L · R · L⁻¹, where L's columns are the screen images of world x and z.
function swingMatrix(pivot: Point3, angle: number) {
  const [ax, ay] = axisVector(P, [1, 0, 0]);
  const [bx, by] = axisVector(P, [0, 0, 1]);
  const det = ax * by - bx * ay;
  const c = Math.cos(angle);
  const s = Math.sin(angle);
  const r00 = ax * c + bx * s;
  const r01 = -ax * s + bx * c;
  const r10 = ay * c + by * s;
  const r11 = -ay * s + by * c;
  const m00 = (r00 * by - r01 * ay) / det;
  const m01 = (-r00 * bx + r01 * ax) / det;
  const m10 = (r10 * by - r11 * ay) / det;
  const m11 = (-r10 * bx + r11 * ax) / det;
  const [hx, hy] = iso(pivot, P);
  const e = hx - (m00 * hx + m01 * hy);
  const f = hy - (m10 * hx + m11 * hy);
  return `matrix(${[m00, m10, m01, m11, e, f].map((n) => n.toFixed(4)).join(' ')})`;
}

/* ── The rig: the bench's logic, outside React ───────────────────── */

export class RalphRig extends Rig<Pose, number, Text> {
  readonly r = {
    view: blank<HTMLDivElement>(),
    root: blank<HTMLDivElement>(),
    car: blank<SVGSVGElement>(),
    stack: blank<SVGSVGElement>(),
    probe: blank<SVGSVGElement>(),
    eject: blank<SVGSVGElement>(),
    carCard: blank<SVGGElement>(),
    ejectCard: blank<SVGGElement>(),
    follower: blank<SVGGElement>(),
    needle: blank<SVGPathElement>(),
    zone: blank<SVGPathElement>(),
    mark: blank<SVGPathElement>(),
  };
  private bench = fresh(0.3);
  private needle: Spring = { at: 0, rate: 0 };
  private needleTarget = 0;
  private swings = new Map<number, Swing>();

  constructor(io: Io<Text>) {
    super(REST, FRAMES, WIDTH, HEIGHT, STEPS, io);
  }

  protected done() {
    return this.bench.model.finished;
  }

  protected labels() {
    return ANCHORS;
  }

  idle() {
    return readoutOf(this.bench, this.io.t);
  }

  /* drawing state */

  private holes(card: SVGGElement | null, n: number) {
    card?.querySelectorAll<SVGElement>('[data-hole]').forEach((hole, i) => {
      hole.style.opacity = i < n ? '1' : '0';
    });
  }

  private stack(n: number) {
    for (const [i, slot] of this.all('[data-slot]').entries()) shown(slot, i < n);
    this.r.follower.current?.setAttribute(
      'transform',
      translateAlong(P, [0, 0, STACK_Z + n * CARD_PITCH]),
    );
  }

  private landed(n: number) {
    for (const [i, slot] of this.all('[data-done]').entries()) shown(slot, i < n);
  }

  private tags(n: number) {
    for (const [i, tag] of this.all('[data-tag]').entries()) {
      const was = !tag.hasAttribute('display');
      shown(tag, i < n);
      if (i < n && !was) this.swings.set(i, { at: 0.42, rate: 0 }); // a new tag swings in
      if (i >= n) {
        this.swings.delete(i);
        tag.removeAttribute('transform');
        this.put.forget(tag);
      }
    }
  }

  private threshold(thr: number) {
    this.r.zone.current?.setAttribute('d', failZoneOf(thr));
    this.r.mark.current?.setAttribute('d', thresholdOf(thr));
  }

  private say(text: string) {
    const s = this.bench.model;
    const done = s.stories.filter((x) => x.status === 'done').length;
    this.io.narrate(`${done}/${s.stories.length} · ${text}`);
  }

  /* per frame */

  protected write(p: Pose) {
    const { r, put } = this;
    moveLayer(put, r.car.current, P, [p.car, 0, 0], WIDTH, HEIGHT);
    moveLayer(put, r.probe.current, P, [0, 0, -STROKE * p.probe], WIDTH, HEIGHT);
    moveLayer(put, r.stack.current, P, [0, 0, CARD_PITCH * p.stack], WIDTH, HEIGHT);
    put(r.carCard.current, 'transform', translateAlong(P, [0, 0, DROP * (1 - p.drop)]));
    // the ejected card slides along x for the first 70%, then falls into the tray
    const top = doneTop(this.bench.done) - CARRIAGE_TOP;
    const x = EJECT_X + (TRAY_X - EJECT_X) * smoother(Math.min(1, p.slide / 0.7));
    const z = p.slide <= 0.7 ? 0 : top * fall((p.slide - 0.7) / 0.3);
    moveLayer(put, r.eject.current, P, [x, 0, z], WIDTH, HEIGHT);
    put(r.needle.current, 'd', needleOf(this.needle.at));
    for (const [i, sw] of this.swings) {
      put(
        r.root.current?.querySelector(`[data-tag="${i}"]`),
        'transform',
        swingMatrix(tagPivot(i), sw.at),
      );
      if (sw.done) this.swings.delete(i);
    }
  }

  // Needle and tags are springs: they keep moving between segments and settle on their own.
  protected override springs(dt: number, calm: boolean) {
    let moving = false;
    const n = this.needle;
    if (calm) Object.assign(n, { at: this.needleTarget, rate: 0 });
    else if (!spring(n, this.needleTarget, dt, 120, 12)) moving = true;
    for (const sw of this.swings.values()) {
      if (calm) Object.assign(sw, { at: 0, rate: 0 });
      sw.done = calm || spring(sw, 0, dt, 22, 1.5);
      if (!sw.done) moving = true;
    }
    return moving;
  }

  /* events */

  private load(k: number) {
    const b = this.bench;
    b.loaded = k;
    b.stack -= 1;
    this.stack(b.stack);
    this.director.pose.stack = 1; // the cards left behind start one pitch up, then settle
    this.director.pose.drop = 0; // the loaded card starts where the bottom of the stack was
    this.holes(this.r.carCard.current, 0);
    shown(this.r.carCard.current, true);
  }

  private commit(s1: RalphState) {
    const b = this.bench;
    b.model = s1;
    if (b.loaded !== null) {
      const story = s1.stories[b.loaded];
      this.holes(this.r.carCard.current, story.fails);
      this.threshold(effectivePFail(s1.pFail, story.guardrails));
    }
    this.tags(
      Math.min(
        TAGS.length,
        s1.stories.reduce((n, x) => n + x.guardrails, 0),
      ),
    );
    if (s1.finished) this.io.finished(true);
  }

  private startEject(k: number) {
    const b = this.bench;
    b.loaded = null;
    shown(this.r.carCard.current, false);
    this.holes(this.r.ejectCard.current, b.model.stories[k].fails);
    shown(this.r.ejectCard.current, true);
    this.threshold(b.model.pFail);
  }

  private endEject() {
    const b = this.bench;
    b.done += 1;
    this.landed(b.done);
    shown(this.r.ejectCard.current, false);
    this.director.pose.slide = 0;
    if (b.model.finished) {
      this.look('full', 1.4, null);
      this.io.narrate(readoutOf(b, this.io.t));
    }
  }

  /* choreography: the camera glides to each station while the parts move */

  private loadSegs(k: number): Seg<Pose>[] {
    const { t } = this.io;
    const toLoad = Math.max(0.9, travel(this.director.pose.car, LOAD_X));
    const toTest = Math.max(1, travel(LOAD_X, TEST_X));
    return [
      {
        to: { car: LOAD_X },
        dur: toLoad,
        start: () => {
          this.showStep(0, toLoad);
          this.say(t.fig.say.load(t.stories[k]));
        },
      },
      {
        to: { drop: 1, stack: 0 },
        dur: 0.5,
        ease: { drop: fall, stack: settle },
        start: () => this.load(k),
      },
      { to: {}, dur: 0.35 },
      {
        to: { car: TEST_X },
        dur: toTest,
        start: () => {
          this.showStep(1, toTest);
          this.say(t.fig.say.test);
        },
      },
    ];
  }

  private testSegs(s1: RalphState, k: number, retry: boolean): Seg<Pose>[] {
    const say = this.io.t.fig.say;
    const fixed = (n: number | null) => Number((n ?? 0).toFixed(2));
    const verdict =
      s1.last === 'pass'
        ? say.pass
        : s1.last === 'guardrail'
          ? say.guardrail
          : say.fail(s1.stories[k].fails);
    return [
      {
        to: { probe: 1 },
        dur: 0.5,
        start: () => {
          this.needleTarget = 0;
          if (retry) this.say(say.test);
          if (retry) this.io.step(1);
        },
      },
      {
        to: {},
        dur: 1.1,
        start: () => {
          this.needleTarget = s1.roll ?? 0;
          this.say(say.roll(fixed(s1.roll), fixed(s1.threshold)));
          this.io.step(2);
        },
      },
      {
        to: { probe: 0 },
        dur: 0.45,
        start: () => {
          this.commit(s1);
          this.say(verdict);
        },
      },
    ];
  }

  private afterSegs(s1: RalphState, k: number): Seg<Pose>[] {
    if (s1.last === 'fail') return [{ to: {}, dur: 0.7 }];
    if (s1.last === 'guardrail')
      return [
        { to: {}, dur: 2.4, start: () => this.showStep(3, 1.1) },
        { to: {}, dur: 1, start: () => this.showStep(1, 1) },
      ];
    const toEject = Math.max(0.9, travel(TEST_X, EJECT_X));
    return [
      {
        to: { car: EJECT_X },
        dur: toEject,
        start: () => this.showStep(4, toEject),
      },
      {
        to: { slide: 1 },
        dur: 0.9,
        ease: linear,
        start: () => this.startEject(k),
        end: () => this.endEject(),
      },
      { to: {}, dur: 0.5 },
    ];
  }

  protected plan() {
    const b = this.bench;
    const s1 = step(b.model);
    if (s1 === b.model || s1.current === null) return null;
    const k = s1.current;
    const retry = b.loaded === k;
    return [
      ...(retry ? [] : this.loadSegs(k)),
      ...this.testSegs(s1, k, retry),
      ...this.afterSegs(s1, k),
    ];
  }

  protected restart(pFail: number) {
    this.needle = { at: 0, rate: 0 };
    this.needleTarget = 0;
    this.bench = fresh(pFail);
    this.stack(5);
    this.landed(0);
    this.tags(0);
    this.swings.clear();
    this.threshold(pFail);
    shown(this.r.carCard.current, false);
    shown(this.r.ejectCard.current, false);
  }
}
