# taberoa-portfolio

Alex Taberoa's portfolio: two static pages (`/` in English, `/es` in Spanish) with three open-source
projects drawn as small isometric machines that run step by step. Next 15 (App Router, static),
React 19, Tailwind 3, Biome, pnpm. Deployed on Vercel at https://taberoa.com.

## Setup and commands

- Prepare a checkout or worktree: `sh scripts/bootstrap.sh` (Node from `.node-version`, Corepack).
  Orca runs it on its own (`orca.yaml`); outside Orca see `docs/worktrees.md` and the
  `worktree-bootstrap` skill.
- `corepack pnpm dev` / `pnpm start`: this checkout's own port (main checkout 3302, worktrees
  3300–3399); `node scripts/port.ts` prints it.
- `pnpm check`: Biome, types, tests, import boundaries, dead code (Knip) and OpenSpec. Run it before
  saying work is done; it also writes the certificate the agent hooks look for.
- `pnpm build`, `pnpm perf` (Lighthouse and load budgets), `pnpm parity` (head, text and JSON-LD
  snapshot of `/` and `/es`: `save`, then `compare`).
- Pushes run `pnpm check` and `pnpm build` under the pinned Node: `fnm use` first.

## Map

| Folder | What lives there |
|---|---|
| `src/app` | Routes and Next special files only: `(en)/`, `(es)/es/`, sitemap, robots, icons, `llms.txt`. |
| `src/site` | The page sections (`Hero`, `Projects`, `Contact`, `LangSwitch`), metadata, JSON-LD, OG image. |
| `src/content` | All text: `en.ts` (its shape is the `Content` type), `es.ts` (typed against it), `site.ts` (links, repos, stack). |
| `src/models` | Pure, seeded models of what each project does, with `node --test` tests. No React. |
| `src/figures/engine` | The shared motion engine: `Director`, camera, DOM writes, `Rig` base class, `FigureShell`, steps UI. |
| `src/figures/parts` | Machine parts every figure shares (`benchOf`/`Bench`, `boxOf`). |
| `src/figures/<project>` | One figure: `view.ts` (sizes), `geometry.ts` (paths), `rig.ts` (choreography), `Figure.tsx`. |
| `src/iso` | The vendored /anatomy kit. Never edit it; re-copy from the skill and note the version. |
| `scripts/` | Repo tooling: bootstrap, ports, checks, commit and delivery rules, agent hooks. |
| `openspec/` | Specs (`specs/`) and changes (`changes/`). |

Each folder has its own short `AGENTS.md` with local rules.

## Architecture rules (checked by `pnpm check`)

- `models` import nothing from React, Next or the rest of `src/`.
- `iso` imports nothing outside itself.
- `figures` never import `site` or `app`.
- `site` imports a figure only through its `Figure.tsx`.
- `app` imports only `site` and `content` (and stylesheets).
- No `utils`, `helpers` or `misc` files: name a module for what it does.
- Text never lives in components: add it to `en.ts` and `es.ts`.

## Writing code here

- Keep it simple: no state libraries, services, barrels or one-implementation abstractions. The only
  shared abstractions are `Rig` and `FigureShell`, because three figures use them.
- No dead code: Knip fails on unused exports and files.
- Comments say why, not what. Mark deliberate shortcuts with `ponytail:` and name their limit.
- Figures write the DOM from the frame loop, never through React state; keep it that way.
- Accessibility and speed are requirements: Lighthouse 100 in all four categories, mobile and
  desktop. Check visual changes on desktop and at 390 px, with reduced motion and without JS (the
  `verify-ui` skill).
- To add or change a figure, load the `add-figure` skill.

## Changes and delivery

- Spec first for features and anything touching several files: an OpenSpec change
  (`openspec/changes/<name>`), validated with `openspec validate --strict`, then implemented and
  archived. Typos and small fixes can go straight in.
- Commits follow Conventional Commits (`type(scope): subject`); the `commit-msg` hook enforces it.
- One PR to `main`: `corepack pnpm delivery:pr-create "type(scope): subject" body.md`. It checks the
  title, the `Summary` / `Intent` / `Verification` body and that the branch is on a fresh
  `origin/main`. Stacked PRs: `git-spice` (`git-spice bc`, `git-spice ss --fill`). GitHub: `gh`.
- Mark a task done only after its check has run and passed. Report failures as they are.

## Never

- No AI attribution anywhere: no `Co-Authored-By` for assistants, no "Generated with" footers.
- No secrets in the repo; `.env*` and client `*.local.*` files stay local.
- No edits to `src/iso`, no force pushes to `main`, no `--no-verify`.

## Agent clients

Instructions live here; `CLAUDE.md` imports this file and `.gemini/settings.json` points Gemini
at it. Skills live in `.agents/skills/` (Claude Code reads adapters in `.claude/skills/`). One hook
script, `scripts/agent-hooks.ts`, serves every client: it adds the branch, port and active
OpenSpec changes at session start, blocks edits to `src/iso`, secrets, force pushes to `main` and
attributed commits, and at the end asks for `pnpm check` if the tree changed since the last green
run. Codex and Claude Code ask you to trust project hooks the first time; review
`.codex/hooks.json` and `.claude/settings.json` before you do. The repo needs no MCP server; Exa and
Context7 are useful personal ones for research and up-to-date library docs.
