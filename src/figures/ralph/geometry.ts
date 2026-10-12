import {
  corners,
  cylinder,
  haloOf,
  insetPlan,
  joinPaths,
  knurl,
  lineOnTop,
  onTop,
  type Plan,
  type Plane,
  type Point3,
  planOutline,
  pointsAt,
  radialTicks,
  ring,
  segment,
  sideArc,
  sideRing,
  sideSeam,
  slabOf,
} from '../../iso/iso-kit';
import { benchOf } from '../parts/bench';
import { boxOf } from '../parts/frames';
import {
  ARM_H,
  ARM_Z,
  BASE,
  BASE_H,
  BOARD,
  BOARD_TOP,
  BOARD_Z,
  CARD,
  CARD_H,
  CARD_PITCH,
  CARRIAGE,
  CARRIAGE_TOP,
  CARRIAGE_Z,
  COLUMN,
  COLUMN_TOP,
  DIAL,
  DIAL_FROM,
  DIAL_R,
  DIAL_SPAN,
  DIAL_TOP,
  DIAL_Z,
  EJECT_X,
  FOOT_H,
  HOLES,
  HOOK_Z,
  HOOKS,
  HOUSING_Z,
  LEDGE_Z,
  LOAD_X,
  MAG_POST_X,
  MAG_POST_Y,
  MAG_TOP,
  P,
  PROBE_REST,
  ROD_END_W,
  ROD_FROM,
  ROD_TO,
  ROD_Y,
  ROD_Z,
  STACK_Z,
  TEST_X,
  TRAY,
  TRAY_FLOOR,
  TRAY_WALL,
} from './view';

const slab = (plan: Plan, z: number, h: number, steps = 4, bevel = 0) =>
  slabOf(plan, z, h, P, steps, bevel);
const post = (cx: number, cy: number, r: number, z: number, h: number, steps = 20) =>
  cylinder(cx, cy, r, z, h, P, steps);
const shift = (plan: Plan, dx: number, dy = 0): Plan => ({
  ...plan,
  x: plan.x + dx,
  y: plan.y + dy,
});
const DEG = Math.PI / 180;

/* ── Base ─────────────────────────────────────────────────────────── */

export const BENCH = benchOf(P, {
  base: BASE,
  baseH: BASE_H,
  footH: FOOT_H,
  label: { x: 86, y: 41, w: 50, d: 13, r: 2 },
  strip: { x: -138, y: 51, w: 200, d: 6, r: 1 },
  marks: [LOAD_X, TEST_X, EJECT_X], // the stations: load, test, eject
});

/* ── Pegboard (guardrails) ────────────────────────────────────────── */

const BOARD_FACE = BOARD.y + BOARD.d;
const BOARD_FEET: Plan[] = [BOARD.x - 4, BOARD.x + BOARD.w - 8].map((x) => ({
  x,
  y: BOARD.y - 4,
  w: 12,
  d: 12,
  r: 2,
}));
const holes: Point3[] = [];
for (let x = BOARD.x + 8; x <= BOARD.x + BOARD.w - 8; x += 8)
  for (let z = BOARD_Z + 8; z <= BOARD_TOP - 6; z += 8)
    if (!(HOOKS.includes(x) && z === HOOK_Z)) holes.push([x, BOARD_FACE, z]);

export const BOARD_ART = {
  feet: BOARD_FEET.map((plan) => slab(plan, 0, BOARD_Z, 4, 0.5)),
  footScrews: pointsAt(
    BOARD_FEET.map((plan) => [plan.x + plan.w / 2, plan.y + 2.5, BOARD_Z] as Point3),
    P,
  ),
  board: slab(BOARD, BOARD_Z, BOARD_TOP - BOARD_Z, 3, 0.6),
  holes: pointsAt(holes, P),
  hooks: joinPaths(HOOKS.map((x) => sideRing([x, BOARD_FACE, HOOK_Z], 1.1, 'y', P, 12))),
  hookPins: joinPaths(
    HOOKS.map((x) => segment([x, BOARD_FACE, HOOK_Z], [x, BOARD_FACE + 3, HOOK_Z], P)),
  ),
};

// Tags swing about the tip of their hook pin, in the plane of the board.
export const tagPivot = (i: number): Point3 => [HOOKS[i], BOARD_FACE + 3, HOOK_Z];

