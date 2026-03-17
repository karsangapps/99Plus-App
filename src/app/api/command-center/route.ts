import { NextResponse } from 'next/server'
import { getUidFromCookies } from '@/lib/session'
import { getStudentProfileId } from '@/lib/studentProfile'
import { getInsforgeAdminClient } from '@/lib/insforgeAdmin'

export type CommandCenterData = {
  heatmap: {
    targetName: string
    program: string
    college: string
    seatStatus: string
    probabilityPct: number
    scoreGap: number
    simulatedPercentile: number
  }[]
  proficiency: { subject: string; accuracyPct: number; attemptedCount: number }[]
  masteryTrend: { attemptNumber: number; simulatedPercentile: number; submittedAt: string }[]
  stats: {
    predictedPercentile: number
    leaksSealed: number
    leaksTotal: number
    drillsCompleted: number
    creditsBalance: number
  }
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
    const heatmap: CommandCenterData['heatmap'] = []
    const proficiency: CommandCenterData['proficiency'] = []
    const masteryTrend: CommandCenterData['masteryTrend'] = []
    let leaksSealed = 0
    let leaksTotal = 0
    let drillsCompleted = 0
    let creditsBalance = 0
    let latestPercentile = 0

    try {
      const analyticsRes = await db.database
        .from('college_target_analytics')
        .select('seat_status, probability_pct, score_gap, simulated_percentile, user_target_id')
        .eq('student_profile_id', studentProfileId)
        .order('created_at', { ascending: false })
        .limit(20)

      if (!analyticsRes.error && Array.isArray(analyticsRes.data)) {
        const targetIds = [...new Set(
          (analyticsRes.data as { user_target_id: string }[])
            .map((r) => r.user_target_id)
            .filter(Boolean)
        )]
        let targetNames: Record<string, { university: string; college: string; program: string }> = {}
        if (targetIds.length > 0) {
          const targetsRes = await db.database
            .from('user_targets')
            .select('id, university_id, college_id, program_id, universities(name), colleges(name), programs(name)')
            .in('id', targetIds)
          if (!targetsRes.error && Array.isArray(targetsRes.data)) {
            for (const t of targetsRes.data as Record<string, unknown>[]) {
              const uni = (t.universities as { name: string })?.name ?? 'Unknown'
              const col = (t.colleges as { name: string })?.name ?? 'Unknown'
              const prog = (t.programs as { name: string })?.name ?? 'Unknown'
              targetNames[String(t.id)] = { university: uni, college: col, program: prog }
            }
          }
        }
        for (const row of analyticsRes.data as Record<string, unknown>[]) {
          const info = targetNames[String(row.user_target_id)] ?? { university: '—', college: '—', program: '—' }
          heatmap.push({
            targetName: `${info.university} — ${info.college}`,
            program: info.program,
            college: info.college,
            seatStatus: String(row.seat_status ?? 'reach'),
            probabilityPct: Number(row.probability_pct ?? 0),
            scoreGap: Number(row.score_gap ?? 0),
            simulatedPercentile: Number(row.simulated_percentile ?? 0)
          })
        }
        if (heatmap.length > 0) latestPercentile = heatmap[0].simulatedPercentile
      }
    } catch {
      // Table may not exist
    }

    try {
      const leaksRes = await db.database
        .from('mark_leaks')
        .select('is_resolved')
        .eq('student_profile_id', studentProfileId)

      if (!leaksRes.error && Array.isArray(leaksRes.data)) {
        leaksTotal = leaksRes.data.length
        leaksSealed = (leaksRes.data as { is_resolved: boolean }[]).filter(
          (r) => r.is_resolved
        ).length
      }
    } catch {
      // Table may not exist
    }

    try {
      const attemptsRes = await db.database
        .from('mock_attempts')
        .select('attempt_number, simulated_percentile, submitted_at')
        .eq('student_profile_id', studentProfileId)
        .not('submitted_at', 'is', null)
        .order('submitted_at', { ascending: false })
        .limit(10)

      if (!attemptsRes.error && Array.isArray(attemptsRes.data)) {
        for (const row of attemptsRes.data as { attempt_number: number; simulated_percentile: number | null; submitted_at: string }[]) {
          masteryTrend.push({
            attemptNumber: row.attempt_number ?? 0,
            simulatedPercentile: Number(row.simulated_percentile ?? 0),
            submittedAt: row.submitted_at ?? ''
          })
        }
        if (masteryTrend.length > 0 && masteryTrend[0].simulatedPercentile > 0) {
          latestPercentile = masteryTrend[0].simulatedPercentile
        }
      }
    } catch {
      // Table may not exist
    }

    try {
      const attemptsIdsRes = await db.database
        .from('mock_attempts')
        .select('id')
        .eq('student_profile_id', studentProfileId)
      const attemptIds = (attemptsIdsRes.data as { id: string }[] | null)?.map((a) => a.id) ?? []
      if (attemptIds.length > 0) {
        const respRes = await db.database
          .from('mock_responses')
          .select('is_correct, question_bank(subject)')
          .in('mock_attempt_id', attemptIds)
        if (!respRes.error && Array.isArray(respRes.data)) {
          const bySubject = new Map<string, { correct: number; total: number }>()
          for (const row of respRes.data as { is_correct: boolean | null; question_bank?: { subject?: string } | { subject?: string }[] | null }[]) {
            const qb = row.question_bank
            const subject = (Array.isArray(qb) ? qb[0]?.subject : qb?.subject) ?? 'Unknown'
            const existing = bySubject.get(subject) ?? { correct: 0, total: 0 }
            existing.total += 1
            if (row.is_correct) existing.correct += 1
            bySubject.set(subject, existing)
          }
          for (const [subject, { correct, total }] of bySubject) {
            proficiency.push({
              subject,
              accuracyPct: total > 0 ? Math.round((correct / total) * 100) : 0,
              attemptedCount: total
            })
          }
        }
      }
    } catch {
      // Tables may not exist
    }

    try {
      const sessionsRes = await db.database
        .from('practice_sessions')
        .select('id')
        .eq('student_profile_id', studentProfileId)
        .eq('status', 'completed')
      drillsCompleted = (sessionsRes.data as unknown[] | null)?.length ?? 0
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

    const data: CommandCenterData = {
      heatmap,
      proficiency,
      masteryTrend,
      stats: {
        predictedPercentile: latestPercentile,
        leaksSealed,
        leaksTotal,
        drillsCompleted,
        creditsBalance
      }
    }

    return NextResponse.json({ ok: true, data })
  } catch (e) {
    const msg = e instanceof Error ? e.message : 'Unknown error'
    return NextResponse.json({ ok: false, error: msg }, { status: 500 })
  }
}
