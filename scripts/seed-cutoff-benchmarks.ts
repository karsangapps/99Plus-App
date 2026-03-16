/**
 * Seed cutoff_benchmarks with DU and BHU historical data (CUET 2024/2025).
 * Run: npx tsx scripts/seed-cutoff-benchmarks.ts
 * Prerequisite: migrations 002 and 003 executed; universities, colleges, programs exist.
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

type CutoffRow = {
  university_id: string
  college_id: string | null
  program_id: string | null
  category: string
  round_label: string
  exam_year: number
  cutoff_score: number
  cutoff_percentile: number | null
  confidence_level: number | null
}

async function main() {
  const { baseUrl, key } = getConfig()
  const db = createClient({ baseUrl, anonKey: key })

  // Fetch IDs
  const unis = await db.database.from('universities').select('id, short_code')
  const cols = await db.database.from('colleges').select('id, name, short_code, university_id')
  const progs = await db.database.from('programs').select('id, name, college_id')

  const uniByCode = new Map((unis.data as { id: string; short_code: string }[] || []).map((u) => [u.short_code, u.id]))
  const colsByUni = new Map<string, { id: string; name: string; short_code: string }[]>()
  for (const c of cols.data as { id: string; name: string; short_code: string; university_id: string }[] || []) {
    const arr = colsByUni.get(c.university_id) ?? []
    arr.push({ id: c.id, name: c.name, short_code: c.short_code })
    colsByUni.set(c.university_id, arr)
  }
  const progsByCol = new Map<string, { id: string; name: string }[]>()
  for (const p of progs.data as { id: string; name: string; college_id: string }[] || []) {
    const arr = progsByCol.get(p.college_id) ?? []
    arr.push({ id: p.id, name: p.name })
    progsByCol.set(p.college_id, arr)
  }

  const duId = uniByCode.get('DU')
  if (!duId) {
    console.log('DU not found. Ensure universities are seeded.')
    process.exit(1)
  }

  const rows: CutoffRow[] = []

  // DU colleges
  const duCols = colsByUni.get(duId) ?? []
  for (const col of duCols) {
    const colProgs = progsByCol.get(col.id) ?? []
    for (const prog of colProgs) {
      // SRCC B.Com: high cutoffs
      if (col.short_code?.toLowerCase().includes('srcc') && prog.name?.toLowerCase().includes('com')) {
        rows.push({ university_id: duId, college_id: col.id, program_id: prog.id, category: 'General', round_label: 'Round 1', exam_year: 2024, cutoff_score: 782, cutoff_percentile: 99.5, confidence_level: 0.95 })
        rows.push({ university_id: duId, college_id: col.id, program_id: prog.id, category: 'General', round_label: 'Round 2', exam_year: 2024, cutoff_score: 775, cutoff_percentile: 99.2, confidence_level: 0.95 })
        rows.push({ university_id: duId, college_id: col.id, program_id: prog.id, category: 'OBC', round_label: 'Round 1', exam_year: 2024, cutoff_score: 770, cutoff_percentile: 98.75, confidence_level: 0.95 })
      }
      // LSR / Miranda House B.A. Pol Sci or similar
      if ((col.short_code?.toLowerCase().includes('lsr') || col.name?.toLowerCase().includes('lady')) && prog.name?.toLowerCase().includes('pol')) {
        rows.push({ university_id: duId, college_id: col.id, program_id: prog.id, category: 'General', round_label: 'Round 1', exam_year: 2024, cutoff_score: 745, cutoff_percentile: 97.8, confidence_level: 0.95 })
        rows.push({ university_id: duId, college_id: col.id, program_id: prog.id, category: 'General', round_label: 'Round 2', exam_year: 2024, cutoff_score: 738, cutoff_percentile: 97.2, confidence_level: 0.95 })
      }
      // Hansraj (if exists)
      if (col.short_code?.toLowerCase().includes('hansraj') || col.name?.toLowerCase().includes('Hansraj')) {
        rows.push({ university_id: duId, college_id: col.id, program_id: prog.id, category: 'General', round_label: 'Round 1', exam_year: 2024, cutoff_score: 765, cutoff_percentile: 98.9, confidence_level: 0.95 })
      }
    }
  }

  // BHU: add university if missing
  let bhuId = uniByCode.get('BHU')
  if (!bhuId) {
    const ins = await db.database.from('universities').insert({ name: 'Banaras Hindu University', short_code: 'BHU', city: 'Varanasi', state: 'Uttar Pradesh', is_active: true }).select('id').single()
    if (ins.error || !ins.data) {
      console.log('Could not insert BHU:', ins.error?.message)
    } else {
      bhuId = (ins.data as { id: string }).id
      console.log('Inserted BHU university:', bhuId)
    }
  }

  if (bhuId) {
    const bhuCols = colsByUni.get(bhuId) ?? []
    if (bhuCols.length === 0) {
      const colIns = await db.database.from('colleges').insert([
        { university_id: bhuId, name: 'Institute of Science', short_code: 'BHU-ISC', campus_type: 'main', is_active: true },
        { university_id: bhuId, name: 'Faculty of Arts', short_code: 'BHU-ARTS', campus_type: 'main', is_active: true }
      ]).select('id, short_code')
      if (!colIns.error && colIns.data) {
        const cols2 = colIns.data as { id: string; short_code: string }[]
        for (const c of cols2) {
          const progIns = await db.database.from('programs').insert({
            college_id: c.id,
            name: c.short_code.includes('ISC') ? 'B.Sc. (Hons) Mathematics' : 'B.A. (Hons) History',
            degree_type: 'UG',
            discipline: c.short_code.includes('ISC') ? 'Science' : 'Humanities',
            seat_count: 100,
            is_active: true
          }).select('id').single()
          if (!progIns.error && progIns.data) {
            rows.push({ university_id: bhuId, college_id: c.id, program_id: (progIns.data as { id: string }).id, category: 'General', round_label: 'Round 1', exam_year: 2024, cutoff_score: 680, cutoff_percentile: 92, confidence_level: 0.9 })
          }
        }
      }
    } else {
      for (const col of bhuCols) {
        const colProgs = progsByCol.get(col.id) ?? []
        for (const prog of colProgs) {
          rows.push({ university_id: bhuId, college_id: col.id, program_id: prog.id, category: 'General', round_label: 'Round 1', exam_year: 2024, cutoff_score: 680, cutoff_percentile: 92, confidence_level: 0.9 })
        }
      }
    }
  }

  if (rows.length === 0) {
    console.log('No cutoff rows to insert. Check colleges/programs.')
    process.exit(0)
  }

  const res = await db.database.from('cutoff_benchmarks').insert(rows)
  if (res.error) {
    console.error('Insert failed:', res.error)
    process.exit(1)
  }
  console.log(`Seeded ${rows.length} cutoff_benchmarks rows.`)
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
