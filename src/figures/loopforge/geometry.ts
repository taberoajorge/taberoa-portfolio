import {
  corners,
  cylinder,
  insetPlan,
  joinPaths,
  lineOnTop,
  onTop,
  type Plan,
  type Point3,
  planOutline,
  pointsAt,
  ring,
  sideArc,
  sideSeam,
  slabOf,
} from '../../iso/iso-kit';
import { benchOf } from '../parts/bench';
import { boxOf } from '../parts/frames';
import {
  ANVIL,
  ANVIL_H,
  BASE,
  BASE_H,
  BRIDGE_H,
  BRIDGE_Y,
  BRIDGE_Z,
  CARD,
  CARD_H,
  FLAG_X,
  FLAG_Y,
  FOOT_H,
  HOUSING_Z,
  LAMP_X,
  LANE_X,
  LANE_Y,
  MAIN,
  MAIN_H,
  P,
  PAD_REST,
  POCKET_Y,
  RACK,
  RACK_H,
  RACK_X,
  REVIEW,
  REVIEW_FLOOR,
  REVIEW_WALL,
  STORIES,
} from './view';

const slab = (plan: Plan, z: number, h: number, steps = 4, bevel = 0) =>
  slabOf(plan, z, h, P, steps, bevel);
const post = (cx: number, cy: number, r: number, z: number, h: number, steps = 20) =>
  cylinder(cx, cy, r, z, h, P, steps);
const at = (plan: Plan, x: number, y: number): Plan => ({ ...plan, x: plan.x + x, y: plan.y + y });
const dots = (points: Point3[]) => pointsAt(points, P);

/* ── Base ─────────────────────────────────────────────────────────── */

export const BENCH = benchOf(P, {
  base: BASE,
  baseH: BASE_H,
  footH: FOOT_H,
  label: { x: 92, y: BASE.y + BASE.d - 17, w: 44, d: 12, r: 2 },
  strip: { x: -136, y: BASE.y + BASE.d - 12, w: 116, d: 6, r: 1 },
});

/* ── Queue: a tray of pockets, with a lock pin beside each ────────── */

export const RACK_ART = {
  plate: slab(RACK, 0, RACK_H, 6, 0.8),
  pockets: joinPaths(
    Array.from({ length: STORIES }, (_, i) =>
      planOutline(insetPlan(at(CARD, RACK_X, POCKET_Y(i)), -1.4), RACK_H, P, 3),
    ),
  ),
  screws: dots(corners(RACK, 4).map(([x, y]) => [x, y, RACK_H] as Point3)),
  index: dots(
    Array.from({ length: STORIES }, (_, i) => [RACK.x + 4, POCKET_Y(i), RACK_H] as Point3),
  ),
};

// A pin stands beside a blocked card and its arm clamps the card's edge.
export const LOCKS = Array.from({ length: STORIES }, (_, i) => {
  const x = RACK_X + 16;
  const y = POCKET_Y(i);
  const top = RACK_H + CARD_H;
  return {
    pin: post(x, y, 1.7, RACK_H, CARD_H + 3.4, 14),
    arm: slab({ x: RACK_X + 9, y: y - 1.8, w: 8.6, d: 3.6, r: 1 }, top, 1.2, 2),
    cap: ring(x, y, 1, top + 3.4 - CARD_H, P, 10),
  };
});

/* ── Worktrees: anvils, lamps, shutters ───────────────────────────── */

export const ANVILS = LANE_Y.map((y) => {
  const plan = at(ANVIL, LANE_X, y);
  return {
    body: slab(plan, 0, ANVIL_H, 4, 0.6),
    seat: planOutline(insetPlan(at(CARD, LANE_X, y), -1.2), ANVIL_H, P, 3),
    seam: sideSeam(plan, 2, P, 4),
    screws: dots([
      [plan.x + 3, plan.y + 3, ANVIL_H],
      [plan.x + plan.w - 3, plan.y + plan.d - 3, ANVIL_H],
    ]),
  };
});

