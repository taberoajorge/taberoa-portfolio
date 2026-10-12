import { type Point3, type Projection, pointsAt } from '../../iso/iso-kit';
import type { Box } from '../engine/camera';

// The screen box around a world box, for the camera to frame.
export function boxOf(
  P: Projection,
  x0: number,
  x1: number,
  y0: number,
  y1: number,
  z0: number,
  z1: number,
): Box {
  const flat = pointsAt(
    [x0, x1].flatMap((x) => [y0, y1].flatMap((y) => [z0, z1].map((z) => [x, y, z] as Point3))),
    P,
  );
  const xs = flat.map(([x]) => x);
  const ys = flat.map(([, y]) => y);
  return [Math.min(...xs), Math.min(...ys), Math.max(...xs), Math.max(...ys)];
}
