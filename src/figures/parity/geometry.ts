// The parity harness as a comparator bench: one schedule-file card feeds two importers, the old
// Java one and the new TypeScript one; each stacks its 14 output plates in a tray, and a balance
// beam resting on both stacks tips a dial. Needle on zero means parity. Static art for the post's
// share image; `scripts/og.ts` renders it.

import type { Flat, Plan, Point3 } from '../../iso/iso-kit';
import * as k from '../../iso/iso-kit';

export const WIDTH = 640;
export const HEIGHT = 520;

const PLATE: Plan = { x: -150, y: -80, w: 300, d: 160, r: 8 };
const PLATE_H = 12;
const FOOT_H = 5;

const JAVA: Plan = { x: -138, y: -62, w: 92, d: 70, r: 4 };
const JAVA_H = 58;
const TS: Plan = { x: 42, y: -62, w: 70, d: 60, r: 4 };
const TS_H = 40;
const HOPPER: Plan = { x: -24, y: -76, w: 48, d: 24, r: 3 };
const HOPPER_H = 74;

const TABLES = 14;
const PLATE_T = 1.2;
const PLATE_GAP = 0.3;
const STACK_H = TABLES * (PLATE_T + PLATE_GAP);
const TRAY_FLOOR = 2;
const TRAY_Y = 14;
const TRAY_D = 36;
const trayOf = (m: Plan): Plan => ({ x: m.x + (m.w - 50) / 2, y: TRAY_Y, w: 50, d: TRAY_D, r: 2 });
const JAVA_TRAY = trayOf(JAVA);
const TS_TRAY = trayOf(TS);
const STACK_TOP = TRAY_FLOOR + STACK_H;

const BEAM_Y = TRAY_Y + TRAY_D / 2;
const BEAM_Z = STACK_TOP + 2;
const BEAM_H = 5;
const PIVOT_X = (JAVA_TRAY.x + JAVA_TRAY.w / 2 + TS_TRAY.x + TS_TRAY.w / 2) / 2;

const DIAL: Flat = [TS_TRAY.x + TS_TRAY.w / 2, BEAM_Y];
const DIAL_R = 19;
const POST: Flat = [DIAL[0] + 34, BEAM_Y];
const POST_TOP = 112;
const ARM_Z = 100;
const DIAL_Z = 82;
const DIAL_H = 10;
const DIAL_TOP = DIAL_Z + DIAL_H;

const P = k.fitProjection(
  [
    ...k.boxCorners(PLATE, -PLATE_H - FOOT_H, 0),
    ...k.boxCorners(HOPPER, 0, HOPPER_H + 6),
    [POST[0], POST[1], POST_TOP + 2],
    [DIAL[0] + DIAL_R, DIAL[1] + DIAL_R, DIAL_TOP],
  ],
  WIDTH,
  HEIGHT,
  { pad: 8, azimuth: 40 },
);

const at = (point: Point3) => k.iso(point, P);
const S = (paths: k.SolidPaths, style?: k.SolidStyle) => k.solidSvg(paths, style);
const L = (d: string, style?: k.LineStyle) => k.lineSvg(d, style);
const D = (points: Flat[], style?: { size?: number; tone?: k.Tone }) => k.dotsSvg(points, style);
const byDepth = (points: Flat[]) =>
  [...points].sort((a, b) => k.depthOf([a[0], a[1], 0], P) - k.depthOf([b[0], b[1], 0], P));

// A closed rectangle on a +y face: a vent, a slot, a sight window.
const faceRect = (x0: number, x1: number, y: number, z0: number, z1: number) =>
  k.pathOf(
    k.pointsAt(
      [
        [x0, y, z0],
        [x1, y, z0],
        [x1, y, z1],
        [x0, y, z1],
      ],
      P,
    ),
    true,
  );

