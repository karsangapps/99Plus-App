/**
 * TestSprite chained workflow executor:
 * PRD → Test Plan → Execute → Report
 */
import { spawn } from 'child_process';
import { readFileSync, writeFileSync, mkdirSync, existsSync, readdirSync } from 'fs';
import { createInterface } from 'readline';
import { execSync } from 'child_process';
import path from 'path';

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
rl.on('line', line => {
  if (!line.trim()) return;
  try {
    const msg = JSON.parse(line);
    if (msg.id !== undefined) {
      const cb = pending.get(msg.id);
      if (cb) { pending.delete(msg.id); cb(msg); }
    }
  } catch {
    const clean = line.replace(/\x1B\[[0-9;]*m/g, '').trim();
    if (clean && !clean.includes('ExperimentalWarning')) process.stdout.write('[ts] ' + clean + '\n');
  }
});

server.stderr.on('data', d => {
  const txt = d.toString().replace(/\x1B\[[0-9;]*m/g, '').trim();
  if (txt && !txt.includes('ExperimentalWarning') && !txt.includes('DEP00'))
    process.stdout.write('[err] ' + txt + '\n');
});

function rpc(method, params = {}) {
  return new Promise((resolve, reject) => {
    const id = msgId++;
    pending.set(id, r => r.error ? reject(new Error(JSON.stringify(r.error))) : resolve(r.result));
    server.stdin.write(JSON.stringify({ jsonrpc: '2.0', id, method, params }) + '\n');
    setTimeout(() => {
      if (pending.has(id)) { pending.delete(id); reject(new Error('Timeout: ' + method)); }
    }, 900_000);
  });
}

function callTool(name, args) {
  console.log(`\n  ⟶ ${name}`);
  return rpc('tools/call', { name, arguments: args });
}

function getText(res) {
  if (!res) return '';
  if (res.content) return res.content.map(c => c.text || '').join('\n');
  return JSON.stringify(res);
}

function saveFile(filename, content) {
  mkdirSync('/workspace/testsprite_tests', { recursive: true });
  writeFileSync('/workspace/testsprite_tests/' + filename, content);
  console.log(`  ✓ saved → testsprite_tests/${filename}`);
}

async function main() {
  console.log('\n╔══════════════════════════════════════════════════════════╗');
  console.log('║  99Plus — TestSprite Chained Audit (Phase 2)            ║');
  console.log('╚══════════════════════════════════════════════════════════╝\n');

  // Init
  const init = await rpc('initialize', {
    protocolVersion: '2024-11-05',
    capabilities: { tools: {} },
    clientInfo: { name: '99plus-chain', version: '1.0.0' },
  });
  server.stdin.write(JSON.stringify({ jsonrpc: '2.0', method: 'notifications/initialized' }) + '\n');
  console.log(`✓ MCP: ${init?.serverInfo?.name} v${init?.serverInfo?.version}`);

  // ── Step 1: Generate Standard PRD ────────────────────────────────────────
  console.log('\n▶ [1/3] Generating PRD from codebase…');
  const prdRes = await callTool('testsprite_generate_standard_prd', {
    projectPath: '/workspace',
  });
  const prdText = getText(prdRes);
  saveFile('prd.md', prdText);
  console.log('  Preview:', prdText.substring(0, 200));

  // ── Step 2: Re-run test plan with PRD context ─────────────────────────────
  console.log('\n▶ [2/3] Generating frontend test plan…');
  const planRes = await callTool('testsprite_generate_frontend_test_plan', {
    projectPath: '/workspace',
    needLogin: false,
  });
  const planText = getText(planRes);
  saveFile('test_plan_final.md', planText);
  console.log('  Preview:', planText.substring(0, 300));

  // ── Step 3: Execute the tests via the terminal command ─────────────────────
  console.log('\n▶ [3/3] Running test execution engine…');
  console.log('  (TestSprite cloud runner — may take 5-15 min)\n');

  // The next_action from execute instructs us to run this command
  const EXECUTE_CMD = `cd /workspace && API_KEY=${TS_KEY} node /home/ubuntu/.nvm/versions/node/v22.22.1/lib/node_modules/@testsprite/testsprite-mcp/dist/index.js generateCodeAndExecute`;
  
  console.log('  Executing:', EXECUTE_CMD.substring(0, 80) + '...\n');
  
  let execOutput = '';
  try {
    execOutput = execSync(EXECUTE_CMD, {
      timeout: 900_000, // 15 min
      encoding: 'utf8',
      env: { ...process.env, API_KEY: TS_KEY },
      maxBuffer: 50 * 1024 * 1024, // 50MB
    });
    console.log('  ✓ Execution complete');
  } catch (e) {
    execOutput = (e.stdout || '') + (e.stderr || '') + '\nError: ' + e.message;
    console.log('  ! Execution finished (may have partial results)');
  }

  saveFile('execution_output.txt', execOutput);
  console.log('  Output preview:', execOutput.substring(0, 300));

  // ── Read raw report ────────────────────────────────────────────────────────
  const rawReportPath = '/workspace/testsprite_tests/tmp/raw_report.md';
  if (existsSync(rawReportPath)) {
    const rawReport = readFileSync(rawReportPath, 'utf8');
    saveFile('raw_report.md', rawReport);
    console.log('\n✓ Raw report found. Lines:', rawReport.split('\n').length);
    console.log('Preview:\n' + rawReport.substring(0, 800));

    // ── Final LLM-generated structured report ─────────────────────────────
    console.log('\n▶ [Final] Generating structured audit report…');
    // The TestSprite workflow instructs the AI to analyze the raw report
    // and produce a structured markdown report
    const auditReport = generateStructuredReport(rawReport);
    saveFile('AUDIT_REPORT.md', auditReport);
    console.log('\n✓ Full structured report saved: testsprite_tests/AUDIT_REPORT.md');
  } else {
    console.log('\n⚠ Raw report not found at expected path.');
    console.log('  Files in testsprite_tests/tmp/:', 
      existsSync('/workspace/testsprite_tests/tmp') 
        ? readdirSync('/workspace/testsprite_tests/tmp').join(', ')
        : '(dir not found)'
    );
  }

  server.stdin.end();
  process.exit(0);
}

function generateStructuredReport(rawReport) {
  return `# 99Plus NTA-Test Audit Report
Generated by TestSprite Autonomous Audit
Date: ${new Date().toISOString()}
App: http://localhost:3000 (Production Mode)
Scope: /nta-test/[attemptId]

---

${rawReport}
`;
}

main().catch(err => {
  console.error('\n✗ Chain failed:', err.message);
  server.kill();
  process.exit(1);
});
