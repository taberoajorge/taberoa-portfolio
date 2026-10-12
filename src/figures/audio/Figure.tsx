'use client';

import { memo, type ReactNode, type RefObject } from 'react';
import { content, type Lang } from '../../content';
import { Dots, Line, Solid } from '../../iso/react/draw';
import { PRESET_NAMES, type PresetName } from '../../models/audio/model';
import { Layer as LayerOf, Part } from '../engine/dom';
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
import { AudioRig, RAW_TAPE } from './rig';
import { HEIGHT, PRESET_ANGLES, WIDTH } from './view';

const Layer = ({
  children,
  layerRef,
}: {
  children: ReactNode;
  layerRef?: RefObject<SVGSVGElement | null>;
}) => (
  <LayerOf layerRef={layerRef} width={WIDTH} height={HEIGHT}>
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

const Drawing = memo(function Drawing({
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
        <Layer layerRef={r.back}>
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
                  d={woundOf(i, i ? 0.3 : 0.6)}
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
        <Layer layerRef={r.front}>
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
      fig="Fig 3"
      t={t}
      guide={content[lang].guide}
      info={info}
      keys={[
        { mark: 'raised', label: t.fig.keys.raised },
        { mark: 'dim', label: t.fig.keys.dim },
        { mark: 'lit', label: t.fig.keys.lit },
      ]}
      option={'natural' as PresetName}
      makeRig={(io) => new AudioRig(io)}
      drawing={(rig) => (
        <Drawing r={rig.r} label={t.fig.label} knob={PRESET_ANGLES[1]} steps={t.steps} />
      )}
      controls={({ rig, option, reset }) => (
        <span className="ml-auto flex flex-wrap gap-2">
          <button type="button" onClick={() => reset(option)}>
            {t.before}
          </button>
          <button
            type="button"
            onClick={() => {
              reset(option);
              rig.skip();
            }}
          >
            {t.after}
          </button>
          {PRESET_NAMES.map((name) => (
            <button
              key={name}
              type="button"
              aria-pressed={option === name}
              onClick={() => reset(name)}
            >
              {name}
            </button>
          ))}
        </span>
      )}
    />
  );
}