function base() {
  const z0 = -PLATE_H - FOOT_H;
  const out = [`<path class="iso-halo" d="${k.haloOf(PLATE, z0, PLATE_H, P)}"/>`];
  for (const [x, y] of byDepth(k.corners(PLATE, 22))) {
    out.push(S(k.cylinder(x, y, 7, z0, 1.6, P, 28), { tone: 'lo' }));
    out.push(S(k.cylinder(x, y, 5.4, z0 + 1.6, FOOT_H - 1.6, P, 28), { tone: 'mid' }));
  }
  out.push(S(k.slabOf(PLATE, -PLATE_H, PLATE_H, P, 8, 1.6), { tone: 'mid' }));
  out.push(L(k.planOutline(k.insetPlan(PLATE, 5), 0, P), { tone: 'faint' }));
  const screws = k.corners(PLATE, 10);
  out.push(L(screws.map(([x, y]) => k.ring(x, y, 2.2, 0, P, 16)).join(''), { tone: 'lo' }));
  out.push(
    D(
      screws.map(([x, y]) => at([x, y, 0])),
      { size: 0.5 },
    ),
  );
  const strip: Plan = { x: -128, y: PLATE.y + PLATE.d - 15, w: 256, d: 7, r: 1 };
  out.push(S(k.slabOf(strip, 0, 0.6, P, 3), { tone: 'lo', crease: 'none' }));
  const ticks = k.topTicks(
    strip.x + 4,
    strip.x + strip.w - 4,
    4,
    5,
    strip.y + 0.8,
    0.6,
    [2, 3.6],
    P,
  );
  out.push(L(ticks.minor, { tone: 'lo' }), L(ticks.major, { tone: 'mid' }));
  out.push(
    D([at([strip.x + 2, strip.y + 3.5, 0.6]), at([strip.x + strip.w - 2, strip.y + 3.5, 0.6])], {
      size: 0.45,
    }),
  );
  const label: Plan = { x: PLATE.x + 12, y: PLATE.y + 10, w: 34, d: 14, r: 1.2 };
  out.push(S(k.slabOf(label, 0, 0.8, P, 4), { tone: 'lo' }));
  out.push(L(k.planOutline(k.insetPlan(label, 1.6), 0.8, P), { tone: 'faint' }));
  for (const [i, len] of [22, 16, 19].entries()) {
    const y = label.y + 4 + i * 3;
    out.push(
      L(k.lineOnTop([label.x + 4, y], [label.x + 4 + len, y], 0.8, P), { tone: 'lo', free: true }),
    );
  }
  out.push(
    D(
      [
        at([label.x + 2, label.y + 2, 0.8]),
        at([label.x + label.w - 2, label.y + label.d - 2, 0.8]),
      ],
      { size: 0.45 },
    ),
  );
  return out.join('');
}

// An importer: a housing with a lid, vents, a feed slot on top, an output slot at the front.
function machine(plan: Plan, h: number, slotX: number) {
  const out = [];
  const front = plan.y + plan.d;
  const seam = k.sideSeam(plan, h - 10, P, 4);
  out.push(S(k.slabOf(plan, 0, h, P, 4, 1), { tone: 'mid', inner: L(seam, { tone: 'faint' }) }));
  out.push(L(k.planOutline(k.insetPlan(plan, 3), h, P, 4), { tone: 'faint' }));
  out.push(
    D(
      k.corners(plan, 5).map(([x, y]) => at([x, y, h])),
      { size: 0.45 },
    ),
  );
  for (const i of [0, 1, 2]) {
    const x0 = plan.x + plan.w - 30 + i * 8;
    out.push(L(faceRect(x0, x0 + 3, front, h - 30, h - 14), { tone: 'lo' }));
  }
  out.push(L(faceRect(plan.x + 12, plan.x + plan.w - 12, front, 3, 6.5), { tone: 'lo' }));
  const slot: Plan = { x: slotX, y: -62, w: 20, d: 3, r: 0.6 };
  out.push(L(k.planOutline(slot, h, P, 2), { tone: 'lo' }));
  const knob: Flat = [plan.x + plan.w - 12, front - 12];
  out.push(S(k.cylinder(knob[0], knob[1], 5, h, 4, P, 32), { tone: 'mid' }));
  out.push(L(k.knurl(knob[0], knob[1], 5, h, h + 4, 30, P), { tone: 'lo' }));
  out.push(
    L(k.lineOnTop([knob[0] - 2.5, knob[1]], [knob[0] + 4, knob[1]], h + 4, P), {
      tone: 'hi',
      free: true,
    }),
  );
  const lamp: Flat = [plan.x + 12, front - 10];
  out.push(S(k.cylinder(lamp[0], lamp[1], 3, h, 2, P, 20), { tone: 'mid' }));
  out.push(S(k.cylinder(lamp[0], lamp[1], 2.2, h + 2, 1.6, P, 20), { tone: 'hi' }));
  return out.join('');
}

