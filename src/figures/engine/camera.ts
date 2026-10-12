// A camera over an SVG drawing: it frames a box of the viewBox and glides between framings.
// It is applied as one CSS transform on the element that holds the drawing, so a move never
// redraws a path.

export type Box = [number, number, number, number]; // x0, y0, x1, y1 in viewBox units
export type View = [number, number, number, number]; // x, y, w, h in viewBox units

const smoother = (u: number) => u * u * u * (u * (u * 6 - 15) + 10);

// The view that shows `box` with some air, at the drawing's aspect, never closer than `most`×.
export function frameOf(
  [x0, y0, x1, y1]: Box,
  width: number,
  height: number,
  { pad = 34, most = 1.9 } = {},
): View {
  let w = Math.max(x1 - x0 + pad * 2, width / most);
  let h = Math.max(y1 - y0 + pad * 2, height / most);
  if (w / h > width / height) h = (w * height) / width;
  else w = (h * width) / height;
  w = Math.min(w, width);
  h = Math.min(h, height);
  const cx = Math.min(Math.max((x0 + x1) / 2, w / 2), width - w / 2);
  const cy = Math.min(Math.max((y0 + y1) / 2, h / 2), height - h / 2);
  return [cx - w / 2, cy - h / 2, w, h];
}

export class Camera {
  now: View;
  private from: View;
  private to: View;
  private t = 0;
  private dur = 0;

  constructor(
    readonly width: number,
    readonly height: number,
  ) {
    this.now = [0, 0, width, height];
    this.from = [...this.now];
    this.to = [...this.now];
  }

  get full(): View {
    return [0, 0, this.width, this.height];
  }

  get zoomed() {
    return this.now[2] < this.width - 0.5;
  }

  aim(view: View, seconds = 1) {
    if (view.every((v, i) => Math.abs(v - this.to[i]) < 0.01)) return;
    this.from = [...this.now];
    this.to = [...view];
    this.t = 0;
    this.dur = seconds;
  }

  // Advances the glide; returns true while it is still moving.
  step(dt: number, calm: boolean) {
    if (!this.dur) return false;
    this.t += dt;
    const u = calm ? 1 : Math.min(1, this.t / this.dur);
    const e = smoother(u);
    this.now = this.from.map((v, i) => v + (this.to[i] - v) * e) as View;
    if (u >= 1) this.dur = 0;
    return u < 1;
  }

  // Where a viewBox point lands, in CSS px, inside an element `pixels` wide.
  toScreen([x, y]: [number, number], pixels: number): [number, number] {
    const [vx, vy, w] = this.now;
    const k = pixels / this.width;
    const s = this.width / w;
    return [(x - vx) * s * k, (y - vy) * s * k];
  }

  // The CSS transform for an element whose width is `pixels` CSS px (transform-origin 0 0).
  css(pixels: number) {
    const [x, y, w] = this.now;
    const k = pixels / this.width;
    const s = this.width / w;
    if (Math.abs(s - 1) < 1e-4 && Math.abs(x) < 0.01 && Math.abs(y) < 0.01) return '';
    return `translate(${(-x * s * k).toFixed(2)}px, ${(-y * s * k).toFixed(2)}px) scale(${s.toFixed(5)})`;
  }
}
