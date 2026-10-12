import { roll } from '../rng.ts';

// LoopForge's real default: GUTTER_THRESHOLD = 3 consecutive failures sends a story to human review.
export const GUTTER = 3;

// Story k depends on DEPS[k]. Ready stories with no unmerged dependency run in parallel worktrees.
const DEPS: number[][] = [[], [0], [], [], [2, 3], [1]];

type StoryStatus = 'queued' | 'running' | 'merged' | 'review';
export type Story = { id: number; status: StoryStatus; attempts: number; fails: number };

export type LoopForgeState = {
  seed: number;
  pFail: number;
  lanes: (number | null)[];
  stories: Story[];
  tick: number;
  commits: number;
  failures: number;
  paused: boolean;
  finished: boolean;
};

export function initial({ seed = 9, pFail = 0.35, lanes = 3 } = {}): LoopForgeState {
  return {
    seed,
    pFail,
    lanes: new Array(lanes).fill(null),
    stories: DEPS.map((_, id) => ({ id, status: 'queued', attempts: 0, fails: 0 })),
    tick: 0,
    commits: 0,
    failures: 0,
    paused: false,
    finished: false,
  };
}

const depsMerged = (stories: Story[], id: number) =>
  DEPS[id].every((d) => stories[d].status === 'merged');

export const isReady = (stories: Story[], id: number) =>
  stories[id].status === 'queued' && depsMerged(stories, id);

function fillLanes(lanes: (number | null)[], stories: Story[]) {
  for (let i = 0; i < lanes.length; i++) {
    if (lanes[i] !== null) continue;
    const next = stories.find((story) => isReady(stories, story.id));
    if (!next) return;
    next.status = 'running';
    lanes[i] = next.id;
  }
}

// Which story each lane works on this tick, before any attempt (pure).
export function assigned(s: LoopForgeState): (number | null)[] {
  const stories = s.stories.map((story) => ({ ...story }));
  const lanes = [...s.lanes];
  fillLanes(lanes, stories);
  return lanes;
}

// Attempts the story in place; reports whether it passed and whether its lane is now free.
function attempt(s: LoopForgeState, story: Story) {
  const passed = roll(s.seed, story.id, story.attempts) >= s.pFail;
  story.attempts++;
  if (passed) story.status = 'merged';
  else if (++story.fails >= GUTTER) story.status = 'review';
  return { passed, free: story.status !== 'running' };
}

// One tick: fill free lanes with ready stories, then every busy lane makes one attempt.
export function step(s: LoopForgeState): LoopForgeState {
  if (s.paused || s.finished) return s;
  const stories = s.stories.map((story) => ({ ...story }));
  const lanes = [...s.lanes];
  fillLanes(lanes, stories);

  let { commits, failures } = s;
  lanes.forEach((id, i) => {
    if (id === null) return;
    const { passed, free } = attempt(s, stories[id]);
    if (passed) commits++;
    else failures++;
    if (free) lanes[i] = null;
  });

  const busy = lanes.some((id) => id !== null);
  const runnable = stories.some((story) => isReady(stories, story.id));
  return {
    ...s,
    lanes,
    stories,
    tick: s.tick + 1,
    commits,
    failures,
    finished: !busy && !runnable,
  };
}

export function run(s: LoopForgeState): LoopForgeState {
  let state = s;
  while (!state.finished && !state.paused) state = step(state);
  return state;
}