// Three lamps per lane, one per consecutive failure.
export const LAMPS = LANE_Y.map((y) =>
  [-6, 0, 6].map((dy) => ({
    body: post(LAMP_X, y + dy, 2, 0, 2.6, 16),
    ring: ring(LAMP_X, y + dy, 1.2, 2.6, P, 12),
    on: dots([[LAMP_X, y + dy, 2.6]]),
  })),
);
export const LAMP_PLATE = LANE_Y.map((y) =>
  slab({ x: LAMP_X - 4, y: y - 10, w: 8, d: 20, r: 1.5 }, 0, 0.6, 3),
);

// A cover plate over the anvils of the lanes that are switched off.
export const SHUTTERS = LANE_Y.map((y) => ({
  body: slab(insetPlan(at(ANVIL, LANE_X, y), -0.6), ANVIL_H, 1.6, 3, 0.4),
  grip: lineOnTop([LANE_X - 6, y], [LANE_X + 6, y], ANVIL_H + 1.6, P),
}));

/* ── The bridge and its probes ────────────────────────────────────── */

const UPRIGHT = (y: number): Plan => ({ x: LANE_X - 4, y: y - 3, w: 8, d: 6, r: 1.2 });
const FOOT = (y: number): Plan => ({ x: LANE_X - 8, y: y - 5, w: 16, d: 10, r: 2 });
const BEAM: Plan = { x: LANE_X - 5, y: -BRIDGE_Y - 4, w: 10, d: BRIDGE_Y * 2 + 8, r: 2 };
const leg = (y: number) => ({
  foot: slab(FOOT(y), 0, 3, 3, 0.4),
  footScrews: dots([
    [LANE_X - 5.5, y, 3],
    [LANE_X + 5.5, y, 3],
  ]),
  upright: slab(UPRIGHT(y), 3, BRIDGE_Z - 3, 3),
  seam: sideSeam(UPRIGHT(y), 14, P, 3),
});
export const LEG_BACK = leg(-BRIDGE_Y);
export const LEG_FRONT = leg(BRIDGE_Y);

export const BEAM_ART = {
  beam: slab(BEAM, BRIDGE_Z, BRIDGE_H, 3, 0.6),
  groove: lineOnTop([LANE_X, -BRIDGE_Y + 2], [LANE_X, BRIDGE_Y - 2], BRIDGE_Z + BRIDGE_H, P),
  screws: dots(
    [-BRIDGE_Y, ...LANE_Y, BRIDGE_Y].map((y) => [
      LANE_X,
      y + (Math.abs(y) === BRIDGE_Y ? 0 : 6),
      BRIDGE_Z + BRIDGE_H,
    ]),
  ),
};

export const HOUSINGS = LANE_Y.map((y) => ({
  body: post(LANE_X, y, 4, HOUSING_Z, BRIDGE_Z - HOUSING_Z, 22),
  seams: joinPaths([HOUSING_Z + 4, BRIDGE_Z - 4].map((z) => sideArc(LANE_X, y, 4, z, P, 14))),
  lip: post(LANE_X, y, 4.8, HOUSING_Z, 1.2, 22),
}));

// Built at rest; each lane's group moves down by its own press.
export const PROBES = LANE_Y.map((y) => ({
  stem: post(LANE_X, y, 1.4, PAD_REST + 2.6, BRIDGE_Z - 1 - (PAD_REST + 2.6), 12),
  collar: post(LANE_X, y, 2.2, PAD_REST + 2.6, 1.8, 16),
  pad: post(LANE_X, y, 3.4, PAD_REST, 2.6, 20),
  padRing: ring(LANE_X, y, 2, PAD_REST, P, 14),
}));

/* ── main and human review ────────────────────────────────────────── */

