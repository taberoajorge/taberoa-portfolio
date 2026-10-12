import { type MouseEvent, type RefObject, useCallback, useEffect, useRef, useState } from 'react';
import { useInView, useLoop, useReadout } from '../../iso/react/live';
import type { Director, Pose } from './director';

// Runs the director's frame loop while the figure is on screen and drives the camera.
export function useDirector<P extends Pose>(
  director: Director<P>,
  view: RefObject<HTMLDivElement | null>,
  root: RefObject<HTMLDivElement | null>,
  stage: RefObject<HTMLDivElement | null>,
) {
  const inView = useInView(stage);

  const applyCamera = useCallback(
    (moving: boolean) => {
      const v = view.current;
      const r = root.current;
      if (!v || !r) return;
      const css = director.camera.css(v.clientWidth);
      if (r.style.transform !== css) r.style.transform = css;
      v.toggleAttribute('data-moving', moving);
      v.toggleAttribute('data-zoomed', director.camera.zoomed);
      const points = director.hooks.labels(director.pose);
      v.querySelectorAll<HTMLElement>('[data-step-tag]').forEach((tag, i) => {
        const [x, y] = director.camera.toScreen(points[i], v.clientWidth);
        const out = x < 0 || y < 0 || x > v.clientWidth || y > v.clientHeight;
        tag.style.transform = `translate(${x.toFixed(1)}px, ${y.toFixed(1)}px)`;
        tag.toggleAttribute('data-out', out);
        tag.toggleAttribute('data-below', y < 64); // no room above: hang the label below its point
        tag.setAttribute('data-placed', ''); // shown only once placed, so placing it is not a layout shift
      });
    },
    [director, root, view],
  );

  const tick = useCallback(
    (dt: number, still: boolean) => {
      const { more, gliding } = director.tick(dt, still);
      applyCamera(gliding);
      return more;
    },
    [applyCamera, director],
  );

  const kick = useLoop(tick, inView);

  useEffect(() => {
    const v = view.current;
    if (!v) return;
    const watch = new ResizeObserver(() => applyCamera(false));
    watch.observe(v);
    return () => watch.disconnect();
  }, [applyCamera, view]);

  return kick;
}

// Narration: the plate's readout plus a polite live region for screen readers.
export function useNarrator() {
  const { anchor, say } = useReadout<HTMLDivElement>();
  const live = useRef<HTMLParagraphElement>(null);
  const narrate = useCallback(
    (text: string) => {
      say(text);
      if (live.current) live.current.textContent = text;
    },
    [say],
  );
  return { anchor, live, narrate };
}

// The step on show: marks its label on the drawing; clicks on any label pick that step.
export function useSteps(view: RefObject<HTMLDivElement | null>, pick: (i: number) => void) {
  const [at, setAt] = useState(0);
  useEffect(() => {
    view.current?.querySelectorAll('[data-step-tag]').forEach((tag, i) => {
      tag.toggleAttribute('data-on', i === at);
    });
  }, [at, view]);
  const onTagClick = (event: MouseEvent) => {
    const tag = (event.target as Element).closest<HTMLElement>('[data-step]');
    if (tag) pick(Number(tag.dataset.step));
  };
  return { at, setAt, onTagClick };
}
