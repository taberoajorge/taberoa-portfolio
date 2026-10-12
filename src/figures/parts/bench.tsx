import {
  corners,
  cylinder,
  haloOf,
  insetPlan,
  joinPaths,
  onTop,
  type Plan,
  type Point3,
  type Projection,
  planOutline,
  pointsAt,
  ring,
  slabOf,
  topTicks,
} from '../../iso/iso-kit';
import { Dots, Line, Solid } from '../../iso/react/draw';

type BenchPlan = {
  base: Plan;
  baseH: number;
  footH: number;
  feet?: number; // how far in from the corners the feet stand
  label: Plan; // the maker's plate
  strip?: Plan; // a ruler along the front edge
  marks?: number[]; // x positions marked on the ruler
};

// The machine base every figure stands on: halo, feet, slab, screws, a ruler and a label plate.
export function benchOf(
  P: Projection,
  { base, baseH, footH, feet = 18, label, strip, marks = [] }: BenchPlan,
) {
  const post = (x: number, y: number, r: number, z: number, h: number) =>
    cylinder(x, y, r, z, h, P, 24);
  // three ruled lines on the label, the middle one shorter
  const rule = (row: number) => {
    const y = label.y + label.d * (0.3 + row * 0.185);
    return onTop(
      [
        [label.x + label.w * 0.16, y],
        [label.x + label.w * (row === 1 ? 0.6 : 0.79), y],
      ],
      0.8,
      P,
    );
  };
  return {
    halo: haloOf(base, -baseH - footH, baseH, P),
    feet: corners(base, feet).map(([x, y]) => [
      post(x, y, 7, -baseH - footH, 1.6),
      post(x, y, 5.4, -baseH - footH + 1.6, footH - 1.6),
    ]),
    slab: slabOf(base, -baseH, baseH, P, 8, 1.6),
    groove: planOutline(insetPlan(base, 4.5), 0, P),
    screwRings: joinPaths(corners(base, 8).map(([x, y]) => ring(x, y, 2.2, 0, P, 16))),
    screws: pointsAt(
      corners(base, 8).map(([x, y]) => [x, y, 0] as Point3),
      P,
    ),
    strip: strip && {
      slab: slabOf(strip, 0, 0.6, P, 3),
      ticks: topTicks(strip.x + 2, strip.x + strip.w - 2, 5, 5, strip.y + 0.6, 0.6, [1.8, 3.4], P),
      marks: pointsAt(
        marks.map((x) => [x, strip.y + 4.6, 0.6] as Point3),
        P,
      ),
    },
    label: slabOf(label, 0, 0.8, P, 4),
    labelLine: planOutline(insetPlan(label, 1.6), 0.8, P),
    labelRule: joinPaths([0, 1, 2].map(rule)),
    labelScrews: pointsAt(
      [
        [label.x + 3.2, label.y + label.d / 2, 0.8],
        [label.x + label.w - 3.2, label.y + label.d / 2, 0.8],
      ],
      P,
    ),
  };
}

export function Bench({ art }: { art: ReturnType<typeof benchOf> }) {
  const { strip } = art;
  return (
    <g>
      <path className="iso-halo" d={art.halo} />
      {art.feet.map(([flange, foot], i) => (
        // biome-ignore lint/suspicious/noArrayIndexKey: fixed parts
        <g key={i}>
          <Solid paths={flange} tone="lo" />
          <Solid paths={foot} tone="mid" />
        </g>
      ))}
      <Solid paths={art.slab} tone="mid" />
      <Line d={art.groove} tone="faint" />
      <Line d={art.screwRings} tone="lo" />
      <Dots points={art.screws} size={0.5} tone="mid" />
      {strip ? (
        <>
          <Solid paths={strip.slab} tone="lo" crease="none" />
          <Line d={strip.ticks.minor} tone="lo" />
          <Line d={strip.ticks.major} tone="mid" />
          <Dots points={strip.marks} size={0.7} tone="hi" />
        </>
      ) : null}
      <Solid paths={art.label} tone="lo" crease="none" />
      <Line d={art.labelLine} tone="faint" />
      <Line d={art.labelRule} tone="lo" free />
      <Dots points={art.labelScrews} size={0.45} tone="mid" />
    </g>
  );
}
