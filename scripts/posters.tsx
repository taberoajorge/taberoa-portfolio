// Renders each figure's drawing at rest into one standalone SVG in public/figures/: the poster the
// page shows until the live figure loads, and without JavaScript. Runs before every build and dev.
// The layers stay nested <svg> elements with the same viewBox, so they stack exactly as on the page.
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import type { ComponentType } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { content } from '../src/content';
import { Drawing as AudioDrawing } from '../src/figures/audio/Figure';
import * as audio from '../src/figures/audio/view';
import { Drawing as LoopForgeDrawing } from '../src/figures/loopforge/Figure';
import * as loopforge from '../src/figures/loopforge/view';
import { Drawing as RalphDrawing } from '../src/figures/ralph/Figure';
import * as ralph from '../src/figures/ralph/view';

// The drawings only hand these to `ref`; on the server any empty ref will do.
const refs = new Proxy({}, { get: () => ({ current: null }) });

type Props = { r: never; label: string; steps: never; knob: number };
const FIGURES = [
  { id: 'ralph', Drawing: RalphDrawing, view: ralph },
  { id: 'loopforge', Drawing: LoopForgeDrawing, view: loopforge },
  { id: 'audio', Drawing: AudioDrawing, view: audio, knob: audio.PRESET_ANGLES[1] },
] as const;

const css = readFileSync('src/iso/iso.css', 'utf8');

mkdirSync('public/figures', { recursive: true });
for (const figure of FIGURES) {
  const { id, view } = figure;
  const Drawing = figure.Drawing as unknown as ComponentType<Props>;
  const t = content.en[id];
  const html = renderToStaticMarkup(
    <Drawing
      r={refs as never}
      label={t.fig.label}
      steps={t.steps as never}
      knob={'knob' in figure ? figure.knob : 0}
    />,
  );
  const stage = /<div class="rf-stage">([\s\S]*?)<\/div><div class="rf-over"/.exec(html)?.[1];
  if (!stage) throw new Error(`${id}: no rf-stage in the rendered drawing`);
  // A layer moved to its rest position carries a CSS shift in % of its box; inside a standalone SVG
  // the same shift is the nested <svg>'s x and y.
  const layers = stage.replace(
    /<svg style="transform:translate3d\(([-\d.]+)%, ?([-\d.]+)%, ?0\)"/g,
    (_, x, y) =>
      `<svg x="${((Number(x) * view.WIDTH) / 100).toFixed(2)}" y="${((Number(y) * view.HEIGHT) / 100).toFixed(2)}"`,
  );
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${view.WIDTH} ${view.HEIGHT}" width="${view.WIDTH}" height="${view.HEIGHT}" class="iso" data-theme="light"><style>${css}</style>${layers}</svg>`;
  writeFileSync(`public/figures/${id}.svg`, svg);
  process.stdout.write(`public/figures/${id}.svg ${(svg.length / 1024).toFixed(0)} KB\n`);
}
