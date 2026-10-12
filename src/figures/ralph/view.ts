import type { Content } from '../../content';
import type { KeyMark } from '../../iso/iso-kit';
import { boxCorners, fitProjection, type Plan, type Point3 } from '../../iso/iso-kit';

// World units ≈ 1 px. x runs along the bench (feed → test → done), y is depth, z is up.
export const WIDTH = 640;
export const HEIGHT = 360;
const AZIMUTH = 52;

export const BASE: Plan = { x: -152, y: -64, w: 300, d: 124, r: 9 };
export const BASE_H = 8;
export const FOOT_H = 5;

// Guide rods the carriage runs on, and the blocks that hold their ends.
export const ROD_Y = 9;
export const ROD_Z = 5;
export const ROD_FROM = -128;
export const ROD_TO = 66;
export const ROD_END_W = 8;

// The carriage is built at x = 0 and moved along x.
export const CARRIAGE: Plan = { x: -17, y: -15, w: 34, d: 30, r: 3 };
export const CARRIAGE_Z = 7;
export const CARRIAGE_TOP = 12;
export const LOAD_X = -100;
export const TEST_X = 0;
export const EJECT_X = 50;

// A story card: thin plate that lies flat.
export const CARD: Plan = { x: -14, y: -11, w: 28, d: 22, r: 1.5 };
export const CARD_H = 1.4;
export const CARD_PITCH = 1.7;
export const HOLES = 6;

// Feed magazine: four posts around the load station, a stack of pending cards inside.
export const MAG_POST_X = 12;
export const MAG_POST_Y = 18;
export const MAG_TOP = 58;
// The stack rests on ledges just above a loaded card, so the carriage can carry a card out under it.
export const LEDGE_Z = CARRIAGE_TOP + CARD_H + 0.2;
export const STACK_Z = LEDGE_Z + 1;

// Test station: a column behind the rods, an arm over them, a probe that presses the card.
export const COLUMN: [number, number] = [0, -40];
export const COLUMN_TOP = 70;
export const ARM_Z = 62;
export const ARM_H = 6;
export const HOUSING_Z = 46;
export const PROBE_REST = 30; // pad underside at rest
export const PROBE_PRESS = CARRIAGE_TOP + CARD_H; // pad touches the card

// Done tray past the end of the rods.
export const TRAY: Plan = { x: 80, y: -22, w: 46, d: 44, r: 3 };
export const TRAY_FLOOR = 2;
export const TRAY_WALL = 9;
export const TRAY_X = TRAY.x + TRAY.w / 2;

// Pegboard at the back where guardrail tags hang.
export const BOARD: Plan = { x: -74, y: -60, w: 148, d: 4, r: 1 };
export const BOARD_Z = 12;
export const BOARD_TOP = 86;
export const HOOKS = [-58, -42, -26, 22, 38, 54];
export const HOOK_Z = 76;

// Verifier dial in front of the station.
export const DIAL: [number, number] = [36, 33];
export const DIAL_R = 14;
export const DIAL_Z = 4;
export const DIAL_TOP = 12;
export const DIAL_FROM = -135; // degrees, 0 at −y, clockwise from above
export const DIAL_SPAN = 270;

export const P = fitProjection(
  [
    ...boxCorners(BASE, -BASE_H - FOOT_H, 0),
    ...boxCorners(BOARD, BOARD_Z, BOARD_TOP),
    [COLUMN[0], COLUMN[1], COLUMN_TOP] as Point3,
  ],
  WIDTH,
  HEIGHT,
  { pad: 26, azimuth: AZIMUTH },
);

// What the page shows before the live figure loads: the plate's corner, its legend and readout.
export const PLATE = {
  fig: 'Fig 1',
  marks: ['lit', 'raised', 'dotted'] as KeyMark[],
  readout: (c: Content) => c.ralph.fig.idle(5, 30),
};
