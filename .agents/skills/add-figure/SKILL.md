---
name: add-figure
description: Add a new project figure to the portfolio or change an existing one (Ralph, LoopForge, Audio Cleaner) using the shared isometric engine, Rig and FigureShell.
---

# Add or change a figure

A figure is a small isometric machine that shows how one project really works, step by step. It is
built from four files in `src/figures/<project>/` on top of `src/figures/engine/` and
`src/figures/parts/`. Read `src/figures/AGENTS.md` and one existing figure (Ralph is the most
complete) before you start.

## 1. Model first

What the machine shows must be true to the project's repo. Put the rules in a pure, seeded model
in `src/models/<project>/model.ts` with `node --test` tests (`model.test.ts`): same seed, same run.
The figure only animates what the model decides.

## 2. Text

Add every string to `src/content/en.ts` under the project key (`steps`, `fig`, `say`, controls),
then the same keys to `es.ts`; the typechecker fails until both match. Five steps work well; each
has `name`, `sub`, `title`, `what` and `map` (`"part = meaning"` lines for the guide).

## 3. The four files

- `view.ts`: world sizes and the projection (`fitProjection`). The base is a `Plan` plus `BASE_H`
  and `FOOT_H`.
- `geometry.ts`: every path, built once at module load. Use `benchOf(P, { base, baseH, footH,
  label, strip?, marks? })` for the base and `boxOf(P, …)` for camera `FRAMES`. Round numbers that
  end up in SVG attributes to 2 decimals, or hydration will mismatch.
- `rig.ts`: `class XRig extends Rig<Pose, Option, Text>`. Declare `r` (refs made with `blank()`),
  pass `REST`, `FRAMES`, `WIDTH`, `HEIGHT` and the step stations to `super`, and implement:
  `plan()` (the next segments, or `null` when the run ends), `write(pose)` (DOM writes via
  `this.put`, never React state), `done()`, `labels(pose)` (the points the step labels point at),
  `restart(option)` and `idle()` (the narration at rest). Override `springs()` for free-running
  parts and `showStep()` only if a step frames something that moves.
- `Figure.tsx`: the `Drawing` (memoised, layered `<Layer>` SVGs sharing one viewBox, each station
  in a `<Part name>` so focus can dim the rest, `<StepTags>` at the end) and a `<FigureShell>` with
  `fig`, `t`, `guide`, `info`, `keys`, `option`, `makeRig`, `drawing` and `controls`.

Then add the figure to `FIGURES` and `PROJECTS` (`src/site/Projects.tsx`, `src/content/site.ts`)
and its repo to `REPOS`.

## 4. Motion

Segments ease with `smoother` by default; use `fall` for gravity and `linear` for constant speed.
Keep one camera move per step and stagger simultaneous flights. Explicit Play or Next must
animate even under reduced motion (the shell handles consent); autoplay must not.

## 5. Verify

`pnpm check`, then load the `verify-ui` skill: rest, a full run with Play, each step picked from
the stepper, desktop and 390 px, reduced motion, no JS, and `pnpm perf`. The `src/iso` kit is
vendored: never edit it, even to fix a figure.
