# Worktrees

Every checkout of this repo (the main one or a `git worktree`) prepares itself with one command and
serves on its own port, so several can run side by side.

## Preparing a checkout

**With Orca.** `orca.yaml` runs `sh scripts/bootstrap.sh` when Orca creates a worktree, and agents
start only after it finishes (`setupAgentStartupPolicy: wait-for-setup`). A `dev` tab is opened with
`corepack pnpm dev`.

If Orca already had this repo registered before `orca.yaml` existed, it may have saved its own
setup command (for example `pnpm install`) in the repo's settings, and that local command wins over
the file. Clear the setup script in Orca's repository settings so `orca.yaml` applies.

**Without Orca.**

```sh
git worktree add ../taberoa-portfolio-fix -b fix/something origin/main
cd ../taberoa-portfolio-fix
sh scripts/bootstrap.sh
```

The bootstrap:

1. checks that the active Node major matches `.node-version` (switch with `fnm use`) and that
   Corepack is installed;
2. installs dependencies with the frozen lockfile;
3. points `core.hooksPath` at the versioned `.githooks/` (it stops if another hooks path is set);
4. prints this checkout's URL.

It never copies credentials, starts servers or touches other checkouts.

## Ports

`pnpm dev` and `pnpm start` run `scripts/run.ts`, which asks `scripts/port.ts` for the port:

- the main checkout always uses **3302**;
- a worktree uses `3300 + (sha256 of its real path) mod 100`, so it gets the same port every time;
- if another registered worktree would get the same port, the command fails and names it. Move one
  of them (`git worktree move`) and the hash changes.

`node scripts/port.ts` prints the port without starting anything.

## What is shared and what is not

| Shared between checkouts | Per checkout |
|---|---|
| Git objects and config | `node_modules` (pnpm links it from its store) |
| pnpm's download store | `.next/` build output |
| Versioned skills, hooks and agent config | `.git/agent-hooks/` state of the agent hooks (in the worktree's own git dir) |
| | Local client settings (`*.local.json`, `CLAUDE.local.md`), which are gitignored |
