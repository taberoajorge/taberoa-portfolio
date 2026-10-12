import type { Content } from '../../content';
import type { KeyMark } from '../../iso/iso-kit';
import { boxCorners, fitProjection, type Plan } from '../../iso/iso-kit';
import { initial, isReady } from '../../models/loopforge/model';

// World units ≈ 1 px. x runs queue → worktrees → main, y across the lanes, z up.
export const WIDTH = 640;
export const HEIGHT = 360;
const AZIMUTH = 52;

export const BASE: Plan = { x: -152, y: -72, w: 300, d: 144, r: 9 };
export const BASE_H = 8;
export const FOOT_H = 5;

// A story card, built centred on the origin, lying flat.
export const CARD: Plan = { x: -12, y: -7, w: 24, d: 14, r: 1.4 };
export const CARD_H = 1.4;
export const PITCH = 1.7;

// Queue: a tray of six pockets, one per story.
export const RACK: Plan = { x: -140, y: -62, w: 46, d: 124, r: 4 };
export const RACK_H = 5;
export const RACK_X = RACK.x + RACK.w / 2;
export const POCKET_Y = (i: number) => -50 + i * 20;
export const STORIES = 6;

// Worktrees: three anvils under one bridge; lane 0 is the middle one.
export const LANE_X = 8;
export const LANE_Y = [0, -38, 38];
export const ANVIL: Plan = { x: -16, y: -11, w: 32, d: 22, r: 2.5 };
export const ANVIL_H = 6;
export const BRIDGE_Y = 66;
export const BRIDGE_Z = 50;
export const BRIDGE_H = 6;
export const HOUSING_Z = 34;
export const PAD_REST = 20; // pad underside at rest
export const PAD_PRESS = ANVIL_H + CARD_H; // pad touches the card
export const LAMP_X = LANE_X + 22;

// main: a plinth with two guides where merged cards stack; human review: a bin with a flag.
export const MAIN_X = 98;
export const MAIN_Y = -30;
export const MAIN: Plan = { x: MAIN_X - 16, y: MAIN_Y - 11, w: 32, d: 22, r: 2 };
export const MAIN_H = 6;
export const REVIEW: Plan = { x: MAIN_X - 18, y: 22, w: 36, d: 28, r: 2.5 };
export const REVIEW_FLOOR = 2;
export const REVIEW_WALL = 9;
export const FLAG_X = REVIEW.x + REVIEW.w + 4;
export const FLAG_Y = REVIEW.y + 4;

export const P = fitProjection(
  [
    ...boxCorners(BASE, -BASE_H - FOOT_H, 0),
    ...boxCorners(
      { x: LANE_X - 6, y: -BRIDGE_Y - 4, w: 12, d: BRIDGE_Y * 2 + 8, r: 0 },
      0,
      BRIDGE_Z + BRIDGE_H,
    ),
  ],
  WIDTH,
  HEIGHT,
  { pad: 26, azimuth: AZIMUTH },
);

const START = initial();

// What the page shows before the live figure loads: the plate's corner, its legend and readout.
export const PLATE = {
  option: 3, // worktrees the run starts with
  fig: 'Fig 2',
  marks: ['lit', 'raised', 'edge'] as KeyMark[],
  readout: (c: Content) =>
    c.loopforge.fig.idle(START.stories.filter((s) => isReady(START.stories, s.id)).length, 3),
};
