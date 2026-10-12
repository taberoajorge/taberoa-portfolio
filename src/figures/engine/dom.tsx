// Writing the drawing: attributes that change only when they must, layers that move as a whole,
// and the `data-part` stations the focus dims.

import type { ReactNode, RefObject } from 'react';
import { axisVector, type Point3, type Projection } from '../../iso/iso-kit';

// Writes an attribute (or `style.transform`) only when it changed, so still parts never invalidate.
export function makePut() {
  const written = new WeakMap<Element, Map<string, string>>();
  const put = (el: Element | null | undefined, key: string, value: string) => {
    if (!el) return;
    const seen = written.get(el) ?? new Map<string, string>();
    written.set(el, seen);
    if (seen.get(key) === value) return;
    seen.set(key, value);
    if (key === 'style.transform') (el as SVGElement).style.transform = value;
    else el.setAttribute(key, value);
  };
  put.forget = (el: Element) => written.delete(el);
  return put;
}
type Put = ReturnType<typeof makePut>;

// A world offset as a CSS transform in % of the layer's own box (layers share one viewBox).
export function layerShift(P: Projection, by: Point3, width: number, height: number) {
  const [x, y] = axisVector(P, by);
  return `translate3d(${((x / width) * 100).toFixed(4)}%, ${((y / height) * 100).toFixed(4)}%, 0)`;
}

// Moves a whole SVG layer by a world offset.
export function moveLayer(
  put: Put,
  el: Element | null,
  P: Projection,
  by: Point3,
  width: number,
  height: number,
) {
  put(el, 'style.transform', layerShift(P, by, width, height));
}

export function shown(el: Element | null | undefined, on: boolean) {
  if (on) el?.removeAttribute('display');
  else el?.setAttribute('display', 'none');
}

export function focusParts(root: Element | null, parts: string[] | null) {
  if (!root) return;
  root.toggleAttribute('data-focus', Boolean(parts));
  for (const el of root.querySelectorAll('[data-part]'))
    el.toggleAttribute('data-on', Boolean(parts?.includes(el.getAttribute('data-part') ?? '')));
}

// One of the stacked SVGs of a drawing; they share a viewBox so each can move on its own.
export function Layer({
  children,
  layerRef,
  width,
  height,
  shift,
}: {
  children: ReactNode;
  layerRef?: RefObject<SVGSVGElement | null>;
  width: number;
  height: number;
  shift?: string; // where a moving layer sits at rest (see layerShift)
}) {
  return (
    <svg
      ref={layerRef}
      style={shift ? { transform: shift } : undefined}
      className="iso-svg"
      viewBox={`0 0 ${width} ${height}`}
      aria-hidden="true"
      focusable="false"
    >
      {children}
    </svg>
  );
}

// Each station is a `data-part`; while the camera is on one, the rest are drawn one tone dimmer.
export const Part = ({ name, children }: { name: string; children: ReactNode }) => (
  <g data-part={name}>{children}</g>
);
