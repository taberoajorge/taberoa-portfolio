// The figure's layout and its basic controls, shared by the static figure the server renders and
// the live one that replaces it, so the swap never moves anything.
import type { ReactNode } from 'react';
import type { KeyMark } from '../../iso/iso-kit';

// Two columns on wide screens: the project and the step guide on the left (the guide stays in view
// while the figure plays), the figure on the right. On phones: project, figure, then the guide.
// The controls sit between the steps and the plate, right above the drawing they change.
export function FigureFrame({
  info,
  stepper,
  controls,
  plate,
  guide,
}: {
  info: ReactNode;
  stepper: ReactNode;
  controls: ReactNode;
  plate: ReactNode;
  guide: ReactNode;
}) {
  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(0,19rem)_minmax(0,1fr)] lg:grid-rows-[auto_1fr] lg:gap-x-10">
      <div>{info}</div>
      <div className="flex min-w-0 flex-col gap-3 lg:col-start-2 lg:row-span-2 lg:row-start-1">
        {stepper}
        {controls}
        {plate}
      </div>
      <div className="lg:sticky lg:top-8 lg:self-start">{guide}</div>
    </div>
  );
}

type ControlText = { play: string; pause: string; next: string; reset: string };

// Play, Next and Reset; without handlers (the static figure) they render disabled.
export function Controls({
  t,
  playing = false,
  finished = false,
  onPlay,
  onNext,
  onReset,
  children,
}: {
  t: ControlText;
  playing?: boolean;
  finished?: boolean;
  onPlay?: () => void;
  onNext?: () => void;
  onReset?: () => void;
  children?: ReactNode;
}) {
  return (
    <div className="fig-controls">
      <div className="fig-actions">
        <button type="button" onClick={onPlay} disabled={finished || !onPlay}>
          {onPlay ? (
            playing ? (
              t.pause
            ) : (
              t.play
            )
          ) : (
            // the static figure shows what the live one will: playing, unless motion is reduced
            <>
              <span className="rf-if-motion">{t.pause}</span>
              <span className="rf-if-still">{t.play}</span>
            </>
          )}
        </button>
        <button type="button" onClick={onNext} disabled={finished || !onNext}>
          {t.next}
        </button>
        <button type="button" onClick={onReset} disabled={!onReset}>
          {t.reset}
        </button>
      </div>
      {children}
    </div>
  );
}

// Legend keys from a figure's marks and its labels for them.
export const keysOf = (marks: KeyMark[], labels: Partial<Record<KeyMark, string>>) =>
  marks.map((mark) => ({ mark, label: labels[mark] ?? '' }));
