const pg = require('pg')
const fs = require('fs')
const path = require('path')

const { Client } = pg
const proj = JSON.parse(fs.readFileSync(path.join(__dirname, '../.insforge/project.json'), 'utf8'))
const apiKey = proj.api_key
const host = new URL(proj.oss_host).hostname

async function tryConnect(opts) {
  const client = new Client({ ...opts, connectionTimeoutMillis: 6000 })
  try {
    await client.connect()
    const res = await client.query('SELECT current_database(), current_user, version()')
    console.log('SUCCESS!', opts.user, '@', opts.port, '->', JSON.stringify(res.rows[0]))
    
    // If success, run a quick test query
    const tables = await client.query("SELECT tablename FROM pg_tables WHERE schemaname='public' LIMIT 5")
    console.log('Tables:', tables.rows.map(r => r.tablename))
    await client.end()
    return client
  } catch (err) {
    console.log('FAIL [' + opts.user + ':' + opts.port + '/' + (opts.ssl ? 'ssl' : 'nossl') + ']:', err.message.substring(0, 120))
    try { await client.end() } catch(e) {}
    return null
  }
}

async function main() {
  const configs = [
    // Port 5432, no SSL  
    { host, port: 5432, user: 'postgres', password: apiKey, database: 'postgres', ssl: false },
    // Port 6543 (pooler), no SSL
    { host, port: 6543, user: 'postgres', password: apiKey, database: 'postgres', ssl: false },
    // Port 5432, SSL rejectUnauthorized false
    { host, port: 5432, user: 'postgres', password: apiKey, database: 'postgres', ssl: { rejectUnauthorized: false } },
    // Port 6543 (pooler), SSL
    { host, port: 6543, user: 'postgres', password: apiKey, database: 'postgres', ssl: { rejectUnauthorized: false } },
    // Try with project ref as part of username (Supabase pattern)
    { host, port: 6543, user: 'postgres.s23f7sag', password: apiKey, database: 'postgres', ssl: { rejectUnauthorized: false } },
  ]
  for (const cfg of configs) {
    const result = await tryConnect(cfg)
    if (result) break
  }
}
main().catch(console.error)
