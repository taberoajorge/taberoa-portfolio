// `pnpm dev` and `pnpm start`: Next on this checkout's own port.
import { spawn } from 'node:child_process';
import { port } from './port.ts';

const [mode] = process.argv.slice(2);
if (mode !== 'dev' && mode !== 'start') throw new Error('Use: node scripts/run.ts dev|start');
const p = port();
process.stdout.write(`http://localhost:${p}\n`);
const args =
  mode === 'dev' ? ['dev', '--turbo', '--port', String(p)] : ['start', '--port', String(p)];
spawn('next', args, { stdio: 'inherit' }).on('exit', (code) => process.exit(code ?? 1));
