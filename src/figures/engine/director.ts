// A queue of eased segments driven by one frame loop, plus the camera that glides between
// stations while the parts move. Nothing in the loop goes through React: figures write the DOM.

import { type Box, Camera, frameOf } from './camera';

export type Ease = (u: number) => number;
export const linear: Ease = (u) => u;
export const smoother: Ease = (u) => u * u * u * (u * (u * 6 - 15) + 10); // zero speed and acceleration at both ends
export const fall: Ease = (u) => u * u; // gravity
export const settle: Ease = (u) => 1 - (1 - u) ** 3;

export type Pose = Record<string, number>;
export type Seg<P extends Pose> = {
  to: Partial<P>;
  dur: number;
  ease?: Ease | Partial<Record<keyof P, Ease>>;
  start?: () => void;
  end?: () => void;
};
export type Frames = Record<string, { box: Box; most: number }>;

const easeOf = <P extends Pose>(seg: Seg<P>, key: keyof P): Ease =>
  typeof seg.ease === 'function' ? seg.ease : (seg.ease?.[key] ?? smoother);

type Hooks<P extends Pose> = {
  plan: () => Seg<P>[] | null; // the next iteration's segments, or null when the run is over
  write: (pose: P) => void; // put the pose on the DOM
  springs: (dt: number, calm: boolean) => boolean; // free-running parts; true while moving
  done: () => boolean;
  labels: (pose: P) => [number, number][]; // viewBox points the step labels point at, in step order
};

export class Director<P extends Pose> {
  pose: P;
  readonly camera: Camera;
  playing = true;
  consent = false; // the visitor pressed play or step: animate even under reduced motion
  pending = 0;
  private queue: Seg<P>[] = [];
  private seg: { s: Seg<P>; from: P; t: number } | null = null;
  private stepping = false;

  constructor(
    readonly rest: P,
    readonly frames: Frames,
    width: number,
    height: number,
    readonly hooks: Hooks<P>,
  ) {
    this.pose = { ...rest };
    this.camera = new Camera(width, height);
  }

  aim(where: string, seconds = 1) {
    const frame = this.frames[where];
    const cam = this.camera;
    cam.aim(
      frame ? frameOf(frame.box, cam.width, cam.height, { most: frame.most }) : cam.full,
      seconds,
    );
  }

  // Frame an arbitrary box (for things that move, like a gantry).
  aimBox(box: Box, most: number, seconds = 1) {
    const cam = this.camera;
    cam.aim(frameOf(box, cam.width, cam.height, { most }), seconds);
  }

  reset() {
    this.queue = [];
    this.seg = null;
    this.pending = 0;
    this.stepping = false;
    this.pose = { ...this.rest };
  }

  private next(calm: boolean) {
    const queued = this.queue.shift();
    if (queued) return queued;
    this.stepping = false;
    if (!(this.pending > 0 || (this.playing && !calm))) return undefined;
    if (this.pending > 0) {
      this.pending--;
      this.stepping = true;
    }
    const planned = this.hooks.plan();
    if (!planned) return undefined;
    this.queue.push(...planned);
    return this.queue.shift();
  }

  private advance(dt: number, calm: boolean) {
    if (!this.seg) {
      const s = this.next(calm);
      if (!s) return;
      s.start?.();
      this.seg = { s, from: { ...this.pose }, t: 0 };
    }
    const cur = this.seg;
    cur.t += dt;
    const u = calm || cur.s.dur === 0 ? 1 : Math.min(1, cur.t / cur.s.dur);
    const pose = this.pose as Pose;
    for (const key of Object.keys(cur.s.to) as (keyof P & string)[]) {
      const to = cur.s.to[key] as number;
      pose[key] = cur.from[key] + (to - cur.from[key]) * easeOf(cur.s, key)(u);
    }
    if (u >= 1) {
      this.seg = null;
      cur.s.end?.();
    }
  }

  // One frame. `still` is the visitor's reduced-motion setting; returns true while there is more to do.
  tick(dt: number, still: boolean) {
    const calm = still && !this.consent;
    const frozen = !this.playing && !this.stepping && this.pending === 0;
    if (!frozen) this.advance(dt, calm);
    const gliding = this.camera.step(dt, calm);
    const springing = this.hooks.springs(dt, calm);
    this.hooks.write(this.pose);
    const busy = Boolean(this.seg) || this.queue.length > 0;
    const wants = !frozen && (this.pending > 0 || (this.playing && !calm && !this.hooks.done()));
    return { more: busy || wants || gliding || springing, gliding };
  }
}