// A guardrail tag hanging from hook i: a thin card on the board face, tied to the pin.
const TAG_TOP = HOOK_Z - 5;
const TAG_H = 13;
export const TAGS = HOOKS.map((x) => {
  const plan: Plan = { x: x - 5, y: BOARD_FACE + 0.4, w: 10, d: 0.9, r: 0.4 };
  const face = BOARD_FACE + 1.3;
  return {
    body: slab(plan, TAG_TOP - TAG_H, TAG_H, 2),
    eyelet: sideRing([x, face, TAG_TOP - 2], 0.9, 'y', P, 10),
    string: joinPaths([
      segment([x, BOARD_FACE + 3, HOOK_Z], [x - 1.2, face, TAG_TOP - 1.1], P),
      segment([x, BOARD_FACE + 3, HOOK_Z], [x + 1.2, face, TAG_TOP - 1.1], P),
    ]),
    rule: joinPaths(
      [0, 1].map((row) =>
        segment(
          [x - 3, face, TAG_TOP - 6 - row * 2.2],
          [x + (row ? 1 : 3), face, TAG_TOP - 6 - row * 2.2],
          P,
        ),
      ),
    ),
  };
});

/* ── Test station column and arm ──────────────────────────────────── */

const [CX, CY] = COLUMN;
const ARM: Plan = { x: CX - 5, y: CY - 5, w: 10, d: -CY + 11, r: 2 };
const ARM_TOP = ARM_Z + ARM_H;

export const COLUMN_ART = {
  flange: post(CX, CY, 9, 0, 2, 28),
  flangeScrews: pointsAt(
    [0, 90, 180, 270].map(
      (a) => [CX + 6.5 * Math.cos(a * DEG), CY + 6.5 * Math.sin(a * DEG), 2] as Point3,
    ),
    P,
  ),
  column: post(CX, CY, 4.5, 2, ARM_Z - 6),
  columnSeam: sideArc(CX, CY, 4.5, 20, P, 16),
  collar: post(CX, CY, 6.5, ARM_Z - 6, 6, 24),
  collarScrew: slab({ x: CX + 5.5, y: CY - 1.2, w: 3, d: 2.4, r: 0.6 }, ARM_Z - 4.4, 2.4, 2),
  top: post(CX, CY, 4.5, ARM_TOP, COLUMN_TOP - ARM_TOP),
  cap: post(CX, CY, 5.4, COLUMN_TOP, 1.4, 24),
};

export const ARM_ART = {
  arm: slab(ARM, ARM_Z, ARM_H, 3, 0.6),
  groove: lineOnTop([CX, CY + 9], [CX, -6], ARM_TOP, P),
  screws: pointsAt(
    [
      [CX, CY + 6.5, ARM_TOP],
      [CX, 3, ARM_TOP],
    ],
    P,
  ),
};

// Probe: housing under the arm end; stem and pad move down together.
export const PROBE_ART = {
  housing: post(0, 0, 4.6, HOUSING_Z, ARM_Z - HOUSING_Z, 24),
  housingSeams: joinPaths([HOUSING_Z + 4, ARM_Z - 4].map((z) => sideArc(0, 0, 4.6, z, P, 16))),
  housingLip: post(0, 0, 5.4, HOUSING_Z, 1.4, 24),
  stem: post(0, 0, 1.6, PROBE_REST + 3, ARM_Z - (PROBE_REST + 3), 14),
  stemCollar: post(0, 0, 2.6, PROBE_REST + 3, 2, 18),
  pad: post(0, 0, 3.8, PROBE_REST, 3, 24),
  padRing: ring(0, 0, 2.4, PROBE_REST, P, 18),
};

/* ── Guide rods ───────────────────────────────────────────────────── */

const RODS: Plan[] = [-ROD_Y, ROD_Y].map((y) => ({
  x: ROD_FROM,
  y: y - 2,
  w: ROD_TO - ROD_FROM,
  d: 4,
  r: 1.8,
}));
const ROD_ENDS: Plan[] = [ROD_FROM - ROD_END_W, ROD_TO].map((x) => ({
  x,
  y: -16,
  w: ROD_END_W,
  d: 32,
  r: 1.5,
}));

export const ROD_ART = {
  ends: ROD_ENDS.map((plan) => slab(plan, 0, ROD_Z + 5, 3, 0.5)),
  endScrews: pointsAt(
    ROD_ENDS.flatMap((plan) => [
      [plan.x + plan.w / 2, -13, ROD_Z + 5],
      [plan.x + plan.w / 2, 13, ROD_Z + 5],
    ]) as Point3[],
    P,
  ),
  rods: RODS.map((plan) => slab(plan, ROD_Z - 2, 4, 3)),
};

/* ── Carriage (built at x = 0) and the card it carries ────────────── */

const BUSHES: Plan[] = [-ROD_Y, ROD_Y].flatMap((y) =>
  [CARRIAGE.x + 1, CARRIAGE.x + CARRIAGE.w - 9].map((x) => ({ x, y: y - 4, w: 8, d: 8, r: 1.5 })),
);
const PINS: Plane[] = [
  [-15, -12.6],
  [15, -12.6],
];

