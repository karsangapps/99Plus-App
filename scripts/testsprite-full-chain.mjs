/**
 * TestSprite correct tool chain:
 * testsprite_generate_standardized_prd → testsprite_generate_frontend_test_plan → execute
 */
import { spawn } from 'child_process';
import { readFileSync, writeFileSync, mkdirSync, existsSync, readdirSync } from 'fs';
import { createInterface } from 'readline';
import { execSync } from 'child_process';

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
  const t = d.toString().replace(/\x1B\[[0-9;]*m/g, '').trim();
  if (t && !t.includes('ExperimentalWarning') && !t.includes('DEP00')) process.stdout.write('[err] ' + t + '\n');
});

function rpc(method, params = {}) {
  return new Promise((resolve, reject) => {
    const id = msgId++;
    pending.set(id, r => r.error ? reject(new Error(JSON.stringify(r.error))) : resolve(r.result));
    server.stdin.write(JSON.stringify({ jsonrpc: '2.0', id, method, params }) + '\n');
    setTimeout(() => { if (pending.has(id)) { pending.delete(id); reject(new Error('Timeout: ' + method)); } }, 900_000);
  });
}

function callTool(name, args) {
  console.log(`  ⟶ ${name}`);
  return rpc('tools/call', { name, arguments: args });
}

function getText(res) {
  if (!res) return '';
  if (res.content) return res.content.map(c => c.text || '').join('\n');
  return JSON.stringify(res, null, 2);
}

function save(file, content) {
  mkdirSync('/workspace/testsprite_tests', { recursive: true });
  writeFileSync('/workspace/testsprite_tests/' + file, content);
}

