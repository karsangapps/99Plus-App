import { NextResponse } from 'next/server'
import { getUidFromCookies } from '@/lib/session'
import { getInsforgeAdminClient } from '@/lib/insforgeAdmin'

/**
 * Admin-only: seed cutoff_benchmarks with DU and BHU data.
 * POST /api/admin/seed-cutoffs
 */
export async function POST() {
  try {
    const uid = await getUidFromCookies()
    if (!uid) {
      return NextResponse.json({ ok: false, error: 'Not signed in.' }, { status: 401 })
    }
    // TODO: Add role check for superadmin

    const db = getInsforgeAdminClient()

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
    const bhuId = uniByCode.get('BHU')
    if (!duId) {
      return NextResponse.json({ ok: false, error: 'DU university not found.' }, { status: 400 })
    }

    const rows: Record<string, unknown>[] = []
    const duCols = colsByUni.get(duId) ?? []
    for (const col of duCols) {
      const colProgs = progsByCol.get(col.id) ?? []
      for (const prog of colProgs) {
        if (col.short_code?.toLowerCase().includes('srcc') && prog.name?.toLowerCase().includes('com')) {
          rows.push({ university_id: duId, college_id: col.id, program_id: prog.id, category: 'General', round_label: 'Round 1', exam_year: 2024, cutoff_score: 782, cutoff_percentile: 99.5 })
          rows.push({ university_id: duId, college_id: col.id, program_id: prog.id, category: 'General', round_label: 'Round 2', exam_year: 2024, cutoff_score: 775, cutoff_percentile: 99.2 })
        }
        if ((col.short_code?.toLowerCase().includes('lsr') || col.name?.toLowerCase().includes('lady')) && prog.name?.toLowerCase().includes('pol')) {
          rows.push({ university_id: duId, college_id: col.id, program_id: prog.id, category: 'General', round_label: 'Round 1', exam_year: 2024, cutoff_score: 745, cutoff_percentile: 97.8 })
        }
        if (col.short_code?.toLowerCase().includes('hansraj') || col.name?.toLowerCase().includes('Hansraj')) {
          rows.push({ university_id: duId, college_id: col.id, program_id: prog.id, category: 'General', round_label: 'Round 1', exam_year: 2024, cutoff_score: 765, cutoff_percentile: 98.9 })
        }
        if (col.short_code?.toLowerCase().includes('hindu') || col.name?.toLowerCase().includes('Hindu')) {
          rows.push({ university_id: duId, college_id: col.id, program_id: prog.id, category: 'General', round_label: 'Round 1', exam_year: 2024, cutoff_score: 760, cutoff_percentile: 98.5 })
        }
      }
    }
    if (bhuId) {
      const bhuCols = colsByUni.get(bhuId) ?? []
      for (const col of bhuCols) {
        const colProgs = progsByCol.get(col.id) ?? []
        for (const prog of colProgs) {
          rows.push({ university_id: bhuId, college_id: col.id, program_id: prog.id, category: 'General', round_label: 'Round 1', exam_year: 2024, cutoff_score: 680, cutoff_percentile: 92 })
        }
      }
    }

    if (rows.length === 0) {
      return NextResponse.json({ ok: false, error: 'No cutoff rows to insert. Add DU/BHU colleges and programs.' }, { status: 400 })
    }

    const res = await db.database.from('cutoff_benchmarks').insert(rows)
    if (res.error) {
      return NextResponse.json(
        { ok: false, error: res.error.message, hint: 'Schema cache may need reload. Run: NOTIFY pgrst, \'reload schema\' in DB.' },
        { status: 500 }
      )
    }
    return NextResponse.json({ ok: true, seeded: rows.length })
  } catch (e) {
    const msg = e instanceof Error ? e.message : 'Unknown error'
    return NextResponse.json({ ok: false, error: msg }, { status: 500 })
  }
}
