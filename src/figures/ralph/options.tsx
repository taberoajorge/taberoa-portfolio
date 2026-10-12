import type { Content } from '../../content';

// Ralph's own setting: how clumsy the agent is. Without `reset` (the static figure) it is inert.
export function Options({
  t,
  option,
  reset,
}: {
  t: Content['ralph'];
  option: number;
  reset?: (option: number) => void;
}) {
  return (
    <label className="fig-range">
      <span>{t.clumsiness}</span>
      <input
        type="range"
        min={0.1}
        max={0.95}
        step={0.05}
        value={option}
        disabled={!reset}
        readOnly={!reset}
        onChange={reset && ((e) => reset(Number(e.target.value)))}
      />
      <output>{Math.round(option * 100)}%</output>
    </label>
  );
}
