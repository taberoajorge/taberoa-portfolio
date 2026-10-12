import type { Content } from '../../content';
import { PRESET_NAMES, type PresetName } from '../../models/audio/model';

// The recording before or after cleaning, and the preset. Without `reset` (the static figure) they
// are inert; `skip` jumps the live figure to the cleaned result.
export function Options({
  t,
  option,
  reset,
  skip,
}: {
  t: Content['audio'];
  option: PresetName;
  reset?: (option: PresetName) => void;
  skip?: () => void;
}) {
  return (
    <>
      <div className="fig-options">
        <button type="button" disabled={!reset} onClick={reset && (() => reset(option))}>
          {t.before}
        </button>
        <button
          type="button"
          disabled={!reset}
          onClick={
            reset &&
            (() => {
              reset(option);
              skip?.();
            })
          }
        >
          {t.after}
        </button>
      </div>
      <div className="fig-options">
        {PRESET_NAMES.map((name) => (
          <button
            key={name}
            type="button"
            aria-pressed={option === name}
            disabled={!reset}
            onClick={reset && (() => reset(name))}
          >
            {name}
          </button>
        ))}
      </div>
    </>
  );
}