// The card hopper behind the machines, and a bridge that walks a standing card to each feed slot.
function hopper() {
  const out = [];
  const front = HOPPER.y + HOPPER.d;
  out.push(S(k.slabOf(HOPPER, 0, HOPPER_H, P, 4, 0.8), { tone: 'mid' }));
  out.push(L(k.planOutline(k.insetPlan(HOPPER, 3), HOPPER_H, P, 4), { tone: 'faint' }));
  out.push(
    D(
      k.corners(HOPPER, 5).map(([x, y]) => at([x, y, HOPPER_H])),
      { size: 0.45 },
    ),
  );
  out.push(L(faceRect(-6, 6, front, 12, HOPPER_H - 12), { tone: 'lo' }));
  for (let z = 16; z < HOPPER_H - 14; z += 4)
    out.push(L(k.segment([-6, front, z], [6, front, z], P), { tone: 'faint' }));
  const knob: Flat = [0, HOPPER.y + 10];
  out.push(S(k.cylinder(knob[0], knob[1], 6, HOPPER_H, 4, P, 32), { tone: 'mid' }));
  out.push(L(k.knurl(knob[0], knob[1], 6, HOPPER_H, HOPPER_H + 4, 36, P), { tone: 'lo' }));
  out.push(
    L(k.lineOnTop([knob[0] - 3, knob[1]], [knob[0] + 4.6, knob[1]], HOPPER_H + 4, P), {
      tone: 'hi',
      free: true,
    }),
  );
  return out.join('');
}

function bridge(from: number, to: number, z: number, cardX: number) {
  const out = [];
  const x = Math.min(from, to);
  const w = Math.abs(to - from);
  const channel: Plan = { x, y: -64, w, d: 7, r: 0.8 };
  out.push(S(k.slabOf(channel, z, 2, P, 3, 0.4), { tone: 'mid' }));
  for (const y of [-64, -58])
    out.push(
      S(k.slabOf({ x, y, w, d: 1, r: 0.3 }, z + 2, 1.2, P, 2), { tone: 'mid', crease: 'none' }),
    );
  out.push(D([at([x + 3, -60.5, z + 2]), at([x + w - 3, -60.5, z + 2])], { size: 0.4 }));
  const card: Plan = { x: cardX, y: -61.2, w: 16, d: 1.4, r: 0.3 };
  out.push(S(k.slabOf(card, z + 2, 20, P, 2), { tone: 'hi', crease: 'lo' }));
  for (const [i, len] of [10, 7, 9].entries())
    out.push(
      L(
        k.segment(
          [cardX + 3, -59.8, z + 16 - i * 3.2],
          [cardX + 3 + len, -59.8, z + 16 - i * 3.2],
          P,
        ),
        { tone: 'lo', free: true },
      ),
    );
  return out.join('');
}

// An open tray with the 14 output plates stacked in it.
function tray(plan: Plan) {
  const out = [];
  out.push(S(k.slabOf(plan, 0, TRAY_FLOOR, P, 3, 0.4), { tone: 'mid' }));
  for (const x of [plan.x, plan.x + plan.w - 2])
    out.push(
      S(k.slabOf({ x, y: plan.y, w: 2, d: plan.d, r: 0.5 }, TRAY_FLOOR, 6, P, 2), {
        tone: 'mid',
        crease: 'none',
      }),
    );
  const inner: Plan = { x: plan.x + 3, y: plan.y + 3, w: plan.w - 6, d: plan.d - 6, r: 1 };
  for (let i = 0; i < TABLES; i++)
    out.push(
      S(k.slabOf(inner, TRAY_FLOOR + i * (PLATE_T + PLATE_GAP), PLATE_T, P, 3), {
        tone: 'hi',
        crease: 'lo',
      }),
    );
  return out.join('');
}

