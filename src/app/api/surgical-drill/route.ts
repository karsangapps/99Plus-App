import { NextResponse } from 'next/server'
import { getUidFromCookies } from '@/lib/session'
import { getStudentProfileId } from '@/lib/studentProfile'
import { getInsforgeAdminClient } from '@/lib/insforgeAdmin'

export type TopLeak = {
  id: string
  lostMarks: number
  leakType: string
  subject: string
  chapterTitle: string
  severityScore: number
  isResolved: boolean
}

export type SurgicalDrillData = {
  topLeak: TopLeak | null
  creditsBalance: number
  drillsCompleted: number
  marksRecovered: number
}

export async function GET() {
  try {
    const uid = await getUidFromCookies()
    if (!uid) {
      return NextResponse.json({ ok: false, error: 'Not signed in.' }, { status: 401 })
    }

    const studentProfileId = await getStudentProfileId(uid)
    if (!studentProfileId) {
      return NextResponse.json({ ok: false, error: 'Student profile not found.' }, { status: 404 })
    }

    const db = getInsforgeAdminClient()
    let topLeak: TopLeak | null = null
    let creditsBalance = 0
    let drillsCompleted = 0
    let marksRecovered = 0

    try {
      const leaksRes = await db.database
        .from('mark_leaks')
        .select(`
          id,
          lost_marks,
          leak_type,
          severity_score,
          is_resolved,
          syllabus_hierarchy ( subject, title )
        `)
        .eq('student_profile_id', studentProfileId)
        .eq('is_resolved', false)
        .order('severity_score', { ascending: false })
        .limit(1)
        .single()

      if (!leaksRes.error && leaksRes.data) {
        const row = leaksRes.data as Record<string, unknown>
        const sh = row.syllabus_hierarchy as { subject?: string; title?: string } | { subject?: string; title?: string }[] | null
        const shObj = Array.isArray(sh) ? sh[0] : sh
        topLeak = {
          id: String(row.id),
          lostMarks: Number(row.lost_marks ?? 0),
          leakType: String(row.leak_type ?? 'conceptual'),
          subject: shObj?.subject ?? 'Unknown',
          chapterTitle: shObj?.title ?? 'Unknown',
          severityScore: Number(row.severity_score ?? 0),
          isResolved: Boolean(row.is_resolved)
        }
      }
    } catch {
      // Table may not exist
    }

    try {
      const creditsRes = await db.database
        .from('surgical_credits')
        .select('balance_after')
        .eq('student_profile_id', studentProfileId)
        .order('created_at', { ascending: false })
        .limit(1)
        .single()
      if (!creditsRes.error && creditsRes.data) {
        creditsBalance = Number((creditsRes.data as { balance_after: number }).balance_after ?? 0)
      }
    } catch {
      // Table may not exist
    }

    try {
      const sessionsRes = await db.database
        .from('practice_sessions')
        .select('id, score_delta_estimate')
        .eq('student_profile_id', studentProfileId)
        .eq('status', 'completed')
      if (!sessionsRes.error && Array.isArray(sessionsRes.data)) {
        drillsCompleted = sessionsRes.data.length
        marksRecovered = Math.round(
          (sessionsRes.data as { score_delta_estimate: number | null }[])
            .reduce((sum, s) => sum + (Number(s.score_delta_estimate) || 0), 0)
        )
      }
    } catch {
      // Table may not exist
    }

    const data: SurgicalDrillData = {
      topLeak,
      creditsBalance,
      drillsCompleted,
      marksRecovered
    }

    return NextResponse.json({ ok: true, data })
  } catch (e) {
    const msg = e instanceof Error ? e.message : 'Unknown error'
    return NextResponse.json({ ok: false, error: msg }, { status: 500 })
  }
}
