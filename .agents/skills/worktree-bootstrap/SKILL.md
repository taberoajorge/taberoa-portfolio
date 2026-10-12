---
name: worktree-bootstrap
description: Prepare this portfolio checkout or a new worktree (pinned Node, dependencies, Git hooks, its own dev port), or find out which port a checkout serves on.
---

Run `sh scripts/bootstrap.sh` from the repository root and read its output: it ends with the URL
this checkout serves on. Fix any failure before starting work.

- Orca runs the bootstrap itself when it creates a worktree and starts agents after it finishes.
  Outside Orca, run it after `git worktree add` or after switching to a branch with new
  dependencies.
- It needs the Node major in `.node-version` (`fnm use`) and Corepack; it uses POSIX `sh`, so fish
  or bash are not required.
- It refuses to replace another `core.hooksPath`; integrate `.githooks/` instead.
- `corepack pnpm dev` serves the checkout on its own port (main checkout 3302, worktrees in
  3300–3399); `node scripts/port.ts` prints it. If two worktrees clash, move one.
- Pushes run `pnpm check` and `pnpm build` under the pinned Node: `fnm use` first, or
  `fnm exec --using=$(cat .node-version) git push …`.

Skills, hooks and agent configuration come with Git. Do not copy them from another checkout or
hide changes with local excludes. Each checkout owns its `node_modules`; pnpm shares its store.
Details: `docs/worktrees.md`.
