# taberoa-portfolio

The source of [taberoa.com](https://taberoa.com), the portfolio of Alex Taberoa, a Senior Software
Engineer (full-stack AI product engineering).

Each open-source project is explained as a small isometric machine that runs step by step:

- **Ralph**: story cards ride from a magazine to a test probe; failures punch holes, repeated
  failures hang a guardrail tag.
- **LoopForge**: ready stories fly to parallel git worktrees, get verified, and land in main or in
  human review.
- **Audio Cleaner**: a recording passes under three heads (denoise, find silences, polish) and the
  silences close up.

What each machine shows comes from a small, seeded model of the real project, with tests.

Static Next.js 15 (App Router), React 19, Tailwind CSS 3, Biome and pnpm. English at `/`, Spanish
at `/es`.

## Run it

```sh
sh scripts/bootstrap.sh   # Node from .node-version (fnm use), Corepack, deps, Git hooks
corepack pnpm dev         # prints this checkout's URL (http://localhost:3302 in the main checkout)
```

| Command | What it does |
|---|---|
| `pnpm check` | Biome, TypeScript, tests, import boundaries, dead code (Knip), OpenSpec validation |
| `pnpm build` / `pnpm start` | Production build and server |
| `pnpm perf` | Lighthouse on `/` and `/es` (mobile and desktop) plus HTML, JS and Web Vitals budgets |
| `pnpm parity save` / `compare` | Snapshot of the head, visible text and JSON-LD, to catch unintended changes |

## How it is organised

```
src/
  app/        routes and Next special files only
  site/       page sections, metadata, JSON-LD, OG image
  content/    all text: en.ts (the shape), es.ts (typed against it), site.ts (links, repos)
  models/     pure, seeded models of each project, with node --test tests
  figures/
    engine/   Director, camera, Rig base class, FigureShell, steps UI
    parts/    shared machine parts (bench, camera boxes)
    <project>/ view.ts, geometry.ts, rig.ts, Figure.tsx
  iso/        vendored /anatomy kit (not edited here)
scripts/      bootstrap, ports, checks, commit and delivery rules, agent hooks
openspec/     specs and change proposals
```

Import rules between these folders are checked by `pnpm check`. [AGENTS.md](AGENTS.md) has the full
map and the rules; the `add-figure` skill (`.agents/skills/add-figure/SKILL.md`) walks through adding
a project.

## Working on it

- **Changes** start as an [OpenSpec](https://github.com/Fission-AI/OpenSpec) proposal in
  `openspec/changes/` when they touch behaviour or several files.
- **Commits** follow Conventional Commits; a `commit-msg` hook checks the format and rejects AI
  attribution. `pre-push` runs `pnpm check` and `pnpm build` and refuses to rewrite `main`.
- **Pull requests** need `Summary`, `Intent` and `Verification` sections:
  `pnpm delivery:pr-create "type(scope): subject" body.md`. CI runs the same checks, an audit and a
  secret scan.
- **Worktrees**: each checkout prepares itself with `scripts/bootstrap.sh` and serves on its own
  port; Orca runs the bootstrap for new worktrees through
  `orca.yaml`. See [docs/worktrees.md](docs/worktrees.md).
- **Agents**: Claude Code, Codex, Cursor, OpenCode, Gemini CLI, Antigravity and GitHub Copilot all
  read `AGENTS.md`, share the skills in `.agents/skills/`, and run the same guards from
  `scripts/agent-hooks.ts`. Claude Code and Codex ask you to trust project hooks first: read
  `.claude/settings.json` and `.codex/hooks.json` before you do.

## License

The code is [MIT](LICENSE). The personal content is not: the text in `src/content/`, the CV in
`public/`, and Alex Taberoa's name and likeness. Please don't reuse them as your own.
