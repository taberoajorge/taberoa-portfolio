// Conventional Commits, and no AI attribution. Used by .githooks/commit-msg, CI and delivery.ts.
import { readFileSync } from 'node:fs';

const TYPES = 'feat|fix|docs|style|refactor|perf|test|build|ci|chore|revert';
export const TITLE = new RegExp(`^(${TYPES})(\\([a-z0-9-]+\\))?!?: \\S.{0,99}$`);
// Git's own subjects for reverts, fixups and merges are fine as they are.
const GIT_MADE =
  /^(Revert ".+"|(fixup|squash|amend)! .+|Merge (branch|pull request|remote-tracking branch) .+)$/;
const ATTRIBUTION = [
  /^co-authored-by:.*\b(claude|anthropic|openai|chatgpt|gpt|codex|copilot|cursor|gemini|devin|windsurf|aider)\b/im,
  /\bgenerated (with|by)\b.*\b(ai|claude|codex|copilot|cursor|gemini|chatgpt|gpt)\b/i,
  /\b(written|authored|created) (with|by) (claude|codex|copilot|cursor|gemini|chatgpt|an ai)\b/i,
  /🤖/u,
];

export function problems(message: string): string[] {
  const text = message
    .split('\n')
    .filter((line) => !line.startsWith('#'))
    .join('\n')
    .trim();
  const title = text.split('\n')[0] ?? '';
  const found: string[] = [];
  if (!TITLE.test(title) && !GIT_MADE.test(title))
    found.push(
      `"${title}" is not a Conventional Commit. Use type(scope): subject, with type one of ${TYPES.replaceAll('|', ', ')}; e.g. "fix(figures): keep the camera on the gantry".`,
    );
  for (const line of text.split('\n'))
    if (ATTRIBUTION.some((pattern) => pattern.test(line)))
      found.push(`Remove the AI attribution "${line.trim()}"; commits name people only.`);
  return found;
}

if (import.meta.main) {
  const found = problems(readFileSync(process.argv[2], 'utf8'));
  for (const line of found) process.stderr.write(`${line}\n`);
  if (found.length) process.exitCode = 1;
}
