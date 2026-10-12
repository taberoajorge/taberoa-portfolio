// The step-by-step reading of a figure: numbered labels on the drawing, a stepper above it and a
// guide that says what each part of the drawing stands for.

export type StepText = { name: string; sub: string; title: string; what: string; map: string[] };
export type GuideText = {
  kicker: (n: number, total: number) => string;
  inDrawing: string;
  prev: string;
  next: string;
  steps: string;
};

// Numbered labels pinned to the drawing; the live loop moves them with the camera.
// `minor` labels only show while their step is on (for parts that sit close together).
export function StepTags({ steps, minor = [] }: { steps: StepText[]; minor?: number[] }) {
  return (
    <div className="rf-over" aria-hidden="true">
      {steps.map((step, i) => (
        <div
          key={step.name}
          className="rf-tag"
          data-step-tag={i}
          data-step={i}
          data-minor={minor.includes(i) ? '' : undefined}
        >
          <span className="rf-tag-box">
            <i>{i + 1}</i>
            <b>{step.name}</b>
            <small>{step.sub}</small>
          </span>
        </div>
      ))}
    </div>
  );
}

export function Stepper({
  steps,
  at,
  label,
  onPick,
}: {
  steps: StepText[];
  at: number;
  label: string;
  onPick: (i: number) => void;
}) {
  return (
    <ol className="rf-steps" aria-label={label}>
      {steps.map((step, i) => (
        <li key={step.name}>
          <button
            type="button"
            aria-current={i === at ? 'step' : undefined}
            onClick={() => onPick(i)}
          >
            <i>{i + 1}</i>
            {step.name}
          </button>
        </li>
      ))}
    </ol>
  );
}

// The step explained in plain words: what happens, and what each part of the drawing stands for.
export function Guide({
  steps,
  at,
  t,
  onPick,
}: {
  steps: StepText[];
  at: number;
  t: GuideText;
  onPick: (i: number) => void;
}) {
  const step = steps[at];
  return (
    <aside className="rf-guide" aria-live="polite">
      <p className="rf-guide-kicker">{t.kicker(at + 1, steps.length)}</p>
      <h4 className="rf-guide-title">{step.title}</h4>
      <p>{step.what}</p>
      <p className="rf-guide-sub">{t.inDrawing}</p>
      <ul className="rf-guide-map">
        {step.map.map((line) => {
          const [thing, meaning] = line.split(' = ');
          return (
            <li key={line}>
              {meaning ? (
                <>
                  <b>{thing}</b> = {meaning}
                </>
              ) : (
                line
              )}
            </li>
          );
        })}
      </ul>
      <div className="rf-guide-nav">
        <button type="button" onClick={() => onPick(at - 1)} disabled={at === 0}>
          ← {t.prev}
        </button>
        <button type="button" onClick={() => onPick(at + 1)} disabled={at === steps.length - 1}>
          {t.next} →
        </button>
      </div>
    </aside>
  );
}