export const CARRIAGE_ART = {
  halo: haloOf(CARRIAGE, 3, 1, P),
  bushes: BUSHES.map((plan) => slab(plan, ROD_Z - 3, CARRIAGE_Z - ROD_Z + 3, 3)),
  plate: slab(CARRIAGE, CARRIAGE_Z, CARRIAGE_TOP - CARRIAGE_Z, 4, 0.6),
  seat: planOutline(insetPlan(CARD, -1), CARRIAGE_TOP, P, 3),
  pins: PINS.map(([x, y]) => post(x, y, 1.2, CARRIAGE_TOP, 2.2, 12)),
  rivets: pointsAt(
    [-12, -6, 0, 6, 12].map((x) => [x, CARRIAGE.y + CARRIAGE.d - 1.6, CARRIAGE_TOP] as Point3),
    P,
  ),
};

const CARD_TOP = CARRIAGE_TOP + CARD_H;
const HOLE_AT = (i: number): Plane => [CARD.x + CARD.w - 4 - i * 3.6, CARD.y + 4];

export const CARD_ART = {
  body: slab(CARD, CARRIAGE_TOP, CARD_H, 3),
  rule: joinPaths(
    [0, 1, 2].map((row) =>
      onTop(
        [
          [CARD.x + 4, CARD.y + CARD.d - 5 - row * 3],
          [CARD.x + (row === 2 ? 14 : 20), CARD.y + CARD.d - 5 - row * 3],
        ],
        CARD_TOP,
        P,
      ),
    ),
  ),
  // punched holes, one per failed attempt
  holes: Array.from({ length: HOLES }, (_, i) =>
    ring(HOLE_AT(i)[0], HOLE_AT(i)[1], 1.1, CARD_TOP, P, 12),
  ),
};

/* ── Feed magazine at the load station ────────────────────────────── */

const MAG_POSTS = (y: number): Plane[] => [
  [LOAD_X - MAG_POST_X, y],
  [LOAD_X + MAG_POST_X, y],
];
const MAG_BAR = (y: number): Plan => ({
  x: LOAD_X - MAG_POST_X - 2.4,
  y: y - 2.4,
  w: MAG_POST_X * 2 + 4.8,
  d: 4.8,
  r: 1.4,
});
const magazineSide = (y: number) => ({
  feet: MAG_POSTS(y).map(([x, py]) => post(x, py, 3.6, 0, 1.6, 18)),
  posts: MAG_POSTS(y).map(([x, py]) => post(x, py, 1.8, 1.6, MAG_TOP - 1.6, 16)),
  // ledges reach in from each post under the edge of the stack
  ledges: MAG_POSTS(y).map(([x, py]) =>
    slab(
      { x: x - 2, y: py < 0 ? py + 1.2 : py - 9.2, w: 4, d: 8, r: 0.6 },
      LEDGE_Z,
      STACK_Z - LEDGE_Z,
      2,
    ),
  ),
  bar: slab(MAG_BAR(y), MAG_TOP, 3, 3, 0.4),
  barScrews: pointsAt(
    MAG_POSTS(y).map(([x, py]) => [x, py, MAG_TOP + 3] as Point3),
    P,
  ),
});

export const MAG_BACK = magazineSide(-MAG_POST_Y);
export const MAG_FRONT = magazineSide(MAG_POST_Y);

// Pending cards: slot i sits i pitches above the bottom of the stack.
export const STACK = Array.from({ length: 5 }, (_, i) => {
  const plan = shift(CARD, LOAD_X);
  const z = STACK_Z + i * CARD_PITCH;
  return { body: slab(plan, z, CARD_H, 3), z };
});
// A follower weight rides on top of the stack.
export const FOLLOWER = {
  body: slab(insetPlan(shift(CARD, LOAD_X), 4), 0, 3, 3, 0.4),
  knob: post(LOAD_X, 0, 2.6, 3, 3, 16),
  knurl: knurl(LOAD_X, 0, 2.6, 3, 6, 18, P),
};

/* ── Done tray ────────────────────────────────────────────────────── */

const WALL = 2;
const TRAY_IN = insetPlan(TRAY, WALL);
const wall = (plan: Plan) => slab(plan, TRAY_FLOOR, TRAY_WALL - TRAY_FLOOR, 2, 0.3);
export const TRAY_ART = {
  floor: slab(TRAY, 0, TRAY_FLOOR, 4),
  floorLine: planOutline(insetPlan(TRAY, WALL + 3), TRAY_FLOOR, P),
  far: [
    wall({ x: TRAY.x, y: TRAY.y, w: TRAY.w, d: WALL, r: 0.6 }),
    wall({ x: TRAY.x, y: TRAY.y + WALL, w: WALL, d: TRAY.d - WALL * 2, r: 0.6 }),
  ],
  near: [
    wall({ x: TRAY.x + TRAY.w - WALL, y: TRAY.y + WALL, w: WALL, d: TRAY.d - WALL * 2, r: 0.6 }),
    wall({ x: TRAY.x, y: TRAY.y + TRAY.d - WALL, w: TRAY.w, d: WALL, r: 0.6 }),
  ],
  nearSeam: sideSeam(
    { x: TRAY.x, y: TRAY.y + TRAY.d - WALL, w: TRAY.w, d: WALL, r: 0.6 },
    TRAY_WALL - 3,
    P,
    2,
  ),
  inner: TRAY_IN,
};

