'use client';

import { memo, type ReactNode } from 'react';
import { content, type Lang } from '../../content';
import { translateAlong } from '../../iso/iso-kit';
import { Dots, Line, Solid } from '../../iso/react/draw';
import { Layer as LayerOf, Part } from '../engine/dom';
import { keysOf } from '../engine/frame';
import { FigureShell } from '../engine/shell';
import { StepTags, type StepText } from '../engine/steps';
import { Bench } from '../parts/bench';
import {
  ANVILS,
  BEAM_ART,
  BENCH,
  CARD_ART,
  FLAG,
  FLAG_DROP,
  HOUSINGS,
  LAMP_PLATE,
  LAMPS,
  LEG_BACK,
  LEG_FRONT,
  LOCKS,
  MAIN_ART,
  PROBES,
  RACK_ART,
  REVIEW_ART,
  SHUTTERS,
} from './geometry';
import { BLOCKED, LoopForgeRig, rackAt } from './rig';
import { HEIGHT, P, PLATE, STORIES, WIDTH } from './view';

const Layer = ({ children }: { children: ReactNode }) => (
  <LayerOf width={WIDTH} height={HEIGHT}>
    {children}
  </LayerOf>
);

const leg = (side: typeof LEG_BACK) => (
  <>
    <Solid paths={side.foot} tone="lo" />
    <Dots points={side.footScrews} size={0.45} tone="mid" />
    <Solid paths={side.upright} tone="mid" inner={<Line d={side.seam} tone="faint" />} />
  </>
);

