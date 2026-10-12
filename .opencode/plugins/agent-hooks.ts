// OpenCode runs the same guards as every other client (see scripts/agent-hooks.ts).
// ponytail: OpenCode V1 plugin API; the stop check is advisory here (a log line), since V1 has
// no verified way to make the agent continue after session.idle.
import { handle, normalize, repository } from '../../scripts/agent-hooks.ts';

type Input = { tool?: string; sessionID?: string };
type Output = { args?: Record<string, unknown> };
type Client = { app: { log: (entry: { body: Record<string, string> }) => Promise<unknown> } };

/** @public OpenCode loads every export of a plugin file. */
export const AgentHooks = async ({ client }: { client: Client }) => ({
  'tool.execute.before': async (input: Input, output: Output) => {
    const event = normalize(
      'opencode',
      { tool: input.tool, tool_input: output.args },
      'tool.execute.before',
    );
    const result = handle(repository, event);
    if (result.action === 'deny') throw new Error(result.reason);
  },
  event: async ({ event }: { event: { type: string } }) => {
    if (event.type !== 'session.created' && event.type !== 'session.idle') return;
    const result = handle(repository, normalize('opencode', {}, event.type));
    if (result.reason)
      await client.app.log({
        body: { service: 'agent-hooks', level: 'info', message: result.reason },
      });
  },
});
