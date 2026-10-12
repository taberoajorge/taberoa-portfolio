import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { mkdtempSync, readFileSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { test } from 'node:test';
import { certify, repository, runHook } from './agent-hooks.ts';

const denied = (out: Record<string, unknown>) => JSON.stringify(out).includes('"deny"');

// One payload per client for the same intent: edit a file of the vendored kit.
const ISO = `${repository}/src/iso/iso-kit.ts`;
const isoEdits = [
  ['claude', { hook_event_name: 'PreToolUse', tool_name: 'Edit', tool_input: { file_path: ISO } }],
  [
    'codex',
    {
      hook_event_name: 'PreToolUse',
      tool_name: 'apply_patch',
      tool_input: {
        command: '*** Begin Patch\n*** Update File: src/iso/iso-kit.ts\n@@\n-a\n+b\n*** End Patch',
      },
    },
  ],
  [
    'gemini',
    {
      hook_event_name: 'BeforeTool',
      tool_name: 'write_file',
      tool_input: { file_path: ISO, content: 'x' },
    },
  ],
  [
    'antigravity',
    { toolCall: { name: 'write_to_file', args: { TargetFile: ISO, CodeContent: 'x' } } },
    'PreToolUse',
  ],
  ['opencode', { tool: 'edit', tool_input: { filePath: ISO } }, 'tool.execute.before'],
] as const;

for (const [client, payload, name] of isoEdits)
  test(`${client}: editing src/iso is blocked`, () => {
    assert.ok(denied(runHook(client, payload, name)));
  });

test('editing the site itself is allowed', () => {
  const out = runHook('claude', {
    hook_event_name: 'PreToolUse',
    tool_name: 'Edit',
    tool_input: { file_path: `${repository}/src/site/Hero.tsx` },
  });
  assert.deepEqual(out, {});
});

const bash = (command: string) =>
  runHook('claude', { hook_event_name: 'PreToolUse', tool_name: 'Bash', tool_input: { command } });

test('shell writes into src/iso are blocked; reading it is not', () => {
  assert.ok(denied(bash("sed -i '' 's/a/b/' src/iso/iso.css")));
  assert.ok(denied(bash('rm -rf src/iso')));
  assert.ok(denied(bash('cp /tmp/kit.css src/iso/iso.css')));
  assert.ok(denied(bash('echo x > src/iso/iso.css')));
  assert.ok(!denied(bash('grep -n Plate src/iso/react/draw.tsx')));
  assert.ok(!denied(bash('cp src/iso/iso.css /tmp/kit.css')));
});

test('force-pushing main is blocked; a normal push and a branch force push are not', () => {
  assert.ok(denied(bash('git push --force origin main')));
  assert.ok(denied(bash('git fetch && git push -f origin main')));
  assert.ok(denied(bash('git push -uf origin main')));
  assert.ok(denied(bash('git push origin +main')));
  assert.ok(denied(bash('git push -f origin HEAD:refs/heads/main')));
  assert.ok(!denied(bash('git push origin main')));
  assert.ok(!denied(bash('git push --force-with-lease origin fix/camera')));
  assert.ok(!denied(bash('git push -f origin feat/main')));
  assert.ok(!denied(bash('echo "never run git push --force origin main"')));
});

test('commits with AI attribution and skipped hooks are blocked', () => {
  assert.ok(
    denied(bash('git commit -m "feat: x\n\nCo-Authored-By: Claude <noreply@anthropic.com>"')),
  );
  assert.ok(denied(bash('git commit --no-verify -m "feat: x"')));
  assert.ok(denied(bash('git commit -n -m "feat: x"')));
  assert.ok(denied(bash('git commit -anm "feat: x"')));
  assert.ok(denied(bash('git -c core.hooksPath=/dev/null commit -m "feat: x"')));
  assert.ok(!denied(bash('git commit -m "feat(site): serve llms.txt"')));
  assert.ok(!denied(bash('git commit --amend -m "feat(site): serve llms.txt"')));
});

const token = `ghp_${'a'.repeat(36)}`;
const write = (file_path: string) =>
  runHook('gemini', {
    hook_event_name: 'BeforeTool',
    tool_name: 'write_file',
    tool_input: { file_path, content: `TOKEN=${token}` },
  });

test('writing a credential into a tracked file is blocked; into an ignored env file it is not', () => {
  assert.ok(denied(write('notes.md')));
  assert.deepEqual(write('.env.local'), {});
});

test('session start adds branch, port and active changes for each client', () => {
  const claude = JSON.stringify(runHook('claude', { hook_event_name: 'SessionStart' }));
  assert.match(claude, /additionalContext.*branch .* active OpenSpec changes/);
  assert.match(
    JSON.stringify(runHook('gemini', { hook_event_name: 'SessionStart' })),
    /additionalContext/,
  );
  const first = runHook('antigravity', { invocationNum: 0 }, 'PreInvocation') as {
    injectSteps: unknown[];
  };
  assert.equal(first.injectSteps.length, 1);
  assert.deepEqual(runHook('antigravity', { invocationNum: 3 }, 'PreInvocation'), {
    injectSteps: [],
  });
});

test('stop asks for pnpm check until the current tree is certified', () => {
  const root = mkdtempSync(join(tmpdir(), 'agent-hooks-'));
  const git = (...args: string[]) => execFileSync('git', args, { cwd: root });
  git('init', '-q');
  git('-c', 'user.name=t', '-c', 'user.email=t@t', 'commit', '-q', '--allow-empty', '-m', 'init');
  const stop = (client: 'claude' | 'codex' | 'gemini' | 'antigravity', extra = {}) =>
    runHook(
      client,
      { hook_event_name: client === 'gemini' ? 'AfterAgent' : 'Stop', ...extra },
      undefined,
      root,
    );

  assert.deepEqual(stop('claude'), {}, 'a clean tree needs nothing');
  writeFileSync(join(root, 'a.ts'), 'export const a = 1;\n');
  assert.equal((stop('claude') as { decision: string }).decision, 'block');
  assert.equal((stop('codex') as { decision: string }).decision, 'block');
  assert.equal((stop('gemini') as { decision: string }).decision, 'deny');
  assert.equal(
    (runHook('antigravity', {}, 'Stop', root) as { decision: string }).decision,
    'continue',
  );
  assert.deepEqual(stop('claude', { stop_hook_active: true }), {}, 'never loops');

  certify(root);
  assert.deepEqual(stop('claude'), {}, 'certified tree');
  writeFileSync(join(root, 'a.ts'), 'export const a = 2;\n');
  assert.equal((stop('claude') as { decision: string }).decision, 'block', 'changed after check');
});

// Every command the client configs declare, run for real through the shell with a sample payload.
test('each client config runs the script and gets a usable answer', () => {
  const read = (path: string) => JSON.parse(readFileSync(join(repository, path), 'utf8'));
  const commands = (hooks: Record<string, unknown[]>) =>
    Object.entries(hooks).flatMap(([event, entries]) =>
      (entries as { command?: string; hooks?: { command: string }[] }[]).flatMap((e) =>
        e.hooks ? e.hooks.map((h) => [event, h.command]) : [[event, e.command as string]],
      ),
    );
  const configs = [
    ...commands(read('.claude/settings.json').hooks),
    ...commands(read('.codex/hooks.json').hooks),
    ...commands(read('.gemini/settings.json').hooks),
    ...commands(read('.agents/hooks.json')['taberoa-portfolio']),
  ];
  assert.ok(configs.length >= 12);
  for (const [event, command] of configs) {
    const pre = /PreToolUse|BeforeTool/.test(event);
    const payload = pre
      ? {
          hook_event_name: event,
          tool_name: 'Edit',
          tool_input: { file_path: 'src/iso/iso.css' },
          toolCall: { name: 'write_to_file', args: { TargetFile: 'src/iso/iso.css' } },
        }
      : { hook_event_name: event, stop_hook_active: true, invocationNum: 0 };
    const out = execFileSync('sh', ['-c', command], {
      cwd: repository,
      input: JSON.stringify(payload),
      env: { ...process.env, CLAUDE_PROJECT_DIR: repository },
    }).toString();
    const answer = JSON.parse(out);
    if (pre) assert.ok(denied(answer), `${command} should deny`);
  }
});
