#!/bin/sh
# Prepares this checkout or worktree: pinned Node, dependencies, Git hooks, and its own port.
# POSIX sh on purpose: Orca, CI and any shell run it the same way.
set -eu
cd "$(CDPATH= cd -- "$(dirname -- "$0")/.." && pwd)"

want=$(cut -d. -f1 .node-version)
command -v node >/dev/null 2>&1 || {
  echo "Install Node $want (fnm install $want), then retry: sh scripts/bootstrap.sh" >&2
  exit 1
}
have=$(node -p 'process.versions.node.split(".")[0]')
if [ "$have" != "$want" ]; then
  echo "Node $have is active but .node-version pins $want. Run \`fnm use\` (or \`nvm use $want\`) and retry." >&2
  exit 1
fi
command -v corepack >/dev/null 2>&1 || {
  echo 'Install Corepack for the pinned pnpm (npm i -g corepack), then retry.' >&2
  exit 1
}

hooks=$(git config --get core.hooksPath || true)
if [ -n "$hooks" ] && [ "$hooks" != .githooks ]; then
  echo "core.hooksPath is already $hooks. Call .githooks/commit-msg and .githooks/pre-push from those hooks, or unset it, then retry." >&2
  exit 1
fi

# ponytail: pnpm reuses its download store; each checkout owns its node_modules.
corepack pnpm install --frozen-lockfile
git config --local core.hooksPath .githooks

printf '\nReady. corepack pnpm dev serves this checkout at http://localhost:%s\n' "$(node scripts/port.ts)"
