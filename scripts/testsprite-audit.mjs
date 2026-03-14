/**
 * TestSprite MCP Client — Autonomous NTA-Test Flow Audit
 * Communicates with the TestSprite MCP server via JSON-RPC 2.0 over stdio
 */
import { spawn } from 'child_process';
import { readFileSync } from 'fs';
import { createInterface } from 'readline';

const TS_KEY = readFileSync('/workspace/.env.local', 'utf8')
  .split('\n')
  .find(l => l.startsWith('TESTSPRITE_API_KEY='))
  ?.split('=').slice(1).join('=') ?? '';

if (!TS_KEY) throw new Error('TESTSPRITE_API_KEY not found in .env.local');
console.log('✓ TestSprite key loaded:', TS_KEY.substring(0, 10) + '...');

// ── Start the MCP server ──────────────────────────────────────────────────
const server = spawn(
  'node',
  ['/home/ubuntu/.nvm/versions/node/v22.22.1/lib/node_modules/@testsprite/testsprite-mcp/dist/index.js'],
  {
    env: { ...process.env, API_KEY: TS_KEY },
    stdio: ['pipe', 'pipe', 'pipe'],
  }
);

let msgId = 1;
const pendingCallbacks = new Map();
let buffer = '';

// Parse line-by-line JSON-RPC responses
const rl = createInterface({ input: server.stdout });
rl.on('line', (line) => {
  if (!line.trim()) return;
  try {
    const msg = JSON.parse(line);
    if (msg.id !== undefined) {
      const cb = pendingCallbacks.get(msg.id);
      if (cb) {
        pendingCallbacks.delete(msg.id);
        cb(msg);
      }
    }
  } catch {
    // Non-JSON output (logs etc.)
    process.stdout.write('[MCP log] ' + line + '\n');
  }
});

server.stderr.on('data', (d) => {
  const txt = d.toString().trim();
  if (txt) process.stdout.write('[MCP stderr] ' + txt + '\n');
});

function rpc(method, params = {}) {
  return new Promise((resolve, reject) => {
    const id = msgId++;
    const msg = JSON.stringify({ jsonrpc: '2.0', id, method, params }) + '\n';
    pendingCallbacks.set(id, (response) => {
      if (response.error) reject(new Error(JSON.stringify(response.error)));
      else resolve(response.result);
    });
    server.stdin.write(msg);
    // Timeout after 10 minutes per tool call
    setTimeout(() => {
      if (pendingCallbacks.has(id)) {
        pendingCallbacks.delete(id);
        reject(new Error(`Timeout waiting for response to: ${method}`));
      }
    }, 600_000);
  });
}

function callTool(name, args) {
  return rpc('tools/call', { name, arguments: args });
}

async function main() {
  console.log('\n═══════════════════════════════════════════════════');
  console.log('  TestSprite — Autonomous NTA-Test Flow Audit');
  console.log('═══════════════════════════════════════════════════\n');

  // ── Step 1: Initialize MCP session ─────────────────────────────────────
  console.log('▶ Step 1/5 — Initializing MCP session…');
  await rpc('initialize', {
    protocolVersion: '2024-11-05',
    capabilities: { tools: {} },
    clientInfo: { name: '99plus-audit-client', version: '1.0.0' },
  });
  console.log('  ✓ MCP session established\n');

  // ── Step 2: Bootstrap project ────────────────────────────────────────────
  console.log('▶ Step 2/5 — Bootstrapping TestSprite project config…');
  const bootstrapResult = await callTool('testsprite_bootstrap', {
    localPort: 3000,
    pathname: '/nta-test/a42f598e-3b1e-436c-bf00-136450f839c5',
    type: 'frontend',
    projectPath: '/workspace',
    testScope: 'codebase',
  });
  console.log('  ✓ Bootstrap complete');
  console.log('  Result:', JSON.stringify(bootstrapResult).substring(0, 300), '\n');

  // ── Step 3: Generate code summary ───────────────────────────────────────
  console.log('▶ Step 3/5 — Analyzing codebase…');
  const summaryResult = await callTool('testsprite_generate_code_summary', {
    projectPath: '/workspace',
  });
  console.log('  ✓ Code summary generated');
  console.log('  Result:', JSON.stringify(summaryResult).substring(0, 300), '\n');

  // ── Step 4: Generate frontend test plan ─────────────────────────────────
  console.log('▶ Step 4/5 — Generating frontend test plan for /nta-test…');
  const testPlanResult = await callTool('testsprite_generate_frontend_test_plan', {
    projectPath: '/workspace',
    needLogin: true,
  });
  console.log('  ✓ Test plan generated');
  console.log('  Result:', JSON.stringify(testPlanResult).substring(0, 600), '\n');

  // ── Step 5: Execute tests ────────────────────────────────────────────────
  console.log('▶ Step 5/5 — Executing autonomous audit (this may take 10-20 min)…');
  const execResult = await callTool('testsprite_generate_code_and_execute', {
    projectName: '99plus-app',
    projectPath: '/workspace',
    testIds: [],
    additionalInstruction: [
      'Test the NTA mock exam interface at /nta-test/[attemptId].',
      'Set a cookie: name=uid, value=da159e75-0fad-4a07-a054-dfe0df47b972 before navigating.',
      'The live attempt ID to test is: a42f598e-3b1e-436c-bf00-136450f839c5.',
      'Full test URL: http://localhost:3000/nta-test/a42f598e-3b1e-436c-bf00-136450f839c5',
      'Audit these flows:',
      '1. Instructions modal renders with NTA branding, marking scheme (+5/-1), and palette legend.',
      '2. Language toggle switches between English and Hindi.',
      '3. "I am ready to begin" button starts the test and shows the full TCS-iON layout.',
      '4. Section tabs (English, Mathematics, General Test) are clickable and switch sections.',
      '5. Selecting an answer marks the radio button and highlights the option.',
      '6. "Save & Next" advances to next question and turns the palette button GREEN (answered).',
      '7. "Mark for Review & Next" turns the palette button PURPLE.',
      '8. "Clear Response" deselects the answer and reverts palette state to red.',
      '9. Question palette numbered buttons are clickable and navigate directly to that question.',
      '10. Timer counts down correctly in HH:MM:SS format.',
      '11. Submit button shows confirmation and posts to /api/mock-attempts/[id]/submit.',
      '12. Autosave POSTs to /api/mock-attempts/[id]/response within ~1200ms of answer change.',
    ].join(' '),
    serverMode: 'development',
  });
  console.log('\n═══════════════════════════════════════════════════');
  console.log('  ✓ AUDIT COMPLETE');
  console.log('═══════════════════════════════════════════════════');
  console.log('Result:', JSON.stringify(execResult).substring(0, 1000));

  server.stdin.end();
  process.exit(0);
}

main().catch((err) => {
  console.error('\n✗ Audit error:', err.message);
  server.kill();
  process.exit(1);
});
