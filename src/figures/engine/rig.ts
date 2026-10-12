// What every figure's logic shares: a director wired to the figure's own plan and drawing, the
// step being shown, and the way back to the start. A figure only adds its choreography.

import type { RefObject } from 'react';
import { Director, type Frames, type Pose, type Seg } from './director';
import { focusParts, makePut } from './dom';

// How the rig talks back to the page: narration, the end of a run, the step on show.
export type Io<T> = {
  t: T;
  narrate: (text: string) => void;
  finished: (done: boolean) => void;
  step: (i: number) => void;
};

export type StageRefs = {
  view: RefObject<HTMLDivElement | null>;
  root: RefObject<HTMLDivElement | null>;
};

// A step of the guide: the station the camera frames and the parts that stay in focus.
export type Station = { frame: string; parts: string[] };

export const blank = <T>(): RefObject<T | null> => ({ current: null });

export abstract class Rig<P extends Pose, O, T> {
  readonly director: Director<P>;
  abstract readonly r: StageRefs;
  protected readonly put = makePut();

  constructor(
    rest: P,
    frames: Frames,
    width: number,
    height: number,
    private readonly stations: Station[],
    protected io: Io<T>,
  ) {
    this.director = new Director<P>(rest, frames, width, height, {
      plan: () => this.plan(),
      write: (pose) => this.write(pose),
      springs: (dt, calm) => this.springs(dt, calm),
      done: () => this.done(),
      labels: (pose) => this.labels(pose),
    });
  }

  setIo(io: Io<T>) {
    this.io = io;
  }

  protected abstract plan(): Seg<P>[] | null;
  protected abstract write(pose: P): void;
  protected abstract done(): boolean;
  protected abstract labels(pose: P): [number, number][];
  protected abstract restart(option: O): void; // put the figure's own state back to the start
  abstract idle(): string; // the narration at rest

  protected springs(_dt: number, _calm: boolean) {
    return false;
  }

  // Show step i: frame its station and say which step it is.
  showStep(i: number, seconds = 1) {
    const { frame, parts } = this.stations[i];
    this.look(frame, seconds, parts);
    this.io.step(i);
  }

  protected look(where: string, seconds: number, parts: string[] | null) {
    this.director.aim(where, seconds);
    focusParts(this.r.root.current, parts);
  }

  protected el(selector: string) {
    return this.r.root.current?.querySelector(selector) ?? null;
  }

  protected all(selector: string) {
    return [...(this.r.root.current?.querySelectorAll<SVGElement>(selector) ?? [])];
  }

  reset(option: O) {
    this.director.reset();
    this.restart(option);
    this.look('full', 0.8, null);
    this.io.step(0);
    this.write(this.director.pose);
    this.io.narrate(this.idle());
  }
}
