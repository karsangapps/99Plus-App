import { NextResponse } from 'next/server'
import { getUidFromCookies } from '@/lib/session'
import { getInsforgeAdminClient } from '@/lib/insforgeAdmin'

export type AdminDashboardData = {
  northStar: {
    currentAsi: number
    deltaThisWeek: number
    cohortSize: number
    targetAsi: number
    trendPoints: { month: string; asi: number }[]
  }
  funnel: {
    signups: number
    baselineCompleted: number
    activeInDrills: number
    projectedSecured: number
    conversionPct: number
  }
  heatmap: {
    subject: string
    chapterTitle: string
    failRatePct: number
    severity: 'safe' | 'at_risk' | 'critical'
  }[]
}

export async function GET() {
  try {
    const uid = await getUidFromCookies()
    if (!uid) {
      return NextResponse.json({ ok: false, error: 'Not signed in.' }, { status: 401 })
    }

    const db = getInsforgeAdminClient()

    // TODO: Add role check - only superadmin/admin
    // const userRes = await db.database.from('users').select('role').eq('id', uid).single()
    // if (userRes.data?.role !== 'superadmin' && userRes.data?.role !== 'admin') return 403

    const northStar = { currentAsi: 0, deltaThisWeek: 0, cohortSize: 0, targetAsi: 16, trendPoints: [] as { month: string; asi: number }[] }
    const funnel = { signups: 0, baselineCompleted: 0, activeInDrills: 0, projectedSecured: 0, conversionPct: 0 }
    const heatmap: AdminDashboardData['heatmap'] = []

    try {
      const profilesRes = await db.database.from('student_profiles').select('id')
      funnel.signups = (profilesRes.data as unknown[] | null)?.length ?? 0
      northStar.cohortSize = funnel.signups

      const submittedRes = await db.database.from('mock_attempts').select('student_profile_id').not('submitted_at', 'is', null)
      const uniqueStudents = new Set((submittedRes.data as { student_profile_id: string }[] ?? []).map((r) => r.student_profile_id))
      funnel.baselineCompleted = uniqueStudents.size

      const drillsRes = await db.database.from('practice_sessions').select('student_profile_id').eq('status', 'completed')
      const drillStudents = new Set((drillsRes.data as { student_profile_id: string }[] ?? []).map((r) => r.student_profile_id))
      funnel.activeInDrills = drillStudents.size

      const securedRes = await db.database.from('college_target_analytics').select('student_profile_id').in('seat_status', ['safe', 'possible'])
      const securedStudents = new Set((securedRes.data as { student_profile_id: string }[] ?? []).map((r) => r.student_profile_id))
      funnel.projectedSecured = securedStudents.size

      funnel.conversionPct = funnel.signups > 0 ? Math.round((funnel.projectedSecured / funnel.signups) * 1000) / 10 : 0

      const attemptsWithScores = await db.database.from('mock_attempts').select('student_profile_id, simulated_percentile, submitted_at').not('submitted_at', 'is', null).order('submitted_at')
      if (attemptsWithScores.data && attemptsWithScores.data.length >= 2) {
        const byStudent = new Map<string, { first: number; last: number }>()
        for (const row of attemptsWithScores.data as { student_profile_id: string; simulated_percentile: number | null; submitted_at: string }[]) {
          const p = row.simulated_percentile ?? 0
          const existing = byStudent.get(row.student_profile_id)
          if (!existing) byStudent.set(row.student_profile_id, { first: p, last: p })
          else {
            existing.last = p
          }
        }
        const improvements = [...byStudent.values()].map((v) => v.last - v.first).filter((x) => !Number.isNaN(x))
        northStar.currentAsi = improvements.length ? Math.round(improvements.reduce((a, b) => a + b, 0) / improvements.length * 10) / 10 : 0
      }
    } catch {
      // Tables may not exist
    }

    try {
      const leaksRes = await db.database
        .from('mark_leaks')
        .select('id, syllabus_node_id, syllabus_hierarchy(subject, title)')
        .eq('is_resolved', false)
      const leakRows = leaksRes.data as { syllabus_node_id: string; syllabus_hierarchy: { subject: string; title: string } | { subject: string; title: string }[] | null }[] ?? []
      const responsesRes = await db.database.from('mock_responses').select('is_correct, question_bank(syllabus_node_id, subject, chapter_name)')
      const responses = (responsesRes.data ?? []) as { is_correct: boolean | null; question_bank?: { syllabus_node_id?: string; subject?: string; chapter_name?: string } | null }[]

      const byNode = new Map<string, { wrong: number; total: number }>()
      for (const r of responses) {
        const qb = r.question_bank as { syllabus_node_id?: string; subject?: string; chapter_name?: string } | null | undefined
        if (!qb) continue
        const key = `${qb.subject ?? 'Unknown'}|${qb.chapter_name ?? 'Unknown'}`
        const ex = byNode.get(key) ?? { wrong: 0, total: 0 }
        ex.total += 1
        if (r.is_correct === false) ex.wrong += 1
        byNode.set(key, ex)
      }
      for (const [key, v] of byNode) {
        if (v.total < 5) continue
        const failRate = Math.round((v.wrong / v.total) * 100)
        const severity = failRate >= 50 ? 'critical' : failRate >= 30 ? 'at_risk' : 'safe'
        const [subject, chapterTitle] = key.split('|')
        heatmap.push({ subject, chapterTitle, failRatePct: failRate, severity })
      }
      heatmap.sort((a, b) => b.failRatePct - a.failRatePct)
    } catch {
      // Fallback: use mark_leaks + syllabus_hierarchy
      try {
        const leaksRes = await db.database
          .from('mark_leaks')
          .select('syllabus_node_id, syllabus_hierarchy(subject, title)')
          .eq('is_resolved', false)
        const rows = (leaksRes.data ?? []) as { syllabus_node_id: string; syllabus_hierarchy?: { subject?: string; title?: string } | { subject?: string; title?: string }[] | null }[]
        const agg = new Map<string, number>()
        for (const r of rows) {
          const shRaw = r.syllabus_hierarchy
          const sh = Array.isArray(shRaw) ? shRaw[0] : shRaw
          const key = `${sh?.subject ?? 'Unknown'}|${sh?.title ?? 'Unknown'}`
          agg.set(key, (agg.get(key) ?? 0) + 1)
        }
        for (const [key, count] of agg) {
          const [subject, chapterTitle] = key.split('|')
          const failRate = Math.min(99, count * 15)
          const severity = failRate >= 50 ? 'critical' : failRate >= 30 ? 'at_risk' : 'safe'
          heatmap.push({ subject, chapterTitle, failRatePct: failRate, severity })
        }
      } catch {
        // Empty heatmap
      }
    }

    return NextResponse.json({
      ok: true,
      data: { northStar, funnel, heatmap } satisfies AdminDashboardData
    })
  } catch (e) {
    const msg = e instanceof Error ? e.message : 'Unknown error'
    return NextResponse.json({ ok: false, error: msg }, { status: 500 })
  }
}