// The balance beam on its fulcrum, a pad on each stack.
function beam() {
  const out = [];
  const pedestal: Flat = [PIVOT_X, BEAM_Y];
  out.push(S(k.cylinder(pedestal[0], pedestal[1], 7, 0, 1.6, P, 28), { tone: 'lo' }));
  out.push(
    S(k.cylinder(pedestal[0], pedestal[1], 4, 1.6, BEAM_Z - 7 - 1.6, P, 24), {
      tone: 'mid',
      crease: 'none',
    }),
  );
  out.push(L(k.sideArc(pedestal[0], pedestal[1], 4, 8, P, 12), { tone: 'faint' }));
  const block: Plan = { x: PIVOT_X - 5, y: BEAM_Y - 5, w: 10, d: 10, r: 1.5 };
  out.push(S(k.slabOf(block, BEAM_Z - 7, 7, P, 3, 0.5), { tone: 'mid' }));
  for (const tr of [JAVA_TRAY, TS_TRAY]) {
    const cx = tr.x + tr.w / 2;
    out.push(S(k.cylinder(cx, BEAM_Y, 4.5, STACK_TOP, 2, P, 24), { tone: 'hi' }));
  }
  const span: Plan = {
    x: JAVA_TRAY.x + JAVA_TRAY.w / 2 - 8,
    y: BEAM_Y - 3,
    w: TS_TRAY.x + TS_TRAY.w / 2 + 8 - (JAVA_TRAY.x + JAVA_TRAY.w / 2 - 8),
    d: 6,
    r: 1.5,
  };
  out.push(S(k.slabOf(span, BEAM_Z, BEAM_H, P, 3, 0.6), { tone: 'hi', crease: 'lo' }));
  out.push(
    L(k.sideRing([PIVOT_X, BEAM_Y + 3, BEAM_Z + BEAM_H / 2], 1.6, 'y', P, 16), { tone: 'lo' }),
  );
  out.push(
    D(
      [
        at([span.x + 4, BEAM_Y, BEAM_Z + BEAM_H]),
        at([span.x + span.w - 4, BEAM_Y, BEAM_Z + BEAM_H]),
      ],
      { size: 0.45 },
    ),
  );
  return out.join('');
}

