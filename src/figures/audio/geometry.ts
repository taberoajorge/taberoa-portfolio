import {
  corners,
  cylinder,
  joinPaths,
  knurl,
  lineOnTop,
  type Plan,
  type Plane,
  type Point3,
  pointsAt,
  ring,
  sideArc,
  sideSeam,
  slabOf,
  topTicks,
} from '../../iso/iso-kit';
import { benchOf } from '../parts/bench';
import { boxOf } from '../parts/frames';
import {
  BASE,
  BASE_H,
  BED,
  BED_H,
  FOOT_H,
  GANTRY_Z,
  HEAD_DX,
  HEAD_REST,
  KNOB,
  KNOB_R,
  KNOB_TOP,
  KNOB_Z,
  MS,
  P,
  PRESET_ANGLES,
  RAIL_H,
  RAIL_Y,
  REEL_H,
  REEL_R,
  REEL_Z,
  REELS,
  TAPE,
  TAPE_Z,
  X0,
  X1,
} from './view';

const slab = (plan: Plan, z: number, h: number, steps = 4, bevel = 0) =>
  slabOf(plan, z, h, P, steps, bevel);
const post = (cx: number, cy: number, r: number, z: number, h: number, steps = 20) =>
  cylinder(cx, cy, r, z, h, P, steps);
const dots = (points: Point3[]) => pointsAt(points, P);
const DEG = Math.PI / 180;

/* ── Base ─────────────────────────────────────────────────────────── */

export const BENCH = benchOf(P, {
  base: BASE,
  baseH: BASE_H,
  footH: FOOT_H,
  feet: 20,
  label: { x: 130, y: 40, w: 46, d: 13, r: 2 },
});

/* ── Rails the gantry runs on ─────────────────────────────────────── */

const RAIL = (y: number): Plan => ({ x: -164, y: y - 2.5, w: 328, d: 5, r: 1.6 });
const STOP = (x: number, y: number): Plan => ({ x: x - 3, y: y - 5, w: 6, d: 10, r: 1.2 });
const railSide = (y: number) => ({
  rail: slab(RAIL(y), 0, RAIL_H, 3),
  stops: [-166, 166].map((x) => slab(STOP(x, y), 0, RAIL_H + 3, 3, 0.4)),
  stopScrews: dots([-166, 166].map((x) => [x, y, RAIL_H + 3] as Point3)),
});
export const RAIL_BACK = railSide(-RAIL_Y);
export const RAIL_FRONT = railSide(RAIL_Y);

/* ── Bed, tape and the seconds ruler ──────────────────────────────── */

const SECOND = 1000 / MS;
const RULER = topTicks(X0, X1, SECOND / 2, 2, TAPE.y + TAPE.d + 0.6, BED_H, [1.6, 3.2], P);
export const BED_ART = {
  bed: slab(BED, 0, BED_H, 4, 0.6),
  tape: slab({ ...TAPE, x: -168, w: 336 }, BED_H, TAPE_Z - BED_H, 2),
  edge: joinPaths(
    [TAPE.y + 1.2, TAPE.y + TAPE.d - 1.2].map((y) => lineOnTop([-166, y], [166, y], TAPE_Z, P)),
  ),
  minor: RULER.minor,
  major: RULER.major,
  zero: lineOnTop([X0, TAPE.y + TAPE.d + 0.6], [X0, TAPE.y + TAPE.d + 4.4], BED_H, P),
  screws: dots(corners(BED, 4).map(([x, y]) => [x, y, BED_H] as Point3)),
};

/* ── Reels ────────────────────────────────────────────────────────── */

export const REEL_ART = REELS.map(([x, y]) => ({
  disc: post(x, y, REEL_R, REEL_Z, REEL_H, 64),
  flange: ring(x, y, REEL_R - 2, REEL_Z + REEL_H, P, 64),
  band: sideArc(x, y, REEL_R, REEL_Z + REEL_H / 2, P, 32),
  hub: post(x, y, 4, REEL_Z + REEL_H, 2.4, 24),
  hubRing: ring(x, y, 1.6, REEL_Z + REEL_H + 2.4, P, 16),
}));
// Three spokes on a reel's top, turned by `angle` (radians).
export function spokesOf(i: number, angle: number) {
  const [x, y] = REELS[i];
  const z = REEL_Z + REEL_H;
  return joinPaths(
    [0, 120, 240].map((a) => {
      const t = angle + a * DEG;
      const from: Plane = [x + Math.sin(t) * 5.5, y - Math.cos(t) * 5.5];
      const to: Plane = [x + Math.sin(t) * (REEL_R - 3), y - Math.cos(t) * (REEL_R - 3)];
      return lineOnTop(from, to, z, P);
    }),
  );
}
// The tape wound on a reel: a ring whose radius grows with the amount.
export const woundOf = (i: number, amount: number) =>
  ring(REELS[i][0], REELS[i][1], 7 + amount * 12, REEL_Z + REEL_H, P, 48);

/* ── Gantry (built at x = 0) and its three heads ──────────────────── */

const CARRIAGE = (y: number): Plan => ({ x: -9, y: y - 5, w: 18, d: 10, r: 2 });
const UPRIGHT = (y: number): Plan => ({ x: -3.5, y: y - 3, w: 7, d: 6, r: 1.2 });
const gantrySide = (y: number) => ({
  carriage: slab(CARRIAGE(y), RAIL_H, 4, 3, 0.4),
  screws: dots([
    [-6, y, RAIL_H + 4],
    [6, y, RAIL_H + 4],
  ]),
  upright: slab(UPRIGHT(y), RAIL_H + 4, GANTRY_Z - RAIL_H - 4, 3),
  seam: sideSeam(UPRIGHT(y), 20, P, 3),
});
export const GANTRY_BACK = gantrySide(-RAIL_Y);
export const GANTRY_FRONT_SIDE = gantrySide(RAIL_Y);

