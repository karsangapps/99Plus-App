/**
 * Migration runner for 99Plus InsForge
 * Uses /api/database/advance/rawsql endpoint
 */
const fs = require('fs')
const path = require('path')

const proj = JSON.parse(
  fs.readFileSync(path.join(__dirname, '../.insforge/project.json'), 'utf8')
)
const BASE_URL = proj.oss_host
const API_KEY = proj.api_key

async function rawsql(query) {
  const res = await fetch(`${BASE_URL}/api/database/advance/rawsql`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      apikey: API_KEY,
      Authorization: `Bearer ${API_KEY}`,
    },
    body: JSON.stringify({ query }),
  })
  const data = await res.json()
  if (!res.ok) {
    throw new Error(`SQL error (${res.status}): ${JSON.stringify(data)}`)
  }
  return data
}

async function runFile(filePath) {
  console.log(`\n▶ Running: ${path.basename(filePath)}`)
  const sql = fs.readFileSync(filePath, 'utf8')

  // Split on double-newline-separated statements for DO blocks and complex SQL
  // We'll use a smarter approach: execute the entire file as one transaction
  try {
    const result = await rawsql(sql)
    console.log(`  ✓ rowCount: ${result.rowCount ?? 'N/A'}`)
    if (result.rows && result.rows.length > 0) {
      console.log(`  rows:`, JSON.stringify(result.rows).substring(0, 200))
    }
  } catch (err) {
    console.error(`  ✗ Error:`, err.message)
    throw err
  }
}

async function main() {
  console.log('🔗 InsForge:', BASE_URL)

  // Verify connection
  const check = await rawsql("SELECT current_database(), current_user, version()")
  console.log('✓ Connected:', check.rows[0])

  const files = process.argv.slice(2)
  if (files.length === 0) {
    console.error('Usage: node run-migration.cjs <file1.sql> [file2.sql] ...')
    process.exit(1)
  }

  for (const file of files) {
    await runFile(path.resolve(file))
  }

  console.log('\n✅ All migrations complete.')
}

main().catch((err) => {
  console.error('\n❌ Migration failed:', err.message)
  process.exit(1)
})