// The dial indicator on its post, its plunger on the beam near the TypeScript end.
function dial() {
  const out = [];
  const [px, py] = POST;
  const [x, y] = DIAL;
  out.push(S(k.cylinder(px, py, 5, 0, 4, P, 28), { tone: 'mid' }));
  out.push(S(k.cylinder(px, py, 3.2, 4, ARM_Z - 6 - 4, P, 28), { tone: 'mid', crease: 'none' }));
  out.push(L([40, 70].map((z) => k.sideArc(px, py, 3.2, z, P, 16)).join(''), { tone: 'faint' }));
  const clamp: Plan = { x: px - 7, y: py - 7, w: 14, d: 14, r: 2.5 };
  out.push(S(k.slabOf(clamp, ARM_Z - 6, 12, P, 4, 0.6), { tone: 'mid' }));
  out.push(
    S(k.cylinder(px, py, 3.2, ARM_Z + 6, POST_TOP - ARM_Z - 6, P, 28), {
      tone: 'mid',
      crease: 'none',
    }),
  );
  out.push(S(k.cylinder(px, py, 3.8, POST_TOP, 2, P, 28), { tone: 'mid' }));
  const thumb: Flat = [px, clamp.y + clamp.d + 1.4];
  out.push(
    S(k.slabOf({ x: px - 1.4, y: clamp.y + clamp.d, w: 2.8, d: 3, r: 0.8 }, ARM_Z - 1, 4, P, 2), {
      tone: 'mid',
      crease: 'none',
    }),
  );
  out.push(S(k.cylinder(thumb[0], thumb[1] + 1.4, 2.6, ARM_Z - 2, 6, P, 20), { tone: 'mid' }));
  out.push(L(k.knurl(thumb[0], thumb[1] + 1.4, 2.6, ARM_Z - 2, ARM_Z + 4, 18, P), { tone: 'lo' }));
  const lug: Plan = { x: x + DIAL_R - 2, y: y - 4, w: 8, d: 8, r: 1.5 };
  const arm: Plan = { x: lug.x, y: py - 3, w: px - 7 - lug.x, d: 6, r: 2 };
  out.push(S(k.slabOf(arm, ARM_Z, 4, P, 4, 0.5), { tone: 'mid' }));
  out.push(
    D([at([arm.x + 4, py, ARM_Z + 4]), at([arm.x + arm.w - 4, py, ARM_Z + 4])], { size: 0.45 }),
  );
  out.push(
    S(k.cylinder(x, y, 1.4, BEAM_Z + BEAM_H, DIAL_Z - BEAM_Z - BEAM_H, P, 16), {
      tone: 'hi',
      crease: 'none',
      lit: true,
    }),
  );
  out.push(S(k.cylinder(x, y, 2.6, BEAM_Z + BEAM_H, 2.2, P, 20), { tone: 'hi', lit: true }));
  out.push(S(k.slabOf(lug, DIAL_Z + 2, ARM_Z - DIAL_Z - 2, P, 3, 0.4), { tone: 'mid' }));
  out.push(S(k.cylinder(x, y, DIAL_R, DIAL_Z, DIAL_H, P, 64, 0.8), { tone: 'hi', crease: 'lo' }));
  out.push(L(k.knurl(x, y, DIAL_R, DIAL_TOP - 3.4, DIAL_TOP, 72, P, 0.3), { tone: 'lo' }));
  out.push(L(k.sideArc(x, y, DIAL_R, DIAL_TOP - 3.4, P, 40), { tone: 'faint' }));
  out.push(L(k.ring(x, y, DIAL_R - 2.2, DIAL_TOP, P, 64), { tone: 'lo' }));
  const ticks = k.radialTicks(x, y, DIAL_R - 3, 50, 5, DIAL_TOP, [1.3, 2.8], P);
  out.push(L(ticks.minor, { tone: 'lo' }), L(ticks.major, { tone: 'mid' }));
  out.push(L(k.lineOnTop([x, y - DIAL_R + 3], [x, y - DIAL_R + 7], DIAL_TOP, P), { tone: 'hi' }));
  out.push(
    S(k.slabOf({ x: x - 2.4, y: y - DIAL_R - 4, w: 4.8, d: 5, r: 1.2 }, DIAL_Z + 2, 5, P, 3), {
      tone: 'mid',
    }),
  );
  out.push(
    S(
      k.slabOf(
        { x: x - 3.2, y: y - DIAL_R - 6.2, w: 6.4, d: 2.6, r: 1.2 },
        DIAL_Z + 1.2,
        6.6,
        P,
        3,
      ),
      { tone: 'mid' },
    ),
  );
  out.push(L(k.ring(x, y, 1.6, DIAL_TOP, P, 16), { tone: 'mid' }));
  out.push(
    `<path class="iso-line" data-tone="lit" data-free="start" d="${k.lineOnTop([x, y + 3.4], [x, y - DIAL_R + 4], DIAL_TOP + 0.2, P)}" style="stroke-width:1.1"/>`,
  );
  return out.join('');
}

const label =
  'A comparator bench. Two importer machines stand on a base plate, a larger older one on the left and a smaller one on the right, fed the same schedule card from a hopper behind them. Each stacks fourteen output plates in a tray in front of it. A balance beam rests a pad on each stack, and a dial indicator on a post reads the beam: the needle on zero means both stacks are the same height.';

export const svg = k.figureSvg({
  width: WIDTH,
  height: HEIGHT,
  label,
  standalone: 'light',
  body: [
    base(),
    machine(JAVA, JAVA_H, JAVA.x + JAVA.w - 30),
    hopper(),
    machine(TS, TS_H, TS.x + 8),
    bridge(HOPPER.x, JAVA.x + JAVA.w - 20, JAVA_H, JAVA.x + JAVA.w - 24),
    bridge(HOPPER.x + HOPPER.w, TS.x + 18, TS_H, TS.x + 10),
    tray(JAVA_TRAY),
    tray(TS_TRAY),
    beam(),
    dial(),
  ],
});