const BEAM: Plan = { x: -6, y: -RAIL_Y - 4, w: 12, d: RAIL_Y * 2 + 8, r: 2 };
const CARRIER: Plan = { x: -17, y: -7, w: 34, d: 14, r: 2.5 };
export const GANTRY_TOP = {
  carrier: slab(CARRIER, 30, GANTRY_Z - 30, 3, 0.5),
  carrierSeam: sideSeam(CARRIER, 34, P, 3),
  beam: slab(BEAM, GANTRY_Z, 6, 3, 0.6),
  groove: lineOnTop([0, -RAIL_Y + 2], [0, RAIL_Y - 2], GANTRY_Z + 6, P),
  screws: dots([-RAIL_Y, -4, 4, RAIL_Y].map((y) => [0, y, GANTRY_Z + 6] as Point3)),
};

// Built at rest; each head moves down on its own.
const stem = (dx: number) => post(dx, 0, 1.3, HEAD_REST + 3, 30 - HEAD_REST - 3, 12);
export const HEADS = [
  {
    // stage 1, DeepFilterNet: a pad that lowers the noise floor
    stem: stem(HEAD_DX[0]),
    body: post(HEAD_DX[0], 0, 4.4, HEAD_REST, 3, 22),
    mark: ring(HEAD_DX[0], 0, 2.6, HEAD_REST, P, 16),
  },
  {
    // stage 2, Silero VAD: a blade across the tape that marks long silences for the trim
    stem: stem(HEAD_DX[1]),
    body: slab({ x: HEAD_DX[1] - 0.9, y: -11, w: 1.8, d: 22, r: 0.4 }, HEAD_REST, 4, 2),
    mark: lineOnTop([HEAD_DX[1], -9], [HEAD_DX[1], 9], HEAD_REST + 4, P),
  },
  {
    // stage 3, noisereduce: a roller across the tape that takes a final pass
    stem: stem(HEAD_DX[2]),
    body: slab({ x: HEAD_DX[2] - 3.2, y: -11, w: 6.4, d: 22, r: 3.2 }, HEAD_REST, 3, 6),
    mark: joinPaths(
      [-6, 0, 6].map((y) =>
        lineOnTop([HEAD_DX[2] - 2.4, y], [HEAD_DX[2] + 2.4, y], HEAD_REST + 3, P),
      ),
    ),
  },
];

/* ── Preset selector ──────────────────────────────────────────────── */

const [KX, KY] = KNOB;
const onKnob = (deg: number, r: number): Plane => [
  KX + Math.sin(deg * DEG) * r,
  KY - Math.cos(deg * DEG) * r,
];
export const KNOB_ART = {
  plate: post(KX, KY, KNOB_R + 6, 0, KNOB_Z, 40),
  marks: joinPaths(
    PRESET_ANGLES.map((a) => lineOnTop(onKnob(a, KNOB_R + 2), onKnob(a, KNOB_R + 5), KNOB_Z, P)),
  ),
  dots: dots(PRESET_ANGLES.map((a) => [...onKnob(a, KNOB_R + 5.6), KNOB_Z] as Point3)),
  body: post(KX, KY, KNOB_R, KNOB_Z, KNOB_TOP - KNOB_Z, 36),
  knurl: knurl(KX, KY, KNOB_R, KNOB_Z, KNOB_TOP, 40, P),
  top: ring(KX, KY, KNOB_R - 1.6, KNOB_TOP, P, 32),
};
export const pointerOf = (deg: number) =>
  lineOnTop(onKnob(deg, 1.6), onKnob(deg, KNOB_R - 1.2), KNOB_TOP, P);

/* ── The waveform printed on the tape ─────────────────────────────── */

// One bar across the tape at x, `half` units each side of the centreline.
export const barOf = (x: number, half: number) => lineOnTop([x, -half], [x, half], TAPE_Z, P);

/* ── Camera framings ──────────────────────────────────────────────── */

const box = (x0: number, x1: number, y0: number, y1: number, z0: number, z1: number) =>
  boxOf(P, x0, x1, y0, y1, z0, z1);

// how much tape the camera keeps in view at each end of a sweep
const SPAN = 110;

export const FRAMES = {
  start: { box: box(X0 - 26, X0 + SPAN, -RAIL_Y - 4, RAIL_Y + 4, 0, GANTRY_Z + 6), most: 2 },
  end: { box: box(X1 - SPAN, X1 + 20, -RAIL_Y - 4, RAIL_Y + 4, 0, GANTRY_Z + 6), most: 2 },
  tape: { box: box(X0 - 40, X1 + 40, -24, 24, 0, 8), most: 1.6 },
  knob: { box: box(KNOB[0] - 26, KNOB[0] + 40, KNOB[1] - 30, KNOB[1] + 12, 0, 14), most: 2.4 },
};

// The gantry wherever it is now, with its three heads.
export const gantryFrame = (gx: number) => ({
  box: box(gx - 34, gx + 34, -RAIL_Y - 4, RAIL_Y + 4, 0, GANTRY_Z + 6),
  most: 2.4,
});
