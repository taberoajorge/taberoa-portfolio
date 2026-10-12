// A project's figure as the server renders it: the same frame as the live figure, with a static
// poster of the machine at rest. Readable without JavaScript; the live figure replaces it on approach.
import type { ReactNode } from 'react';
import { content, type Lang, type ProjectId } from '../content';
import { Plate } from '../iso/react/draw';
import * as audio from './audio/view';
import { Deferred } from './Deferred';
import { Controls, FigureFrame, keysOf } from './engine/frame';
import { Guide, Stepper } from './engine/steps';
import * as loopforge from './loopforge/view';
import * as ralph from './ralph/view';

const VIEWS = { ralph, loopforge, audio };

export function ProjectFigure({ id, lang, info }: { id: ProjectId; lang: Lang; info: ReactNode }) {
  const c = content[lang];
  const t = c[id];
  const { PLATE, WIDTH, HEIGHT } = VIEWS[id];
  const readout = PLATE.readout(c);
  const figure = (
    <>
      <Stepper steps={t.steps} at={0} label={c.guide.steps} />
      <Plate
        fig={PLATE.fig}
        title={t.fig.title}
        hint={t.fig.hint}
        readout={readout}
        keys={keysOf(PLATE.marks, t.fig.keys)}
        caption={t.fig.caption}
      >
        <div className="rf-view">
          <img
            className="iso-svg"
            src={`/figures/${id}.svg`}
            alt={t.fig.label}
            width={WIDTH}
            height={HEIGHT}
            loading="lazy"
            decoding="async"
          />
        </div>
      </Plate>
      <p className="sr-only">{readout}</p>
      <Controls t={t} />
    </>
  );
  return (
    <Deferred id={id} lang={lang} info={info}>
      <FigureFrame
        info={info}
        figure={figure}
        guide={<Guide steps={t.steps} at={0} t={c.guide} />}
      />
    </Deferred>
  );
}
