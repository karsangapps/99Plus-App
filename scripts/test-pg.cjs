const pg = require('pg')
const fs = require('fs')
const path = require('path')

const { Client } = pg
const proj = JSON.parse(fs.readFileSync(path.join(__dirname, '../.insforge/project.json'), 'utf8'))
const apiKey = proj.api_key
const host = new URL(proj.oss_host).hostname

console.log('Host:', host)

async function tryConnect(creds) {
  const client = new Client({
    host,
    port: 5432,
    ...creds,
    connectionTimeoutMillis: 5000,
    ssl: { rejectUnauthorized: false },
  })
  try {
    await client.connect()
    const res = await client.query('SELECT current_database(), current_user')
    console.log('SUCCESS!', creds.user, '->', JSON.stringify(res.rows[0]))
    await client.end()
    return true
  } catch (err) {
    console.log('FAIL [' + creds.user + ']:', err.message.substring(0, 100))
    try { await client.end() } catch(e) {}
    return false
  }
}

async function main() {
  const attempts = [
    { user: 'postgres', password: apiKey, database: 'postgres' },
    { user: 'authenticator', password: apiKey, database: 'postgres' },
    { user: 'supabase_admin', password: apiKey, database: 'postgres' },
    { user: 'postgres', password: 'postgres', database: 'postgres' },
    { user: 'postgres', password: '', database: 'postgres' },
  ]
  for (const creds of attempts) {
    await tryConnect(creds)
  }
}
main().catch(console.error)
