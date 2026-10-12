import { Dots, Line, Solid } from '../../iso/react/draw';
import { Bench } from '../parts/bench';
import {
  ARM_ART,
  BENCH,
  BOARD_ART,
  CARD_ART,
  CARRIAGE_ART,
  COLUMN_ART,
  DIAL_ART,
  type MAG_BACK,
  PROBE_ART,
  ROD_ART,
} from './geometry';

export const BASE = <Bench art={BENCH} />;

export const BOARD = (
  <g key="board">
    {BOARD_ART.feet.map((paths, i) => (
      // biome-ignore lint/suspicious/noArrayIndexKey: fixed parts
      <Solid key={i} paths={paths} tone="lo" />
    ))}
    <Dots points={BOARD_ART.footScrews} size={0.45} tone="mid" />
    <Solid paths={BOARD_ART.board} tone="mid" />
    <Dots points={BOARD_ART.holes} size={0.55} tone="lo" />
    <Line d={BOARD_ART.hooks} tone="lo" />
    <Line d={BOARD_ART.hookPins} tone="mid" />
  </g>
);

export const COLUMN_LOW = (
  <g key="column-low">
    <Solid paths={COLUMN_ART.flange} tone="lo" />
    <Dots points={COLUMN_ART.flangeScrews} size={0.45} tone="mid" />
    <Solid paths={COLUMN_ART.column} tone="mid" crease="none" />
    <Line d={COLUMN_ART.columnSeam} tone="faint" />
    <Solid paths={COLUMN_ART.collar} tone="mid" />
    <Solid paths={COLUMN_ART.collarScrew} tone="mid" />
  </g>
);

export const ledges = (side: typeof MAG_BACK) =>
  side.ledges.map((paths, i) => (
    // biome-ignore lint/suspicious/noArrayIndexKey: fixed parts
    <Solid key={`l${i}`} paths={paths} tone="mid" />
  ));

// The back ledges sit above a loaded card, so they are drawn after the carriage, not with their posts.
export const magazine = (side: typeof MAG_BACK, key: string, withLedges: boolean) => (
  <g key={key}>
    {side.feet.map((paths, i) => (
      // biome-ignore lint/suspicious/noArrayIndexKey: fixed parts
      <Solid key={`f${i}`} paths={paths} tone="lo" />
    ))}
    {side.posts.map((paths, i) => (
      // biome-ignore lint/suspicious/noArrayIndexKey: fixed parts
      <Solid key={`p${i}`} paths={paths} tone="mid" crease="none" />
    ))}
    {withLedges && ledges(side)}
    <Solid paths={side.bar} tone="mid" />
    <Dots points={side.barScrews} size={0.45} tone="mid" />
  </g>
);

export const RODS = (
  <g key="rods">
    {ROD_ART.ends.map((paths, i) => (
      // biome-ignore lint/suspicious/noArrayIndexKey: fixed parts
      <Solid key={`e${i}`} paths={paths} tone="mid" />
    ))}
    <Dots points={ROD_ART.endScrews} size={0.45} tone="mid" />
    {ROD_ART.rods.map((paths, i) => (
      // biome-ignore lint/suspicious/noArrayIndexKey: fixed parts
      <Solid key={`r${i}`} paths={paths} tone="mid" crease="none" />
    ))}
  </g>
);

export const CARRIAGE = (
  <g key="carriage">
    <path className="iso-halo" d={CARRIAGE_ART.halo} />
    {CARRIAGE_ART.bushes.map((paths, i) => (
      // biome-ignore lint/suspicious/noArrayIndexKey: fixed parts
      <Solid key={i} paths={paths} tone="mid" />
    ))}
    <Solid paths={CARRIAGE_ART.plate} tone="mid" />
    <Line d={CARRIAGE_ART.seat} tone="faint" />
    {CARRIAGE_ART.pins.map((paths, i) => (
      // biome-ignore lint/suspicious/noArrayIndexKey: fixed parts
      <Solid key={i} paths={paths} tone="mid" />
    ))}
    <Dots points={CARRIAGE_ART.rivets} size={0.4} tone="lo" />
  </g>
);

export const PROBE_MOVING = (
  <g key="probe-moving">
    <Solid paths={PROBE_ART.stem} tone="mid" crease="none" />
    <Solid paths={PROBE_ART.stemCollar} tone="mid" />
    <Solid paths={PROBE_ART.pad} tone="hi" />
    <Line d={PROBE_ART.padRing} tone="lo" />
  </g>
);

export const PROBE_FIXED = (
  <g key="probe-fixed">
    <Solid
      paths={PROBE_ART.housing}
      tone="mid"
      inner={<Line d={PROBE_ART.housingSeams} tone="faint" />}
    />
    <Solid paths={PROBE_ART.housingLip} tone="mid" />
    <Solid paths={ARM_ART.arm} tone="mid" />
    <Line d={ARM_ART.groove} tone="faint" />
    <Dots points={ARM_ART.screws} size={0.45} tone="mid" />
    <Solid paths={COLUMN_ART.top} tone="mid" crease="none" />
    <Solid paths={COLUMN_ART.cap} tone="mid" />
  </g>
);

export const DIAL_BODY = (
  <g key="dial">
    <Solid paths={DIAL_ART.stand} tone="lo" />
    <Dots points={DIAL_ART.standScrews} size={0.45} tone="mid" />
    <Solid paths={DIAL_ART.crown} tone="mid" />
    <Solid paths={DIAL_ART.crownCap} tone="mid" />
    <Solid paths={DIAL_ART.puck} tone="mid" inner={<Line d={DIAL_ART.band} tone="faint" />} />
    <Line d={DIAL_ART.knurl} tone="faint" />
    <Line d={DIAL_ART.bezel} tone="lo" />
    <Line d={DIAL_ART.minor} tone="lo" />
    <Line d={DIAL_ART.major} tone="mid" />
  </g>
);

// A story card. Every hole slot is drawn; the live code shows them one by one (data-hole + opacity).
export function Card({ lit }: { lit: boolean }) {
  return (
    <>
      <Solid paths={CARD_ART.body} tone="hi" lit={lit} />
      <Line d={CARD_ART.rule} tone="lo" free />
      {CARD_ART.holes.map((d, i) => (
        <path
          key={d}
          className="iso-line"
          data-tone="hi"
          data-hole={i}
          d={d}
          style={{ opacity: 0 }}
        />
      ))}
    </>
  );
}