const GUIDES: [number, number][] = [
  [MAIN.x + 3, MAIN.y - 1.6],
  [MAIN.x + MAIN.w - 3, MAIN.y - 1.6],
];
export const MAIN_ART = {
  plinth: slab(MAIN, 0, MAIN_H, 4, 0.6),
  seat: planOutline(insetPlan(MAIN, 3), MAIN_H, P, 3),
  guides: GUIDES.map(([x, y]) => post(x, y, 1.4, MAIN_H, 20, 14)),
  caps: GUIDES.map(([x, y]) => post(x, y, 2, MAIN_H + 20, 1.2, 14)),
};

const WALL = 2;
const wall = (plan: Plan) => slab(plan, REVIEW_FLOOR, REVIEW_WALL - REVIEW_FLOOR, 2, 0.3);
const R = REVIEW;
export const REVIEW_ART = {
  floor: slab(R, 0, REVIEW_FLOOR, 4),
  floorLine: planOutline(insetPlan(R, WALL + 3), REVIEW_FLOOR, P),
  far: [
    wall({ x: R.x, y: R.y, w: R.w, d: WALL, r: 0.6 }),
    wall({ x: R.x, y: R.y + WALL, w: WALL, d: R.d - WALL * 2, r: 0.6 }),
  ],
  near: [
    wall({ x: R.x + R.w - WALL, y: R.y + WALL, w: WALL, d: R.d - WALL * 2, r: 0.6 }),
    wall({ x: R.x, y: R.y + R.d - WALL, w: R.w, d: WALL, r: 0.6 }),
  ],
  pole: post(FLAG_X, FLAG_Y, 1, 0, 34, 12),
  poleFoot: post(FLAG_X, FLAG_Y, 2.6, 0, 1.4, 16),
  poleCap: post(FLAG_X, FLAG_Y, 1.5, 34, 1.2, 12),
};

// The flag is built raised; it sits lowered by FLAG_DROP until a card lands in review.
export const FLAG_DROP = 18;
export const FLAG = {
  body: slab({ x: FLAG_X + 1, y: FLAG_Y - 0.4, w: 11, d: 0.8, r: 0.2 }, 24, 8, 2),
  rule: joinPaths(
    [0, 1].map((row) =>
      onTop(
        [
          [FLAG_X + 3, FLAG_Y + 0.4],
          [FLAG_X + (row ? 7 : 10), FLAG_Y + 0.4],
        ],
        29 - row * 2.6,
        P,
      ),
    ),
  ),
};

/* ── Cards (built at the origin) ──────────────────────────────────── */

export const CARD_ART = {
  body: slab(CARD, 0, CARD_H, 3),
  rule: joinPaths(
    [0, 1].map((row) =>
      onTop(
        [
          [CARD.x + 3, CARD.y + 4 + row * 3],
          [CARD.x + (row ? 12 : 17), CARD.y + 4 + row * 3],
        ],
        CARD_H,
        P,
      ),
    ),
  ),
};

/* ── Camera framings ──────────────────────────────────────────────── */

const box = (x0: number, x1: number, y0: number, y1: number, z0: number, z1: number) =>
  boxOf(P, x0, x1, y0, y1, z0, z1);

export const FRAMES = {
  rack: {
    box: box(RACK.x - 4, RACK.x + RACK.w + 4, RACK.y - 4, RACK.y + RACK.d + 4, 0, 14),
    most: 2,
  },
  floor: { box: box(RACK.x, LAMP_X + 4, -BRIDGE_Y, BRIDGE_Y, 0, BRIDGE_Z), most: 1.5 },
  lanes: {
    box: box(LANE_X - 22, LAMP_X + 6, -BRIDGE_Y - 4, BRIDGE_Y + 4, 0, BRIDGE_Z + BRIDGE_H),
    most: 1.9,
  },
  out: { box: box(LANE_X + 10, FLAG_X + 14, MAIN.y - 6, R.y + R.d + 4, 0, 36), most: 2 },
};
