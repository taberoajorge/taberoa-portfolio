'use client';

import { memo, type ReactNode, type RefObject } from 'react';
import { content, type Lang } from '../../content';
import { translateAlong } from '../../iso/iso-kit';
import { Line, Solid } from '../../iso/react/draw';
import { Layer as LayerOf, Part } from '../engine/dom';
import { FigureShell } from '../engine/shell';
import { StepTags, type StepText } from '../engine/steps';
import {
  BASE,
  BOARD,
  CARRIAGE,
  Card,
  COLUMN_LOW,
  DIAL_BODY,
  ledges,
  magazine,
  PROBE_FIXED,
  PROBE_MOVING,
  RODS,
} from './art';
import {
  DIAL_ART,
  DONE,
  FOLLOWER,
  failZoneOf,
  MAG_BACK,
  MAG_FRONT,
  needleOf,
  STACK,
  TAGS,
  TRAY_ART,
  thresholdOf,
} from './geometry';
import { RalphRig } from './rig';
import { CARD_PITCH, HEIGHT, P, STACK_Z, WIDTH } from './view';

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

const Drawing = memo(function Drawing({
  r,
  label,
  steps,
}: {
  r: RalphRig['r'];
  label: string;
  steps: StepText[];
}) {
  return (
    <div ref={r.view} className="rf-view">
      <div ref={r.root} className="rf-stage">
        <svg className="iso-svg" viewBox={`0 0 ${WIDTH} ${HEIGHT}`} role="img" aria-label={label}>
          <Part name="bench">{BASE}</Part>
          <Part name="board">{BOARD}</Part>
        </svg>
        <Layer>
          <Part name="board">
            {TAGS.map((tag, i) => (
              // biome-ignore lint/suspicious/noArrayIndexKey: tags fill hooks in order
              <g key={i} data-tag={i} display="none">
                <Line d={tag.string} tone="mid" />
                <Solid paths={tag.body} tone="hi" />
                <Line d={tag.eyelet} tone="lo" />
                <Line d={tag.rule} tone="lo" free />
              </g>
            ))}
          </Part>
        </Layer>
        <Layer>
          <Part name="station">{COLUMN_LOW}</Part>
          <Part name="magazine">{magazine(MAG_BACK, 'mag-back', false)}</Part>
          <Part name="bench">{RODS}</Part>
        </Layer>
        <Layer layerRef={r.car}>
          <Part name="carriage">
            {CARRIAGE}
            <g ref={r.carCard} display="none">
              <Card lit />
            </g>
          </Part>
        </Layer>
        <Layer>
          <Part name="magazine">{ledges(MAG_BACK)}</Part>
        </Layer>
        <Layer layerRef={r.stack}>
          <Part name="magazine">
            {STACK.map((card, i) => (
              <g key={card.z} data-slot={i}>
                <Solid paths={card.body} tone="hi" />
              </g>
            ))}
            <g
              ref={r.follower}
              transform={translateAlong(P, [0, 0, STACK_Z + STACK.length * CARD_PITCH])}
            >
              <Solid paths={FOLLOWER.body} tone="mid" />
              <Solid paths={FOLLOWER.knob} tone="mid" />
              <Line d={FOLLOWER.knurl} tone="lo" />
            </g>
          </Part>
        </Layer>
        <Layer>
          <Part name="magazine">{magazine(MAG_FRONT, 'mag-front', true)}</Part>
        </Layer>
        <Layer layerRef={r.probe}>
          <Part name="station">{PROBE_MOVING}</Part>
        </Layer>
        <Layer>
          <Part name="station">{PROBE_FIXED}</Part>
          <Part name="tray">
            <Solid paths={TRAY_ART.floor} tone="lo" />
            <Line d={TRAY_ART.floorLine} tone="faint" />
            {TRAY_ART.far.map((paths, i) => (
              // biome-ignore lint/suspicious/noArrayIndexKey: fixed parts
              <Solid key={i} paths={paths} tone="mid" />
            ))}
            {DONE.map((paths, i) => (
              // biome-ignore lint/suspicious/noArrayIndexKey: stack slots
              <g key={i} data-done={i} display="none">
                <Solid paths={paths} tone="hi" />
              </g>
            ))}
          </Part>
        </Layer>
        <Layer layerRef={r.eject}>
          <Part name="tray">
            <g ref={r.ejectCard} display="none">
              <Card lit />
            </g>
          </Part>
        </Layer>
        <Layer>
          <Part name="tray">
            {TRAY_ART.near.map((paths, i) => (
              <Solid
                // biome-ignore lint/suspicious/noArrayIndexKey: fixed parts
                key={i}
                paths={paths}
                tone="mid"
                inner={i === 1 ? <Line d={TRAY_ART.nearSeam} tone="faint" /> : null}
              />
            ))}
          </Part>
          <Part name="station">
            {DIAL_BODY}
            <path
              ref={r.zone}
              className="iso-line"
              data-tone="mid"
              data-dotted=""
              d={failZoneOf(0.3)}
            />
            <path ref={r.mark} className="iso-line" data-tone="hi" d={thresholdOf(0.3)} />
          </Part>
        </Layer>
        <Layer>
          <Part name="station">
            <path
              ref={r.needle}
              className="iso-line"
              data-tone="lit"
              d={needleOf(0)}
              style={{ strokeWidth: 1.1 }}
            />
            <Line d={DIAL_ART.hub} tone="hi" />
          </Part>
        </Layer>
      </div>
      <StepTags steps={steps} />
    </div>
  );
});

export function RalphFigure({ lang, info }: { lang: Lang; info: ReactNode }) {
  const t = content[lang].ralph;
  return (
    <FigureShell
      fig="Fig 1"
      t={t}
      guide={content[lang].guide}
      info={info}
      keys={[
        { mark: 'lit', label: t.fig.keys.lit },
        { mark: 'raised', label: t.fig.keys.raised },
        { mark: 'dotted', label: t.fig.keys.dotted },
      ]}
      option={0.3}
      makeRig={(io) => new RalphRig(io)}
      drawing={(rig) => <Drawing r={rig.r} label={t.fig.label} steps={t.steps} />}
      controls={({ option, reset }) => (
        <label>
          {t.clumsiness}
          <input
            type="range"
            min={0.1}
            max={0.95}
            step={0.05}
            value={option}
            onChange={(e) => reset(Number(e.target.value))}
          />
          <output>{Math.round(option * 100)}%</output>
        </label>
      )}
    />
  );
}
