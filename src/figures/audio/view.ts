import type { Content } from '../../content';
import type { KeyMark } from '../../iso/iso-kit';
import { boxCorners, fitProjection, type Plan, type Point3 } from '../../iso/iso-kit';
import { duration, TAKE } from '../../models/audio/model';

// World units ≈ 1 px. x runs along the tape (time), y across it, z up.
export const WIDTH = 640;
export const HEIGHT = 340;
const AZIMUTH = 52;

export const BASE: Plan = { x: -192, y: -64, w: 384, d: 128, r: 10 };
export const BASE_H = 8;
export const FOOT_H = 5;

// The tape: the raw take spans X0..X1, so 1 unit of x is MS ms of audio.
export const X0 = -132;
export const X1 = 132;
export const MS = duration(TAKE) / (X1 - X0);
export const xOf = (ms: number) => X0 + ms / MS;

export const BED: Plan = { x: -150, y: -20, w: 300, d: 40, r: 3 };
export const BED_H = 4;
export const TAPE: Plan = { x: -150, y: -15, w: 300, d: 30, r: 0.4 };
export const TAPE_Z = BED_H + 0.4;
export const HALF = 12; // full-scale bar half-length across the tape

// Reels at both ends of the bed.
export const REEL_R = 15;
export const REEL_Z = 2;
export const REEL_H = 4;
export const REELS: [number, number][] = [
  [-174, 0],
  [174, 0],
];

// Gantry on two rails; it carries three heads in a row along x.
export const RAIL_Y = 32;
export const RAIL_H = 5;
export const GANTRY_Z = 44;
export const HEAD_DX = [-10, 0, 10]; // DeepFilterNet pad, Silero VAD blade, noisereduce roller
export const HEAD_REST = 16; // head underside at rest
export const HEAD_LOW = TAPE_Z + 0.4; // touching the tape
export const PARK_X = X0 - 20;

// Preset selector at the front, label plate opposite.
export const KNOB: [number, number] = [-150, 44];
export const KNOB_R = 7;
export const KNOB_Z = 2;
export const KNOB_TOP = 9;
export const PRESET_ANGLES = [-50, 0, 50]; // gentle, natural, aggressive, degrees from −y

export const P = fitProjection(
  [
    ...boxCorners(BASE, -BASE_H - FOOT_H, 0),
    ...boxCorners({ x: 0, y: -RAIL_Y - 6, w: 1, d: RAIL_Y * 2 + 12, r: 0 }, 0, GANTRY_Z + 8),
  ] as Point3[],
  WIDTH,
  HEIGHT,
  { pad: 22, azimuth: AZIMUTH },
);

// What the page shows before the live figure loads: the plate's corner, its legend and readout.
export const PLATE = {
  fig: 'Fig 3',
  marks: ['raised', 'dim', 'lit'] as KeyMark[],
  readout: (c: Content) => c.audio.fig.say.waiting,
};
