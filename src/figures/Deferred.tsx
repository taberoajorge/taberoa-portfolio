'use client';

// Shows the server-rendered static figure, and swaps in the live one once it comes within a
// screen of the viewport. Each figure's code is its own chunk, so none of it is in the first load.
import { type ComponentType, type ReactNode, useEffect, useRef, useState } from 'react';
import type { Lang, ProjectId } from '../content';

type Live = ComponentType<{ lang: Lang; info: ReactNode }>;

const LIVE: Record<ProjectId, () => Promise<Live>> = {
  ralph: () => import('./ralph/Figure').then((m) => m.RalphFigure),
  loopforge: () => import('./loopforge/Figure').then((m) => m.LoopForgeFigure),
  audio: () => import('./audio/Figure').then((m) => m.AudioFigure),
};

export function Deferred({
  id,
  lang,
  info,
  children,
}: {
  id: ProjectId;
  lang: Lang;
  info: ReactNode;
  children: ReactNode;
}) {
  const box = useRef<HTMLDivElement>(null);
  const [Live, setLive] = useState<Live | null>(null);
  useEffect(() => {
    const el = box.current;
    if (!el) return;
    let gone = false;
    const watch = new IntersectionObserver(
      (entries) => {
        if (!entries.some((e) => e.isIntersecting)) return;
        watch.disconnect();
        LIVE[id]().then((component) => gone || setLive(() => component));
      },
      { rootMargin: '100% 0px' },
    );
    // Start watching only once the page has loaded and the browser is idle, so figure code never
    // competes with the first paint.
    const observe = () => gone || watch.observe(el);
    const start = () =>
      'requestIdleCallback' in window
        ? window.requestIdleCallback(observe)
        : setTimeout(observe, 200);
    if (document.readyState === 'complete') start();
    else window.addEventListener('load', start, { once: true });
    return () => {
      gone = true;
      watch.disconnect();
      window.removeEventListener('load', start);
    };
  }, [id]);
  return <div ref={box}>{Live ? <Live lang={lang} info={info} /> : children}</div>;
}
