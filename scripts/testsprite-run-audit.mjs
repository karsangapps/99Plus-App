/**
 * TestSprite Full Audit — NTA Test Flow
 * Requires: config.json already committed (bootstrap done)
 * Runs: code summary → frontend test plan → generate & execute
 */
import { spawn } from 'child_process';
import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'fs';
import { createInterface } from 'readline';
import path from 'path';

const TS_KEY = readFileSync('/workspace/.env.local', 'utf8')
  .split('\n').find(l => l.startsWith('TESTSPRITE_API_KEY='))
  ?.split('=').slice(1).join('=') ?? '';

if (!TS_KEY) throw new Error('TESTSPRITE_API_KEY not found in .env.local');
console.log('✓ TestSprite key:', TS_KEY.substring(0, 12) + '...[redacted]');

const server = spawn(
  'node',
  ['/home/ubuntu/.nvm/versions/node/v22.22.1/lib/node_modules/@testsprite/testsprite-mcp/dist/index.js'],
  { env: { ...process.env, API_KEY: TS_KEY }, stdio: ['pipe', 'pipe', 'pipe'] }
);

let msgId = 1;
const pending = new Map();

const rl = createInterface({ input: server.stdout });
rl.on('line', line => {
  if (!line.trim()) return;
  try {
    const msg = JSON.parse(line);
    if (msg.id !== undefined) {
      const cb = pending.get(msg.id);
      if (cb) { pending.delete(msg.id); cb(msg); }
    }
  } catch {
    const clean = line.replace(/\x1B\[[0-9;]*m/g, '');
    if (clean.trim()) process.stdout.write('[ts] ' + clean + '\n');
  }
});

server.stderr.on('data', d => {
  const txt = d.toString().replace(/\x1B\[[0-9;]*m/g, '').trim();
  if (txt && !txt.includes('ExperimentalWarning') && !txt.includes('DEP00')) {
    process.stdout.write('[ts-err] ' + txt + '\n');
  }
});

server.on('exit', code => {
  console.log(`\nMCP server exited with code: ${code}`);
});

function rpc(method, params = {}) {
  return new Promise((resolve, reject) => {
    const id = msgId++;
    pending.set(id, r => r.error ? reject(new Error(JSON.stringify(r.error))) : resolve(r.result));
    server.stdin.write(JSON.stringify({ jsonrpc: '2.0', id, method, params }) + '\n');
    setTimeout(() => {
      if (pending.has(id)) { pending.delete(id); reject(new Error('Timeout: ' + method)); }
    }, 900_000); // 15 min timeout per step
  });
}

function callTool(name, args) {
  console.log(`\n  → calling tool: ${name}`);
  return rpc('tools/call', { name, arguments: args });
}

function extractText(result) {
  if (!result) return '(no result)';
  if (result.content) {
    return result.content.map(c => c.text || '').join('\n');
  }
  return JSON.stringify(result).substring(0, 800);
}

async function main() {
  console.log('\n╔══════════════════════════════════════════════════════════╗');
  console.log('║   99Plus — TestSprite Autonomous NTA-Test Audit         ║');
  console.log('╚══════════════════════════════════════════════════════════╝\n');

  // ── Initialize ──────────────────────────────────────────────────────────
  console.log('▶ [1/4] Initializing MCP session…');
  const initRes = await rpc('initialize', {
    protocolVersion: '2024-11-05',
    capabilities: { tools: {} },
    clientInfo: { name: '99plus-audit-v2', version: '1.0.0' },
  });
  server.stdin.write(JSON.stringify({ jsonrpc: '2.0', method: 'notifications/initialized' }) + '\n');
  console.log(`  ✓ MCP: ${initRes?.serverInfo?.name} v${initRes?.serverInfo?.version}`);

  // ── Code Summary ────────────────────────────────────────────────────────
  console.log('\n▶ [2/4] Generating code summary (codebase analysis)…');
  const summaryRes = await callTool('testsprite_generate_code_summary', {
    projectPath: '/workspace',
  });
  const summaryText = extractText(summaryRes);
  console.log('  ✓ Code summary generated');
  console.log('  Preview:', summaryText.substring(0, 300) + '…\n');

  // Save summary
  mkdirSync('/workspace/testsprite_tests', { recursive: true });
  writeFileSync('/workspace/testsprite_tests/code_summary.md', summaryText);

  // ── Frontend Test Plan ──────────────────────────────────────────────────
  console.log('▶ [3/4] Generating NTA-test frontend test plan…');
  const testPlanRes = await callTool('testsprite_generate_frontend_test_plan', {
    projectPath: '/workspace',
    needLogin: false,  // We use cookie auth, not form login
  });
  const testPlanText = extractText(testPlanRes);
  console.log('  ✓ Test plan generated');
  console.log('  Preview:', testPlanText.substring(0, 400) + '…\n');
  writeFileSync('/workspace/testsprite_tests/test_plan.md', testPlanText);

  // ── Generate & Execute ──────────────────────────────────────────────────
  console.log('▶ [4/4] Executing autonomous audit (production server, ~10-20 min)…');
  console.log('  App: http://localhost:3000 (production mode)');
  console.log('  Scope: /nta-test/[attemptId] — all NTA mock engine flows\n');

  const execRes = await callTool('testsprite_generate_code_and_execute', {
    projectName: '99plus-app',
    projectPath: '/workspace',
    testIds: [],
    serverMode: 'production',
    additionalInstruction: [
      'SETUP: Before any test, set a browser cookie: name=uid value=da159e75-0fad-4a07-a054-dfe0df47b972 (httpOnly=false for test purposes).',
      'TEST URL: http://localhost:3000/nta-test/a42f598e-3b1e-436c-bf00-136450f839c5',
      '',
      'AUDIT SCOPE — test every state transition in the NTA mock exam interface:',
      '',
      '1. INSTRUCTIONS SCREEN: Verify NTA logo is visible; test title shows "CUET 2026 — Baseline Mock #1"; marking scheme shows +5 and -1; palette guide shows 5 color states; language toggle shows English/Hindi; "I am ready to begin" button is visible and clickable.',
      '',
      '2. LANGUAGE TOGGLE: After loading instructions, click Hindi button. Verify instructions text changes to Hindi. Click English button and verify it reverts.',
      '',
      '3. TEST START: Click "I am ready to begin". Verify: dark blue header appears with NTA logo; timer is visible and counting down; section tabs show English, General Test, Mathematics; question panel shows Question 1 with passage text; palette sidebar shows numbered buttons; action bar shows Save&Next, Clear, Mark for Review.',
      '',
      '4. ANSWER SELECTION: Click option B on Question 1. Verify radio button is selected; option row highlights with blue border; Clear Response button becomes enabled.',
      '',
      '5. SAVE & NEXT: Click Save & Next. Verify: Question 2 loads; Question 1 button in palette turns GREEN (answered); visit count increments.',
      '',
      '6. MARK FOR REVIEW: On Question 2, click "Mark for Review & Next". Verify: Question 2 palette button turns PURPLE; legend counter "Marked for Review" increments.',
      '',
      '7. PALETTE NAVIGATION: Click palette button number 4 (in Mathematics section). Verify: navigation jumps to that question; current question button turns BLUE; section tab switches to Mathematics.',
      '',
      '8. CLEAR RESPONSE: On Question 4, select an answer, then click Clear Response. Verify: answer is deselected; palette reverts from green to red (not answered).',
      '',
      '9. SECTION TABS: Click the "General Test" tab. Verify section switches and current question updates to first GT question.',
      '',
      '10. TIMER: Verify timer shows HH:MM:SS format, is non-zero, and decrements each second.',
      '',
      '11. AUTOSAVE API: After selecting an answer, within 2 seconds verify a POST request is made to /api/mock-attempts/a42f598e-3b1e-436c-bf00-136450f839c5/response with question_bank_id and selected_answer_json in the body.',
      '',
      '12. SUBMIT FLOW: Click Submit button. Verify: submit button shows loading state; POST /api/mock-attempts/a42f598e-3b1e-436c-bf00-136450f839c5/submit is called; response includes raw_score, simulated_percentile, and simulated_normalized_score.',
    ].join('\n'),
  });

  const execText = extractText(execRes);
  console.log('\n╔══════════════════════════════════════════════════════════╗');
  console.log('║              ✓ AUDIT COMPLETE                           ║');
  console.log('╚══════════════════════════════════════════════════════════╝');
  console.log('\nAudit Result Preview:');
  console.log(execText.substring(0, 1000));

  // Save full report
  writeFileSync('/workspace/testsprite_tests/audit_report.md', execText);
  console.log('\n✓ Full report saved to: /workspace/testsprite_tests/audit_report.md');

  server.stdin.end();
  process.exit(0);
}

main().catch(err => {
  console.error('\n✗ Audit failed:', err.message);
  writeFileSync('/workspace/testsprite_tests/audit_error.log', err.message + '\n' + err.stack);
  server.kill();
  process.exit(1);
});