// Done cards: slot i lies i pitches above the tray floor.
const TRAY_CARD = shift(CARD, TRAY.x + TRAY.w / 2);
export const DONE = Array.from({ length: 5 }, (_, i) =>
  slab(TRAY_CARD, TRAY_FLOOR + i * CARD_PITCH, CARD_H, 3),
);
export const doneTop = (count: number) => TRAY_FLOOR + count * CARD_PITCH;

/* ── Verifier dial ────────────────────────────────────────────────── */

const [DX, DY] = DIAL;
const STAND: Plan = { x: DX - 10, y: DY - 10, w: 20, d: 20, r: 3 };
const TICKS = radialTicks(
  DX,
  DY,
  DIAL_R - 3,
  20,
  5,
  DIAL_TOP,
  [1.4, 3],
  P,
  DIAL_FROM * DEG,
  DIAL_SPAN * DEG,
);

export const DIAL_ART = {
  stand: slab(STAND, 0, DIAL_Z, 4, 0.5),
  standScrews: pointsAt(
    corners(STAND, 2.6).map(([x, y]) => [x, y, DIAL_Z] as Point3),
    P,
  ),
  puck: post(DX, DY, DIAL_R, DIAL_Z, DIAL_TOP - DIAL_Z, 56),
  band: sideArc(DX, DY, DIAL_R, DIAL_TOP - 3, P, 28),
  knurl: knurl(DX, DY, DIAL_R, DIAL_TOP - 3, DIAL_TOP, 72, P, 0.3),
  bezel: ring(DX, DY, DIAL_R - 1.8, DIAL_TOP, P, 56),
  minor: TICKS.minor,
  major: TICKS.major,
  hub: ring(DX, DY, 1.4, DIAL_TOP, P, 12),
  crown: slab({ x: DX + DIAL_R - 1, y: DY - 2, w: 4, d: 4, r: 0.8 }, DIAL_Z + 2.5, 3, 2),
  crownCap: post(DX + DIAL_R + 4.2, DY, 2.2, DIAL_Z + 2, 4, 14),
};

// Live dial parts, rebuilt when the needle or threshold moves.
const dialAngle = (value: number) => (DIAL_FROM + value * DIAL_SPAN) * DEG;
const onDial = (a: number, r: number): Plane => [DX + Math.sin(a) * r, DY - Math.cos(a) * r];
const dialPoint = (value: number, r: number) => onDial(dialAngle(value), r);
// The needle runs through the hub: a short tail opposite the tip.
export const needleOf = (value: number) =>
  lineOnTop(
    onDial(dialAngle(value) + Math.PI, 2.8),
    dialPoint(value, DIAL_R - 3.4),
    DIAL_TOP + 0.2,
    P,
  );
// The fail zone: from 0 up to the threshold, between the tick tips and the bezel.
export function failZoneOf(threshold: number) {
  const points: Plane[] = [];
  const steps = Math.max(2, Math.round(threshold * 48));
  for (let i = 0; i <= steps; i++) points.push(dialPoint((i / steps) * threshold, DIAL_R - 2.5));
  return onTop(points, DIAL_TOP, P);
}
// The threshold mark runs from the bezel in past the ticks.
export const thresholdOf = (threshold: number) =>
  lineOnTop(dialPoint(threshold, DIAL_R - 7.4), dialPoint(threshold, DIAL_R - 1.8), DIAL_TOP, P);

/* ── Camera framings: screen boxes [x0, y0, x1, y1] around each station ── */

const box = (x0: number, x1: number, y0: number, y1: number, z0: number, z1: number) =>
  boxOf(P, x0, x1, y0, y1, z0, z1);

export const FRAMES = {
  magazine: { box: box(LOAD_X - 26, LOAD_X + 26, -22, 22, 0, MAG_TOP + 3), most: 2.2 },
  // the card under the probe and the dial that reads it
  station: {
    box: box(-20, DIAL[0] + DIAL_R + 4, -16, DIAL[1] + DIAL_R, 0, ARM_Z + ARM_H),
    most: 2.5,
  },
  tray: {
    box: box(EJECT_X - 20, TRAY.x + TRAY.w + 2, TRAY.y - 2, TRAY.y + TRAY.d + 2, 0, 16),
    most: 2.5,
  },
  board: { box: box(BOARD.x, BOARD.x + BOARD.w, BOARD.y, 0, 44, BOARD_TOP), most: 1.9 },
};
