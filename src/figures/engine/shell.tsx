'use client';

// Everything around a figure's drawing: play state and consent, the stepper, the plate, the
// controls, the guide and the two-column layout. A figure brings its rig, drawing and extra controls.

import { type ReactNode, useRef, useState } from 'react';
import type { LegendKey } from '../../iso/iso-kit';
import { Plate } from '../../iso/react/draw';
import { useStillness } from '../../iso/react/live';
import { Controls, FigureFrame } from './frame';
import { useDirector, useNarrator, useSteps } from './hooks';
import type { Io, Rig } from './rig';
import { Guide, type GuideText, Stepper, type StepText } from './steps';

export type FigText = {
  steps: StepText[];
  fig: { title: string; hint: string; caption: string };
  play: string;
  pause: string;
  next: string;
  reset: string;
};

// biome-ignore lint/suspicious/noExplicitAny: the shell never touches the pose
type AnyRig<O, T> = Rig<any, O, T>;

export function FigureShell<O, T extends FigText, R extends AnyRig<O, T>>({
  fig,
  t,
  guide,
  info,
  keys,
  option: first,
  makeRig,
  drawing,
  controls,
}: {
  fig: string;
  t: T;
  guide: GuideText;
  info: ReactNode;
  keys: LegendKey[];
  option: O; // the figure's own setting (clumsiness, worktrees, preset); changing it restarts the run
  makeRig: (io: Io<T>) => R;
  drawing: (rig: R) => ReactNode;
  controls: (c: { rig: R; option: O; reset: (option: O) => void }) => ReactNode;
}) {
  const [ui, setUi] = useState({ playing: true, finished: false, option: first, consent: false });
  const still = useStillness();
  const stage = useRef<HTMLDivElement>(null);
  const { anchor, live, narrate } = useNarrator();
  const rig = useRef<R | null>(null);

  const pick = (i: number) => {
    const at = Math.max(0, Math.min(t.steps.length - 1, i));
    director.playing = false;
    setUi((u) => ({ ...u, playing: false }));
    rig.current?.showStep(at);
    kick();
  };
  const io: Io<T> = {
    t,
    narrate,
    finished: (finished) => setUi((u) => ({ ...u, finished })),
    step: (i) => setAt(i),
  };
  rig.current ??= makeRig(io);
  rig.current.setIo(io);
  const r = rig.current;
  const director = r.director;
  const { at, setAt, onTagClick } = useSteps(r.r.view, pick);
  const kick = useDirector(director, r.r.view, r.r.root, stage);
  const [readout] = useState(() => r.idle());

  const reset = (option: O) => {
    setUi((u) => ({ ...u, finished: false, option }));
    r.reset(option);
    kick();
  };
  const auto = ui.playing && (!still || ui.consent);

  return (
    <FigureFrame
      info={info}
      figure={
        <>
          <Stepper steps={t.steps} at={at} label={guide.steps} onPick={pick} />
          <Plate
            fig={fig}
            title={t.fig.title}
            hint={t.fig.hint}
            readout={readout}
            keys={keys}
            caption={t.fig.caption}
          >
            {/* biome-ignore lint/a11y/noStaticElementInteractions: delegates clicks from the step labels, which mirror the stepper buttons */}
            {/* biome-ignore lint/a11y/useKeyWithClickEvents: the stepper offers the same choice by keyboard */}
            <div ref={stage} onClick={onTagClick}>
              {/* the readout anchor must sit inside the plate */}
              <div ref={anchor}>{drawing(r)}</div>
            </div>
          </Plate>
          <p ref={live} className="sr-only" aria-live="polite">
            {readout}
          </p>
          <Controls
            t={t}
            playing={auto}
            finished={ui.finished}
            onPlay={() => {
              director.playing = !auto;
              director.consent = true;
              setUi((u) => ({ ...u, playing: !auto, consent: true }));
              kick();
            }}
            onNext={() => {
              director.pending++;
              director.consent = true;
              kick();
            }}
            onReset={() => reset(ui.option)}
          >
            {controls({ rig: r, option: ui.option, reset })}
          </Controls>
        </>
      }
      guide={<Guide steps={t.steps} at={at} t={guide} onPick={pick} />}
    />
  );
}
