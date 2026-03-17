/**
 * Starts the TestSprite MCP server and calls only bootstrap.
 * Keeps running until config.json is committed.
 */
import { spawn } from 'child_process';
import { readFileSync, existsSync, writeFileSync } from 'fs';
import { createInterface } from 'readline';

const TS_KEY = readFileSync('/workspace/.env.local', 'utf8')
  .split('\n').find(l => l.startsWith('TESTSPRITE_API_KEY='))
  ?.split('=').slice(1).join('=') ?? '';

const server = spawn(
  'node',
  ['/home/ubuntu/.nvm/versions/node/v22.22.1/lib/node_modules/@testsprite/testsprite-mcp/dist/index.js'],
  { env: { ...process.env, API_KEY: TS_KEY }, stdio: ['pipe', 'pipe', 'pipe'] }
);

let msgId = 1;
const pending = new Map();

const rl = createInterface({ input: server.stdout });
rl.on('line', (line) => {
  if (!line.trim()) return;
  try {
    const msg = JSON.parse(line);
    if (msg.id !== undefined) {
      const cb = pending.get(msg.id);
      if (cb) { pending.delete(msg.id); cb(msg); }
    }
  } catch {
    process.stdout.write('[ts] ' + line + '\n');
  }
});

server.stderr.on('data', d => {
  const txt = d.toString().trim();
  if (txt && !txt.includes('ExperimentalWarning')) {
    process.stdout.write('[ts-err] ' + txt + '\n');
  }
});

function rpc(method, params = {}) {
  return new Promise((resolve, reject) => {
    const id = msgId++;
    pending.set(id, (r) => r.error ? reject(new Error(JSON.stringify(r.error))) : resolve(r.result));
    server.stdin.write(JSON.stringify({ jsonrpc: '2.0', id, method, params }) + '\n');
    setTimeout(() => {
      if (pending.has(id)) { pending.delete(id); reject(new Error('Timeout: ' + method)); }
    }, 600_000);
  });
}

async function main() {
  console.log('Initializing MCP session...');
  const initResult = await rpc('initialize', {
    protocolVersion: '2024-11-05',
    capabilities: { tools: {} },
    clientInfo: { name: 'audit-client', version: '1.0.0' },
  });
  console.log('MCP initialized:', initResult?.serverInfo?.name, initResult?.serverInfo?.version);

  // Send initialized notification
  server.stdin.write(JSON.stringify({ jsonrpc: '2.0', method: 'notifications/initialized' }) + '\n');

  console.log('\nCalling testsprite_bootstrap...');
  console.log('Bootstrap will open a browser init page. Waiting for config commit...\n');

  const result = await rpc('tools/call', {
    name: 'testsprite_bootstrap',
    arguments: {
      localPort: 3000,
      pathname: 'nta-test/a42f598e-3b1e-436c-bf00-136450f839c5',
      type: 'frontend',
      projectPath: '/workspace',
      testScope: 'codebase',
    },
  });

  console.log('\n✓ Bootstrap complete!');
  console.log('Result:', JSON.stringify(result).substring(0, 500));
  server.stdin.end();
  process.exit(0);
}

main().catch(err => {
  console.error('Error:', err.message);
  server.kill();
  process.exit(1);
});
