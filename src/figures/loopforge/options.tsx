import type { Content } from '../../content';

// How many worktrees run at once. Without `reset` (the static figure) it is inert.
export function Options({
  t,
  option,
  reset,
}: {
  t: Content['loopforge'];
  option: number;
  reset?: (option: number) => void;
}) {
  return (
    <div className="fig-options">
      {[1, 3].map((n) => (
        <button
          key={n}
          type="button"
          aria-pressed={option === n}
          disabled={!reset}
          onClick={reset && (() => reset(n))}
        >
          {t.lanes(n)}
        </button>
      ))}
    </div>
  );
}
