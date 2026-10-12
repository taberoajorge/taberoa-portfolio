import { roll } from '../rng.ts';

// Ralph's real default: a story that fails GUTTER_THRESHOLD (3) times gets a guardrail.
export const GUTTER = 3;
// ponytail: illustrative cap; the real default MAX_ITERATIONS is 9999, which can't be animated.
export const MAX_ITERATIONS = 24;
const STORY_COUNT = 5;

type StoryStatus = 'todo' | 'doing' | 'done';
type Story = { id: number; status: StoryStatus; fails: number; guardrails: number };
type Outcome = 'pass' | 'fail' | 'guardrail';

export type RalphState = {
  seed: number;
  pFail: number;
  iteration: number;
  stories: Story[];
  current: number | null;
  last: Outcome | null;
  // what the verifier saw on the last attempt: the roll and the failure threshold it had to beat
  roll: number | null;
  threshold: number | null;
  finished: boolean;
};

export function initial({ seed = 11, pFail = 0.3 } = {}): RalphState {
  return {
    seed,
    pFail,
    iteration: 0,
    stories: Array.from({ length: STORY_COUNT }, (_, id) => ({
      id,
      status: 'todo',
      fails: 0,
      guardrails: 0,
    })),
    current: null,
    last: null,
    roll: null,
    threshold: null,
    finished: false,
  };
}

// ponytail: each guardrail halves the failure chance; illustrative, not measured.
export const effectivePFail = (pFail: number, guardrails: number) => pFail * 0.5 ** guardrails;

// One iteration: take the next story that hasn't passed, attempt it, verify it.
export function step(s: RalphState): RalphState {
  if (s.finished) return s;
  const next = s.stories.find((story) => story.status !== 'done');
  if (!next || s.iteration >= MAX_ITERATIONS) return { ...s, current: null, finished: true };

  const rolled = roll(s.seed, next.id, next.fails);
  const threshold = effectivePFail(s.pFail, next.guardrails);
  const passed = rolled >= threshold;
  const fails = passed ? next.fails : next.fails + 1;
  const learned = !passed && fails % GUTTER === 0;
  const updated: Story = {
    ...next,
    status: passed ? 'done' : 'doing',
    fails,
    guardrails: next.guardrails + (learned ? 1 : 0),
  };
  const stories = s.stories.map((story) => (story.id === next.id ? updated : story));
  const iteration = s.iteration + 1;
  const allDone = stories.every((story) => story.status === 'done');

  return {
    ...s,
    iteration,
    stories,
    current: next.id,
    last: passed ? 'pass' : learned ? 'guardrail' : 'fail',
    roll: rolled,
    threshold,
    finished: allDone || iteration >= MAX_ITERATIONS,
  };
}

export function run(s: RalphState): RalphState {
  let state = s;
  while (!state.finished) state = step(state);
  return state;
}
