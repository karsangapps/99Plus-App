/**
 * Verify cutoff_benchmarks contains SRCC, Hindu College, LSR.
 * Run: npx tsx scripts/verify-cutoff-benchmarks.ts
 */

import { createClient } from '@insforge/sdk'
import fs from 'node:fs'
import path from 'node:path'

function getConfig() {
  const p = path.join(process.cwd(), '.insforge', 'project.json')
  const raw = fs.readFileSync(p, 'utf8')
  const j = JSON.parse(raw) as { oss_host?: string; api_key?: string }
  if (!j.oss_host || !j.api_key) throw new Error('Missing oss_host/api_key')
  return { baseUrl: j.oss_host, key: j.api_key }
}

async function main() {
  const { baseUrl, key } = getConfig()
  const db = createClient({ baseUrl, anonKey: key })

  const res = await db.database
    .from('cutoff_benchmarks')
    .select('college_id, cutoff_score, exam_year')
    .limit(100)

  if (res.error) {
    console.error('Query failed:', res.error)
    process.exit(1)
  }

  const rows = (res.data ?? []) as { college_id: string; cutoff_score: number; exam_year: number }[]
  const collegeIds = [...new Set(rows.map((r) => r.college_id).filter(Boolean))]

  if (collegeIds.length === 0) {
    console.log('No cutoff_benchmarks records found.')
    process.exit(1)
  }

  const cols = await db.database.from('colleges').select('id, name').in('id', collegeIds)
  const byId = new Map((cols.data as { id: string; name: string }[] ?? []).map((c) => [c.id, c.name]))
  const names = collegeIds.map((id) => byId.get(id) ?? id)

  console.log('cutoff_benchmarks colleges:', names.join(', '))
  const hasSRCC = names.some((n) => /srcc|shri ram college of commerce/i.test(n ?? ''))
  const hasHindu = names.some((n) => /hindu college/i.test(n ?? ''))
  const hasLSR = names.some((n) => /lsr|lady shri ram/i.test(n ?? ''))

  if (hasSRCC && hasHindu && hasLSR) {
    console.log('✓ SRCC, Hindu College, and LSR records visible.')
  } else {
    console.log(`Partial: SRCC=${hasSRCC} Hindu=${hasHindu} LSR=${hasLSR}`)
  }
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