async function main() {
  console.log('\n╔══════════════════════════════════════════════════════════╗');
  console.log('║   99Plus — TestSprite Full Audit Pipeline               ║');
  console.log('╚══════════════════════════════════════════════════════════╝\n');

  // Init MCP
  const init = await rpc('initialize', {
    protocolVersion: '2024-11-05',
    capabilities: { tools: {} },
    clientInfo: { name: '99plus', version: '1.0.0' },
  });
  server.stdin.write(JSON.stringify({ jsonrpc: '2.0', method: 'notifications/initialized' }) + '\n');
  console.log(`✓ MCP v${init?.serverInfo?.version}\n`);

  // ── STEP 1: Generate standardized PRD ──────────────────────────────────
  console.log('▶ Step 1 — Generating standardized PRD from codebase…');
  const prdRes = await callTool('testsprite_generate_standardized_prd', {
    projectPath: '/workspace',
  });
  const prdText = getText(prdRes);
  save('prd_output.md', prdText);
  console.log('  Result preview:', prdText.substring(0, 200));
  
  // Check if standard_prd.json was created
  const prdJsonPath = '/workspace/testsprite_tests/standard_prd.json';
  if (existsSync(prdJsonPath)) {
    console.log('  ✓ standard_prd.json created');
    const prdJson = JSON.parse(readFileSync(prdJsonPath, 'utf8'));
    console.log('  PRD keys:', Object.keys(prdJson).join(', '));
  } else {
    console.log('  ⚠ standard_prd.json not found — check output above');
    // The PRD data might be returned inline — try to parse it
    try {
      const parsed = JSON.parse(prdText);
      if (parsed && typeof parsed === 'object') {
        writeFileSync(prdJsonPath, JSON.stringify(parsed, null, 2));
        console.log('  ✓ Created standard_prd.json from inline response');
      }
    } catch {
      // Save a minimal PRD structure to allow test plan generation
      const minimalPrd = {
        projectName: '99Plus',
        description: 'CUET exam prep app with NTA mock engine',
        features: [
          {
            id: 'nta-test',
            name: 'NTA Mock Test Interface',
            url: '/nta-test/[attemptId]',
            description: 'Pixel-faithful TCS iON exam interface with timer, palette, autosave',
            flows: [
              'Instructions modal → Start test',
              'Language toggle EN/HI',
              'Answer selection → Save & Next',
              'Mark for Review → purple palette',
              'Clear Response → deselect answer',
              'Palette navigation',
              'Timer countdown',
              'Submit → score computation',
              'Autosave POST to /api/mock-attempts/[id]/response',
            ]
          }
        ]
      };
      mkdirSync('/workspace/testsprite_tests', { recursive: true });
      writeFileSync(prdJsonPath, JSON.stringify(minimalPrd, null, 2));
      console.log('  ✓ Created minimal standard_prd.json as fallback');
    }
  }

  // ── STEP 2: Generate frontend test plan ────────────────────────────────
  console.log('\n▶ Step 2 — Generating frontend test plan…');
  const planRes = await callTool('testsprite_generate_frontend_test_plan', {
    projectPath: '/workspace',
    needLogin: false,
  });
  const planText = getText(planRes);
  save('test_plan_output.md', planText);
  console.log('  Result preview:', planText.substring(0, 300));

  const testPlanPath = '/workspace/testsprite_tests/testsprite_frontend_test_plan.json';
  if (existsSync(testPlanPath)) {
    console.log('  ✓ testsprite_frontend_test_plan.json created');
    const plan = JSON.parse(readFileSync(testPlanPath, 'utf8'));
    const testCount = Array.isArray(plan) ? plan.length : (plan.tests?.length ?? 'unknown');
    console.log(`  Test cases: ${testCount}`);
  } else {
    console.log('  ⚠ test plan JSON not found');
  }

  // ── STEP 3: Execute tests ──────────────────────────────────────────────
  console.log('\n▶ Step 3 — Executing autonomous tests…');
  console.log('  Server: http://localhost:3000 (production)');
  console.log('  This will take 5-20 minutes. Please wait…\n');

  const EXECUTE_CMD = `API_KEY=${TS_KEY} node /home/ubuntu/.nvm/versions/node/v22.22.1/lib/node_modules/@testsprite/testsprite-mcp/dist/index.js generateCodeAndExecute`;
  
  let execOutput = '';
  let execError = false;
  try {
    execOutput = execSync(EXECUTE_CMD, {
      cwd: '/workspace',
      timeout: 1200_000, // 20 min
      encoding: 'utf8',
      env: { ...process.env, API_KEY: TS_KEY },
      maxBuffer: 100 * 1024 * 1024,
    });
  } catch (e) {
    execOutput = (e.stdout || '') + (e.stderr || '');
    execError = true;
    console.log('  ⚠ Execution ended:', e.message.substring(0, 200));
  }

  save('execution_raw.txt', execOutput);

  // ── STEP 4: Read and display report ────────────────────────────────────
  const rawReportPath = '/workspace/testsprite_tests/tmp/raw_report.md';
  const htmlReportPath = '/workspace/testsprite_tests/testsprite-mcp-test-report.html';
  const mdReportPath = '/workspace/testsprite_tests/testsprite-mcp-test-report.md';

  console.log('\n▶ Step 4 — Collecting test report…');
  
  for (const [label, p] of [['Raw report', rawReportPath], ['MD report', mdReportPath], ['HTML report', htmlReportPath]]) {
    if (existsSync(p)) {
      const content = readFileSync(p, 'utf8');
      console.log(`  ✓ ${label} found (${content.length} chars)`);
      if (p.endsWith('.md')) {
        save('AUDIT_REPORT.md', content);
        console.log('\n' + '═'.repeat(60));
        console.log('AUDIT REPORT SUMMARY:');
        console.log('═'.repeat(60));
        console.log(content.substring(0, 3000));
        console.log('═'.repeat(60));
      }
    } else {
      console.log(`  ⚠ ${label} not found at: ${p}`);
    }
  }

  console.log('\n✓ Files in testsprite_tests:');
  readdirSync('/workspace/testsprite_tests').forEach(f => console.log('  ', f));

  server.stdin.end();
  process.exit(0);
}

main().catch(err => {
  console.error('\n✗ Pipeline failed:', err.message);
  server.kill();
  process.exit(1);
});
