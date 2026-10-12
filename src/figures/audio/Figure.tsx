'use client';

import { memo, type ReactNode, type RefObject } from 'react';
import { content, type Lang } from '../../content';
import type { Point3 } from '../../iso/iso-kit';
import { Dots, Line, Solid } from '../../iso/react/draw';
import { Layer as LayerOf, layerShift, Part } from '../engine/dom';
import { keysOf } from '../engine/frame';
import { FigureShell } from '../engine/shell';
import { StepTags, type StepText } from '../engine/steps';
import { Bench } from '../parts/bench';
import {
  BED_ART,
  BENCH,
  GANTRY_BACK,
  GANTRY_FRONT_SIDE,
  GANTRY_TOP,
  HEADS,
  KNOB_ART,
  pointerOf,
  RAIL_BACK,
  RAIL_FRONT,
  REEL_ART,
  spokesOf,
  woundOf,
} from './geometry';
import { Options } from './options';
import { AudioRig, RAW_TAPE } from './rig';
import { HEIGHT, P, PARK_X, PLATE, PRESET_ANGLES, WIDTH } from './view';

const Layer = ({
  children,
  layerRef,
  rest,
}: {
  children: ReactNode;
  layerRef?: RefObject<SVGSVGElement | null>;
  rest?: Point3; // where a moving layer sits before the first frame
}) => (
  <LayerOf
    layerRef={layerRef}
    width={WIDTH}
    height={HEIGHT}
    shift={rest && layerShift(P, rest, WIDTH, HEIGHT)}
  >
    {children}
  </LayerOf>
);

const rail = (side: typeof RAIL_BACK) => (
  <>
    <Solid paths={side.rail} tone="mid" crease="none" />
    {side.stops.map((paths, i) => (
      // biome-ignore lint/suspicious/noArrayIndexKey: fixed parts
      <Solid key={i} paths={paths} tone="mid" />
    ))}
    <Dots points={side.stopScrews} size={0.45} tone="mid" />
  </>
);

const gantrySide = (side: typeof GANTRY_BACK) => (
  <>
    <Solid paths={side.carriage} tone="mid" />
    <Dots points={side.screws} size={0.45} tone="mid" />
    <Solid paths={side.upright} tone="mid" inner={<Line d={side.seam} tone="faint" />} />
  </>
);

export const Drawing = memo(function Drawing({
  r,
  label,
  knob,
  steps,
}: {
  r: AudioRig['r'];
  label: string;
  knob: number;
  steps: StepText[];
}) {
  return (
    <div ref={r.view} className="rf-view">
      <div ref={r.root} className="rf-stage">
        <svg className="iso-svg" viewBox={`0 0 ${WIDTH} ${HEIGHT}`} role="img" aria-label={label}>
          <Part name="bench">
            <Bench art={BENCH} />
            {rail(RAIL_BACK)}
          </Part>
          <Part name="knob">
            <Solid paths={KNOB_ART.plate} tone="lo" />
            <Line d={KNOB_ART.marks} tone="mid" />
            <Dots points={KNOB_ART.dots} size={0.6} tone="hi" />
            <Solid paths={KNOB_ART.body} tone="mid" />
            <Line d={KNOB_ART.knurl} tone="faint" />
            <Line d={KNOB_ART.top} tone="lo" />
            <path
              ref={r.pointer}
              className="iso-line"
              data-tone="hi"
              d={pointerOf(knob)}
              style={{ strokeWidth: 1.1 }}
            />
          </Part>
        </svg>
        <Layer layerRef={r.back} rest={[PARK_X, 0, 0]}>
          <Part name="gantry">{gantrySide(GANTRY_BACK)}</Part>
        </Layer>
        <Layer>
          <Part name="tape">
            <Solid paths={BED_ART.bed} tone="mid" />
            <Dots points={BED_ART.screws} size={0.45} tone="mid" />
            <Solid paths={BED_ART.tape} tone="hi" crease="none" flat />
            <Line d={BED_ART.edge} tone="faint" />
            <Line d={BED_ART.minor} tone="lo" />
            <Line d={BED_ART.major} tone="mid" />
            <Line d={BED_ART.zero} tone="hi" />
            <path ref={r.noise} className="iso-line" data-tone="lo" d={RAW_TAPE.noise} />
            <path ref={r.cut} className="iso-line" data-tone="faint" d={RAW_TAPE.cut} />
            <path ref={r.voice} className="iso-line" data-tone="hi" d={RAW_TAPE.voice} />
            {REEL_ART.map((reel, i) => (
              // biome-ignore lint/suspicious/noArrayIndexKey: two reels
              <g key={i}>
                <Solid paths={reel.disc} tone="mid" inner={<Line d={reel.band} tone="faint" />} />
                <Line d={reel.flange} tone="lo" />
                <path
                  ref={r.wound[i]}
                  className="iso-line"
                  data-tone="mid"
                  d={woundOf(i, i ? 0.3 : 0.8)}
                />
                <path ref={r.spokes[i]} className="iso-line" data-tone="lo" d={spokesOf(i, 0)} />
                <Solid paths={reel.hub} tone="mid" />
                <Line d={reel.hubRing} tone="lo" />
              </g>
            ))}
          </Part>
        </Layer>
        <Layer>
          <Part name="bench">{rail(RAIL_FRONT)}</Part>
        </Layer>
        <Layer layerRef={r.front} rest={[PARK_X, 0, 0]}>
          <Part name="gantry">
            {HEADS.map((head, k) => (
              // biome-ignore lint/suspicious/noArrayIndexKey: three heads
              <g key={k} data-head={k}>
                <Solid paths={head.stem} tone="mid" crease="none" />
                <Solid paths={head.body} tone="hi" />
                <Line d={head.mark} tone="lo" />
              </g>
            ))}
            <Solid
              paths={GANTRY_TOP.carrier}
              tone="mid"
              inner={<Line d={GANTRY_TOP.carrierSeam} tone="faint" />}
            />
            <Solid paths={GANTRY_TOP.beam} tone="mid" />
            <Line d={GANTRY_TOP.groove} tone="faint" />
            <Dots points={GANTRY_TOP.screws} size={0.45} tone="mid" />
            {gantrySide(GANTRY_FRONT_SIDE)}
          </Part>
        </Layer>
      </div>
      {/* the three heads sit side by side: only the one at work gets its own label */}
      <StepTags steps={steps} minor={[2, 3]} />
    </div>
  );
});

export function AudioFigure({ lang, info }: { lang: Lang; info: ReactNode }) {
  const t = content[lang].audio;
  return (
    <FigureShell
      fig={PLATE.fig}
      t={t}
      guide={content[lang].guide}
      info={info}
      keys={keysOf(PLATE.marks, t.fig.keys)}
      option={PLATE.option}
      makeRig={(io) => new AudioRig(io)}
      drawing={(rig) => (
        <Drawing r={rig.r} label={t.fig.label} knob={PRESET_ANGLES[1]} steps={t.steps} />
      )}
      controls={({ rig, option, reset }) => (
        <Options t={t} option={option} reset={reset} skip={() => rig.skip()} />
      )}
    />
  );
}