export const Drawing = memo(function Drawing({
  r,
  label,
  steps,
}: {
  r: LoopForgeRig['r'];
  label: string;
  steps: StepText[];
}) {
  return (
    <div ref={r.view} className="rf-view">
      <div ref={r.root} className="rf-stage">
        <svg className="iso-svg" viewBox={`0 0 ${WIDTH} ${HEIGHT}`} role="img" aria-label={label}>
          <Part name="bench">
            <Bench art={BENCH} />
          </Part>
          <Part name="rack">
            <Solid paths={RACK_ART.plate} tone="mid" />
            <Line d={RACK_ART.pockets} tone="faint" />
            <Dots points={RACK_ART.screws} size={0.5} tone="mid" />
            <Dots points={RACK_ART.index} size={0.6} tone="hi" />
          </Part>
          <Part name="lanes">
            {leg(LEG_BACK)}
            {ANVILS.map((anvil, l) => (
              // biome-ignore lint/suspicious/noArrayIndexKey: lanes are positional
              <g key={l}>
                <Solid paths={anvil.body} tone="mid" inner={<Line d={anvil.seam} tone="faint" />} />
                <Line d={anvil.seat} tone="faint" />
                <Dots points={anvil.screws} size={0.45} tone="mid" />
                <Solid paths={LAMP_PLATE[l]} tone="lo" crease="none" />
                {LAMPS[l].map((lamp, i) => (
                  // biome-ignore lint/suspicious/noArrayIndexKey: three lamps per lane
                  <g key={i}>
                    <Solid paths={lamp.body} tone="mid" />
                    <Line d={lamp.ring} tone="lo" />
                    <g data-lamp={`${l}-${i}`} display="none">
                      <Dots points={lamp.on} size={1.3} tone="hi" />
                    </g>
                  </g>
                ))}
                <g data-shutter={l} display="none">
                  <Solid paths={SHUTTERS[l].body} tone="lo" />
                  <Line d={SHUTTERS[l].grip} tone="mid" />
                </g>
              </g>
            ))}
          </Part>
          <Part name="out">
            <Solid paths={MAIN_ART.plinth} tone="mid" />
            <Line d={MAIN_ART.seat} tone="faint" />
            {MAIN_ART.guides.map((paths, i) => (
              // biome-ignore lint/suspicious/noArrayIndexKey: fixed parts
              <g key={i}>
                <Solid paths={paths} tone="mid" crease="none" />
                <Solid paths={MAIN_ART.caps[i]} tone="mid" />
              </g>
            ))}
            <Solid paths={REVIEW_ART.floor} tone="lo" />
            <Line d={REVIEW_ART.floorLine} tone="faint" />
            {REVIEW_ART.far.map((paths, i) => (
              // biome-ignore lint/suspicious/noArrayIndexKey: fixed parts
              <Solid key={i} paths={paths} tone="mid" />
            ))}
            <Solid paths={REVIEW_ART.poleFoot} tone="lo" />
            <Solid paths={REVIEW_ART.pole} tone="mid" crease="none" />
            <Solid paths={REVIEW_ART.poleCap} tone="mid" />
          </Part>
        </svg>
        <Layer>
          {Array.from({ length: STORIES }, (_, k) => (
            // biome-ignore lint/suspicious/noArrayIndexKey: one card per story
            <g key={k} data-card={k} transform={translateAlong(P, rackAt(k))}>
              <Solid paths={CARD_ART.body} tone="hi" />
              <Line d={CARD_ART.rule} tone="lo" free />
            </g>
          ))}
        </Layer>
        <Layer>
          <Part name="rack">
            {LOCKS.map((lock, k) => (
              // biome-ignore lint/suspicious/noArrayIndexKey: one lock per story
              <g key={k} data-lock={k} display={BLOCKED.includes(k) ? undefined : 'none'}>
                <Solid paths={lock.pin} tone="mid" crease="none" />
                <Solid paths={lock.arm} tone="hi" />
                <Line d={lock.cap} tone="lo" />
              </g>
            ))}
          </Part>
        </Layer>
        <Layer>
          <Part name="lanes">
            {PROBES.map((probe, l) => (
              // biome-ignore lint/suspicious/noArrayIndexKey: lanes are positional
              <g key={l} data-probe={l}>
                <Solid paths={probe.stem} tone="mid" crease="none" />
                <Solid paths={probe.collar} tone="mid" />
                <Solid paths={probe.pad} tone="hi" />
                <Line d={probe.padRing} tone="lo" />
              </g>
            ))}
          </Part>
        </Layer>
        <Layer>
          <Part name="lanes">
            {HOUSINGS.map((h, l) => (
              // biome-ignore lint/suspicious/noArrayIndexKey: lanes are positional
              <g key={l}>
                <Solid paths={h.body} tone="mid" inner={<Line d={h.seams} tone="faint" />} />
                <Solid paths={h.lip} tone="mid" />
              </g>
            ))}
            <Solid paths={BEAM_ART.beam} tone="mid" />
            <Line d={BEAM_ART.groove} tone="faint" />
            <Dots points={BEAM_ART.screws} size={0.45} tone="mid" />
            {leg(LEG_FRONT)}
          </Part>
          <Part name="out">
            {REVIEW_ART.near.map((paths, i) => (
              // biome-ignore lint/suspicious/noArrayIndexKey: fixed parts
              <Solid key={i} paths={paths} tone="mid" />
            ))}
            <g ref={r.flag} transform={translateAlong(P, [0, 0, -FLAG_DROP])}>
              <Solid paths={FLAG.body} tone="hi" />
              <Line d={FLAG.rule} tone="lo" free />
            </g>
          </Part>
        </Layer>
      </div>
      <StepTags steps={steps} />
    </div>
  );
});

export function LoopForgeFigure({ lang, info }: { lang: Lang; info: ReactNode }) {
  const t = content[lang].loopforge;
  return (
    <FigureShell
      fig={PLATE.fig}
      t={t}
      guide={content[lang].guide}
      info={info}
      keys={keysOf(PLATE.marks, t.fig.keys)}
      option={3}
      makeRig={(io) => new LoopForgeRig(io)}
      drawing={(rig) => <Drawing r={rig.r} label={t.fig.label} steps={t.steps} />}
      controls={({ option, reset }) => (
        <span className="ml-auto flex gap-2">
          {[1, 3].map((n) => (
            <button key={n} type="button" aria-pressed={option === n} onClick={() => reset(n)}>
              {t.lanes(n)}
            </button>
          ))}
        </span>
      )}
    />
  );
}
