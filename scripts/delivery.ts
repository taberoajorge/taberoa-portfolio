// Getting a change into main: a fresh branch, a checked PR, a squash merge once CI is green,
// and the pre-push guard. Stacked PRs go through git-spice instead (see AGENTS.md).
import { execFileSync, spawnSync } from 'node:child_process';
import { readFileSync } from 'node:fs';
import { TITLE, TYPES } from './commit-msg.ts';

const SECTIONS = ['Summary', 'Intent', 'Verification'];

const git = (...args: string[]) => execFileSync('git', args, { encoding: 'utf8' }).trim();
const ok = (cmd: string, ...args: string[]) => spawnSync(cmd, args).status === 0;

// What is wrong with a PR title and body, if anything.
export function prProblems(title: string, body: string): string[] {
  const found: string[] = [];
  if (!TITLE.test(title)) found.push(`Title "${title}" must be a Conventional Commit.`);
  for (const name of SECTIONS) {
    const section = new RegExp(`^##\\s+${name}\\s*$([\\s\\S]*?)(?=^##\\s|(?![\\s\\S]))`, 'm').exec(
      body,
    );
    if (!section) found.push(`Body is missing the "## ${name}" section.`);
    else if (!section[1].replace(/<!--[\s\S]*?-->/g, '').trim())
      found.push(`The "## ${name}" section is empty.`);
  }
  return found;
}

// Pushes to main that are not fast-forwards, read from pre-push's stdin.
export function forcedToMain(stdin: string, isAncestor: (older: string, newer: string) => boolean) {
  return stdin
    .split('\n')
    .map((line) => line.trim().split(/\s+/))
    .filter(([, local, remoteRef, remote]) => remoteRef === 'refs/heads/main' && local && remote)
    .some(
      ([, local, , remote]) =>
        !/^0+$/.test(remote) && (/^0+$/.test(local) || !isAncestor(remote, local)),
    );
}

function fresh() {
  git('fetch', '--quiet', 'origin', 'main');
  if (!ok('git', 'merge-base', '--is-ancestor', 'origin/main', 'HEAD'))
    throw new Error('origin/main has commits this branch lacks. Rebase on origin/main and retry.');
}

function stop(found: string[]) {
  if (!found.length) return;
  throw new Error(found.join('\n'));
}

const COMMANDS: Record<string, (args: string[]) => void> = {
  branch([name]) {
    if (!new RegExp(`^(${TYPES})/[a-z0-9-]+$`).test(name ?? ''))
      throw new Error('Name the branch type/short-name, e.g. fix/camera-jump.');
    git('fetch', '--quiet', 'origin', 'main');
    git('switch', '--create', name, 'origin/main');
    process.stdout.write(`On ${name}, from a fresh origin/main.\n`);
  },
  'pr-check'([title, bodyFile]) {
    if (!title || !bodyFile) throw new Error('Use: delivery pr-check "<title>" <body.md>');
    stop(prProblems(title, readFileSync(bodyFile, 'utf8')));
    process.stdout.write(`PR title and body are fine.\n`);
  },
  'pr-create'([title, bodyFile]) {
    COMMANDS['pr-check']([title, bodyFile]);
    fresh();
    git('push', '--quiet', '--set-upstream', 'origin', 'HEAD');
    execFileSync('gh', ['pr', 'create', '--title', title, '--body-file', bodyFile], {
      stdio: 'inherit',
    });
  },
  merge([pr]) {
    if (!pr) throw new Error('Use: delivery merge <pr-number>');
    execFileSync('gh', ['pr', 'checks', pr, '--required', '--watch', '--fail-fast'], {
      stdio: 'inherit',
    });
    execFileSync('gh', ['pr', 'merge', pr, '--squash', '--delete-branch'], { stdio: 'inherit' });
  },
  'pre-push'() {
    const known = (sha: string) => ok('git', 'cat-file', '-e', `${sha}^{commit}`);
    const ancestor = (a: string, b: string) =>
      known(a) && ok('git', 'merge-base', '--is-ancestor', a, b);
    if (forcedToMain(readFileSync(0, 'utf8'), ancestor))
      throw new Error(
        'This push would rewrite main. Fetch, rebase onto origin/main and push without force.',
      );
  },
};

if (import.meta.main)
  try {
    const [command = '', ...args] = process.argv.slice(2);
    const run = COMMANDS[command];
    if (!run) throw new Error(`Use: delivery ${Object.keys(COMMANDS).join('|')}`);
    run(args);
  } catch (error) {
    process.stderr.write(`${(error as Error).message}\n`);
    process.exitCode = 1;
  }
