/**
 * TestSprite correct full pipeline with right field names
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
    if (clean && !clean.includes('ExperimentalWarning') && !clean.includes('No ES module')) {
      process.stdout.write('[ts] ' + clean + '\n');
    }
  }
});
server.stderr.on('data', d => {
  const t = d.toString().replace(/\x1B\[[0-9;]*m/g, '').trim();
  if (t && !t.includes('ExperimentalWarning') && !t.includes('DEP00'))
    process.stdout.write('[!] ' + t + '\n');
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
  console.log(`\n  ⟶ ${name}(${JSON.stringify(args)})`);
  return rpc('tools/call', { name, arguments: args });
}

function getText(res) {
  if (!res?.content) return JSON.stringify(res) || '';
  return res.content.map(c => c.text || '').join('\n');
}

function save(file, content) {
  mkdirSync('/workspace/testsprite_tests', { recursive: true });
  writeFileSync('/workspace/testsprite_tests/' + file, content);
  console.log(`  ✓ → testsprite_tests/${file}`);
}

async function main() {
  console.log('\n╔══════════════════════════════════════════════════════════╗');
  console.log('║  99Plus — TestSprite Correct Pipeline (v2)              ║');
  console.log('╚══════════════════════════════════════════════════════════╝\n');

  const init = await rpc('initialize', {
    protocolVersion: '2024-11-05',
    capabilities: { tools: {} },
    clientInfo: { name: '99plus-v2', version: '1.0.0' },
  });
  server.stdin.write(JSON.stringify({ jsonrpc: '2.0', method: 'notifications/initialized' }) + '\n');
  console.log(`✓ MCP: ${init?.serverInfo?.name} v${init?.serverInfo?.version}`);

  // ── 1: Code Summary ───────────────────────────────────────────────────
  console.log('\n▶ [1/4] testsprite_generate_code_summary (projectRootPath)…');
  const summaryRes = await callTool('testsprite_generate_code_summary', {
    projectRootPath: '/workspace',
  });
  const summaryText = getText(summaryRes);
  save('code_summary_result.md', summaryText);
  console.log('  Preview:', summaryText.substring(0, 300));

  const codeSummaryYaml = '/workspace/testsprite_tests/tmp/code_summary.yaml';
  if (existsSync(codeSummaryYaml)) {
    console.log('  ✓ code_summary.yaml exists');
  } else {
    console.log('  ⚠ code_summary.yaml not found at', codeSummaryYaml);
  }

  // ── 2: Standardized PRD ────────────────────────────────────────────────
  console.log('\n▶ [2/4] testsprite_generate_standardized_prd…');
  const prdRes = await callTool('testsprite_generate_standardized_prd', {
    projectPath: '/workspace',
  });
  const prdText = getText(prdRes);
  save('prd_result.md', prdText);
  console.log('  Preview:', prdText.substring(0, 300));

  const prdJson = '/workspace/testsprite_tests/standard_prd.json';
  if (existsSync(prdJson)) {
    const prd = JSON.parse(readFileSync(prdJson, 'utf8'));
    console.log('  ✓ standard_prd.json — keys:', Object.keys(prd).join(', '));
  }

  // ── 3: Frontend Test Plan ─────────────────────────────────────────────
  console.log('\n▶ [3/4] testsprite_generate_frontend_test_plan…');
  const planRes = await callTool('testsprite_generate_frontend_test_plan', {
    projectPath: '/workspace',
    needLogin: false,
  });
  const planText = getText(planRes);
  save('test_plan_result.md', planText);
  console.log('  Preview:', planText.substring(0, 400));

  const testPlanJson = '/workspace/testsprite_tests/testsprite_frontend_test_plan.json';
  let testCount = 0;
  if (existsSync(testPlanJson)) {
    const plan = JSON.parse(readFileSync(testPlanJson, 'utf8'));
    testCount = Array.isArray(plan) ? plan.length : (plan.tests?.length ?? 0);
    console.log(`  ✓ testsprite_frontend_test_plan.json — ${testCount} test cases`);
    save('test_plan_preview.json', JSON.stringify(
      Array.isArray(plan) ? plan.slice(0, 3) : plan, null, 2
    ));
  } else {
    console.log('  ⚠ test plan JSON not found');
  }

  // ── 4: Execute ────────────────────────────────────────────────────────
  console.log('\n▶ [4/4] Executing autonomous tests…');
  console.log('  Credits before execution: 150');
  console.log('  App: http://localhost:3000 (production mode)');
  console.log(`  Test cases: ${testCount}`);
  console.log('  Please wait (5-20 min)…\n');

  const EXEC_CMD = `API_KEY=${TS_KEY} node /home/ubuntu/.nvm/versions/node/v22.22.1/lib/node_modules/@testsprite/testsprite-mcp/dist/index.js generateCodeAndExecute`;

  let execOut = '';
  try {
    execOut = execSync(EXEC_CMD, {
      cwd: '/workspace',
      timeout: 1200_000,
      encoding: 'utf8',
      env: { ...process.env, API_KEY: TS_KEY },
      maxBuffer: 100 * 1024 * 1024,
    });
    console.log('  ✓ Execution complete');
  } catch (e) {
    execOut = (e.stdout || '') + (e.stderr || '');
    console.log('  ⚠ Execution ended:', e.message.substring(0, 150));
  }

  save('execution_raw.txt', execOut);
  console.log('  stdout preview:', execOut.replace(/\x1B\[[0-9;]*m/g,'').replace(/[^\x20-\x7E\n]/g,'').substring(0, 400));

  // ── Collect Results ────────────────────────────────────────────────────
  console.log('\n▶ Collecting results…');
  const paths = [
    ['/workspace/testsprite_tests/tmp/raw_report.md', 'RAW_REPORT.md'],
    ['/workspace/testsprite_tests/testsprite-mcp-test-report.md', 'FINAL_REPORT.md'],
    ['/workspace/testsprite_tests/testsprite-mcp-test-report.html', 'report.html'],
    ['/workspace/testsprite_tests/tmp/test_results.json', 'test_results.json'],
  ];

  for (const [src, dest] of paths) {
    if (existsSync(src)) {
      const content = readFileSync(src, 'utf8');
      save(dest, content);
      if (dest.endsWith('.md')) {
        console.log('\n' + '─'.repeat(60));
        console.log(dest + ':');
        console.log('─'.repeat(60));
        console.log(content.substring(0, 4000));
      } else if (dest.endsWith('.json')) {
        try {
          const results = JSON.parse(content);
          console.log(`\n${dest}: ${Array.isArray(results) ? results.length : 1} results`);
          if (Array.isArray(results) && results.length > 0) {
            results.forEach((r, i) => {
              console.log(`  Test ${i+1}: ${r.status || r.result || r.passed ? '✅' : '❌'} — ${r.name || r.testName || JSON.stringify(r).substring(0,80)}`);
            });
          }
        } catch {}
      }
    } else {
      console.log(`  ⚠ Not found: ${src}`);
    }
  }

  server.stdin.end();
  process.exit(0);
}

main().catch(err => {
  console.error('\n✗ Pipeline failed:', err.message);
  server.kill();
  process.exit(1);
});
